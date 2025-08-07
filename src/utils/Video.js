const { getInfo } = require("@distube/ytdl-core");

// Data imports
const { D_Q } = require("../constants/default_qualitys");
const { ALL_TYPES } = require("../constants/all_types");
const { MAIN_GET_INFO_OPTIONS } = require("../options/main_get_info_options");

/**
 * @typedef {Object} VideoResponse
 * @property {Object|null} VideoData - The video data or null if error
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * @typedef {Object} DownloadResponse
 * @property {string|null} results - Download link or error message
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * Youtube Video Helper
 * Provides methods to extract and process YouTube video information
 */
class Video {
  /**
   * All available video types
   * @type {string[]}
   */
  static ALL_TYPES = ALL_TYPES;

  /**
   * Get raw video information using ytdl-core
   * @param {string} url - YouTube video URL
   * @returns {Promise<VideoResponse>} Video information response
   */
  static async main_getInfo(url) {
    try {
      const info = await getInfo(url);
      return { VideoData: info, err: false, err_msg: "" };
    } catch (error) {
      return { VideoData: null, err: true, err_msg: error.message };
    }
  }

  /**
   * Get processed video information with filtering options
   * @param {string} url - YouTube video URL
   * @param {Object} getInfoOptions - Options for filtering video formats
   * @param {number} [getInfoOptions.VideoNumber=1] - Video number for ordering
   * @param {string} [getInfoOptions.VideoDataType="json"] - Response format ("json" or "text")
   * @param {string[]} [getInfoOptions.types=ALL_TYPES] - Video types to include
   * @param {Object} [getInfoOptions.qualitys=D_Q] - Quality filters
   * @returns {Promise<VideoResponse>} Processed video information
   */
  static async getInfo(url, getInfoOptions = {}) {
    // Merge default options with provided options
    let { VideoNumber, VideoDataType, types, qualitys } = {
      ...MAIN_GET_INFO_OPTIONS,
      ...getInfoOptions,
    };

    // Normalize VideoDataType
    VideoDataType = VideoDataType?.trim().toLowerCase() || "json";

    try {
      // Extract video information
      const info = await getInfo(url);

      // Extract essential details
      const { videoId: id, title, video_url } = info.videoDetails;

      // Process formats through pipeline
      let formats = this.#prepare_formats(info.formats, VideoNumber, title);
      formats = this.#filter_formats_by_types(formats, types);
      formats = this.#filter_formats_by_qualitys(formats, qualitys);

      // Create video data object
      let VideoData = { id, title, video_url, formats };

      // Convert to text format if requested
      if (VideoDataType === "text") {
        VideoData = this.#data_to_text(VideoData);
      }

      return { VideoData, err: false, err_msg: "" };
    } catch (error) {
      return {
        VideoData: null,
        err: true,
        err_msg: `Failed to get video info: ${error.message}`,
      };
    }
  }

  /**
   * Process and enhance format information for each video format
   * @param {Array} formats - Raw formats from ytdl-core
   * @param {number} videoNumber - Video number for ordering
   * @param {string} videoTitle - Video title
   * @returns {Array} Enhanced format objects
   * @private
   */
  static #prepare_formats(formats, videoNumber = 1, videoTitle = "video title") {
    // Sanitize video title by replacing special characters
    videoTitle = videoTitle.replace(/([\/|#])/gi, "~");

    // Process each format
    return formats
      .filter((format) => Object.keys(format).includes("mimeType"))
      .map((format) => {
        const { mimeType, qualityLabel: quality, hasAudio } = format;

        // Extract and determine format properties
        const str_mimeType = mimeType.split("; ")[0];
        const hasVideo = quality != null;
        const type = hasVideo && hasAudio ? "video and audio" : hasVideo ? "video" : hasAudio ? "audio" : "others";

        // Create descriptive title
        const title = `${str_mimeType} [${hasVideo ? quality : ""}] [${hasAudio ? "+audio" : "-audio"}]`;

        // Add video number and title to URL for better organization
        const url = format.url.replace(/\/videoplayback\?/gi, `/videoplayback/${videoNumber} - ${videoTitle}?`);

        return {
          title,
          mimeType,
          hasVideo,
          hasAudio,
          type,
          quality,
          url,
        };
      });
  }

  /**
   * Filter formats by specified types
   * @param {Array} formats - Format objects
   * @param {Array} types - Types to include
   * @returns {Array} Filtered formats
   * @private
   */
  static #filter_formats_by_types(formats, types) {
    // Validate types parameter
    if (!Array.isArray(types)) {
      console.warn("Types in Video.filter_formats_by_types must be an array. Using unfiltered formats.");
      return formats;
    }

    // Filter formats by type
    return formats.filter((format) => types.includes(format.type));
  }

  /**
   * Filter formats by quality specifications
   * @param {Array} formats - Format objects
   * @param {Object} qualitys - Quality filters
   * @returns {Array} Filtered formats
   * @private
   */
  static #filter_formats_by_qualitys(formats, qualitys = {}) {
    // Merge with default qualities
    qualitys = { ...D_Q, ...qualitys };

    // Create regex pattern from enabled qualities
    const enabledQualities = Object.entries(qualitys)
      .filter(([_, enabled]) => enabled)
      .map(([quality]) => quality)
      .join("|");

    // If no qualities are enabled, return all formats
    if (!enabledQualities) return formats;

    // Create and apply regex filter
    const regExp = new RegExp(`(${enabledQualities})`, "gi");
    return formats.filter((format) => regExp.test(format.title));
  }

