const ytpl = require("ytpl");

// Helpers
const { Video } = require("./Video");

// Options
const { GET_DOWNLOADS_LINKS_OPTIONS } = require("../options/get_downloads_links_options");

/**
 * @typedef {Object} PlaylistResponse
 * @property {Object|null} PlaylistData - The playlist data or null if error
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * @typedef {Object} NumberVideoResponse
 * @property {number|null} numberVideo - Number of videos in playlist or null if error
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * @typedef {Object} DownloadLinksResponse
 * @property {string[]|string|null} results - Download links or error message
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * Youtube Playlist Helper
 * Provides methods to extract and process YouTube playlist information
 */
class Playlist {
  /**
   * Get raw playlist information using ytpl
   * @param {string} url - YouTube playlist URL
   * @param {number} [limit=1] - Maximum number of items to retrieve
   * @returns {Promise<PlaylistResponse>} Playlist information response
   */
  static async main_ytpl(url = "", limit = 1) {
    try {
      // Validate and normalize limit
      const normalizedLimit = isNaN(limit) ? 1 : limit;

      // Extract playlist info
      const PlaylistData = await ytpl(url, { limit: normalizedLimit });

      return { PlaylistData, err: false, err_msg: "" };
    } catch (error) {
      return {
        PlaylistData: null,
        err: true,
        err_msg: error.message,
      };
    }
  }

  /**
   * Get the number of videos in a playlist
   * @param {string} url - YouTube playlist URL
   * @returns {Promise<NumberVideoResponse>} Number of videos response
   */
  static async numberVideo(url = "") {
    console.log("Start Get Number Videos");

    try {
      // Extract estimated item count from playlist
      const { estimatedItemCount } = await ytpl(url);
      console.log("estimatedItemCount:", estimatedItemCount);

      return {
        numberVideo: parseInt(estimatedItemCount),
        err: false,
        err_msg: "",
      };
    } catch (error) {
      console.log("Error in Get Number Videos");

      return {
        numberVideo: null,
        err: true,
        err_msg: error.message,
      };
    }
  }

  /**
   * Get detailed information about a YouTube playlist
   * @param {string} url - YouTube playlist URL
   * @param {boolean} [withDownloadLinks=false] - Whether to include download links
   * @returns {Promise<PlaylistResponse>} Playlist information response
   */
  static async getInfo(url = "", withDownloadLinks = false) {
    try {
      // Extract complete playlist data
      const data = await ytpl(url, { limit: "Infinity" });

      // Extract and organize essential information
      const { id, title, items } = data;
      let PlaylistData = {
        id,
        title,
        url,
        number_videos: items.length,
        videos: {},
      };

      // Process each video in the playlist
      items.forEach((video, index) => {
        PlaylistData.videos[index + 1] = {
          id: video.id,
          title: video.title,
          video_url: video.url,
        };
      });

      // Add download links if requested
      if (withDownloadLinks) {
        PlaylistData = await this.#add_download_links(PlaylistData);
      }

      return { PlaylistData, err: false, err_msg: "" };
    } catch (error) {
      return {
        PlaylistData: null,
        err: true,
        err_msg: `Failed to get playlist info: ${error.message}`,
      };
    }
  }

  /**
   * Add download links to each video in the playlist data
   * @param {Object} PlaylistData - Playlist data object
   * @returns {Promise<Object>} Enhanced playlist data with download links
   * @private
   */
  static async #add_download_links(PlaylistData) {
    for (const [videoNumber, { video_url }] of Object.entries(PlaylistData.videos)) {
      // Get download data for current video
      const { VideoData, err, err_msg } = await Video.getInfo(video_url, {
        VideoNumber: videoNumber,
      });

      // Add formats to video data or error message if failed
      PlaylistData.videos[videoNumber].formats = !err && VideoData.formats ? VideoData.formats : `Error in Get Video Info | ERROR MESSAGE: ${err_msg}`;
    }

    return PlaylistData;
  }

  /**
   * Prepare and validate 'from' and 'to' range parameters
   * @param {string} url - YouTube playlist URL
   * @param {number|null} from - Starting video index
   * @param {number|null} to - Ending video index
   * @returns {Promise<Object>} Validation result with normalized range
   * @private
   */
  static async #prepare_from_to(url, from, to) {
    try {
      // Get total number of videos in playlist
      const { numberVideo, err, err_msg } = await this.numberVideo(url);

      // Handle error in retrieving video count
      if (err) {
        return {
          succ: false,
          msg_err: `Error in Get Number Videos in Playlist | ERROR MESSAGE: ${err_msg}`,
          from: null,
          to: null,
        };
      }

      // Normalize range values
      let normalizedFrom = from === null || isNaN(from) ? 1 : Number(from);
      let normalizedTo = to === null || isNaN(to) ? numberVideo : Number(to);

      // Validate range values
      if (normalizedFrom <= 0 || normalizedTo <= 0) {
        return {
          succ: false,
          msg_err: `ERROR: From '${normalizedFrom}' and To '${normalizedTo}' must be greater than 0`,
          from: null,
          to: null,
        };
      }

      if (normalizedFrom > normalizedTo) {
        return {
          succ: false,
          msg_err: `ERROR: From '${normalizedFrom}' must be less than or equal to To '${normalizedTo}'`,
          from: null,
          to: null,
        };
      }

      if (normalizedFrom > numberVideo || normalizedTo > numberVideo) {
        return {
          succ: false,
          msg_err: `ERROR: From '${normalizedFrom}' and To '${normalizedTo}' must not be greater than the number of videos in playlist (${numberVideo})`,
          from: null,
          to: null,
        };
      }

      // Return validated range
      return {
        succ: true,
        msg_err: "",
        from: normalizedFrom,
        to: normalizedTo,
      };
    } catch (error) {
      // Handle unexpected errors
      return {
        succ: false,
        msg_err: `Unexpected error in prepare_from_to: ${error.message}`,
        from: null,
        to: null,
      };
    }
  }

  /**
   * Get download links for a range of videos in a playlist
   * @param {string} url - YouTube playlist URL
   * @param {Object} [options={}] - Download options
   * @param {string} [options.VideoDataType="json"] - Response format ("json" or "text")
   * @param {string[]} [options.types=["video and audio"]] - Video types to include
   * @param {number|null} [options.from=null] - Starting video index
   * @param {number|null} [options.to=null] - Ending video index
   * @param {Object} [options.qualitys={}] - Quality filters
   * @returns {Promise<DownloadLinksResponse>} Download links response
   */
  static async getDownloadsLinks(url = "", options = {}) {
    // Merge default options with provided options
    const { VideoDataType, types, from: initialFrom, to: initialTo, qualitys } = { ...GET_DOWNLOADS_LINKS_OPTIONS, ...options };

    // Normalize response format
    const responseFormat = VideoDataType?.toLowerCase().trim() || "json";

    // Validate and prepare range parameters
    const { succ, msg_err, from, to } = await this.#prepare_from_to(url, initialFrom, initialTo);
    if (!succ) {
      return {
        results: null,
        err: true,
        err_msg: msg_err,
      };
    }

    console.log(from, to);

    try {
      // Get playlist information
      const { PlaylistData, err: playlistError, err_msg: playlistErrorMsg } = await this.getInfo(url);

      if (playlistError) {
        throw new Error(`Error in download playlist data: ${playlistErrorMsg}`);
      }

      // Initialize results container based on response format
      let downloadLinks = responseFormat === "text" ? "" : [];

      // Helper function to add links to results
      const addLink = (link) => {
        if (responseFormat === "text") {
          downloadLinks += `${link}\n`;
        } else {
          downloadLinks.push(link);
        }
      };

      // Process each video in the specified range
      for (let videoIndex = from; videoIndex <= to; videoIndex++) {
        console.log("Start:", videoIndex + 1);

        // Get video URL if it exists
        const videoExists = String(videoIndex) in PlaylistData.videos && "video_url" in PlaylistData.videos[videoIndex];

        const videoUrl = videoExists ? PlaylistData.videos[videoIndex].video_url : null;

        if (videoUrl) {
          // Get download link for this video
          const downloadResult = await Video.getDownloadLink(videoUrl, videoIndex, types, qualitys);
          addLink(downloadResult);
        } else {
          addLink(`Video URL not found | N: ${videoIndex}`);
        }
      }

      return {
        results: downloadLinks,
        err: false,
        err_msg: "",
      };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: error.message,
      };
    }
  }
}

module.exports = { Playlist };