  /**
   * Convert video data to formatted text
   * @param {Object} videoData - Video data object
   * @returns {string} Formatted text representation
   * @private
   */
  static #data_to_text(videoData) {
    const { id, title, video_url, formats } = videoData;

    // Create header with video details
    const separator = "-".repeat(100);
    const header = `ID          : ${id}\nTitle       : ${title}\nYoutube Url : ${video_url}`;

    // Format each video format
    const formattedFormats = formats.map((format) => `Type : ${format.title}\nUrl  : ${format.url}`).join("\n\n");

    return `${header}\n${separator}\n\n${formattedFormats}`;
  }

  /**
   * Get a single download link based on specified filters
   * @param {string} videoUrl - YouTube video URL
   * @param {number} [videoNumber=1] - Video number for ordering
   * @param {Array} [types=["video and audio"]] - Types to include
   * @param {Object} [qualitys={}] - Quality filters
   * @returns {Promise<DownloadResponse>} Download link response
   */
  static async getDownloadLink(videoUrl, videoNumber = 1, types = ["video and audio"], qualitys = {}) {
    const contextInfo = `| N: ${videoNumber} | url: ${videoUrl}`;

    try {
      // Get video info with filters
      const { VideoData, err, err_msg } = await this.getInfo(videoUrl, {
        VideoNumber: videoNumber,
        types,
        qualitys,
      });

      if (err) {
        throw new Error(err_msg);
      }

      // Extract first matching format URL
      const { formats } = VideoData;
      if (formats.length === 0) {
        return {
          results: `No download link found ${contextInfo}`,
          err: false,
          err_msg: "",
        };
      }

      return {
        results: formats[0].url,
        err: false,
        err_msg: "",
      };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `ERROR: In Get Download Link ${contextInfo} | ERROR MESSAGE: ${error.message}`,
      };
    }
  }

  /**
   * Get download links for multiple videos
   * @param {Array<string>|string} videoUrls - YouTube video URL(s)
   * @param {Array} [types=["video and audio"]] - Types to include
   * @param {Object} [qualitys={}] - Quality filters
   * @returns {Promise<DownloadResponse>} Combined download links response
   */
  static async getDownloadLinkForMany(videoUrls = [], types = ["video and audio"], qualitys = {}) {
    try {
      // Normalize input to array
      if (typeof videoUrls === "string") {
        videoUrls = [videoUrls];
      }

      // Process each video URL
      const links = [];
      for (let i = 0; i < videoUrls.length; i++) {
        const { results: link, err, err_msg } = await this.getDownloadLink(videoUrls[i], i + 1, types, qualitys);

        links.push(err ? err_msg : link);
      }

      // Combine results
      return {
        results: links.join("\n\n"),
        err: false,
        err_msg: "",
      };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `Error in Get Dowanload Link For Many : ${error.message}`,
      };
    }
  }
}

module.exports = { Video };
