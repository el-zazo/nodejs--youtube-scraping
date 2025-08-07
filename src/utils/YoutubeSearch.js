const ytsr = require("@distube/ytsr");
const { separateNumbers, isObject, secondsToDuration, datetimeToDuration } = require("@el-zazo/main-utils");

// Helpers
const { Playlist } = require("./Playlist");
const { Video } = require("./Video");

/**
 * @typedef {Object} SearchResponse
 * @property {Object|null} results - The search results or null if error
 * @property {boolean} err - Error flag
 * @property {string} err_msg - Error message
 */

/**
 * @typedef {Object} VideoItem
 * @property {string} type - Always "video"
 * @property {string} id - Video ID
 * @property {string} name - Video title
 * @property {string} url - Video URL
 * @property {string} views - Formatted view count
 * @property {string} duration - Formatted duration
 * @property {string} uploadedAt - Upload date
 * @property {string|Object} thumbnail - Thumbnail URL or object
 * @property {string} author_name - Channel name
 * @property {string} author_url - Channel URL
 * @property {string|null} author_img_url - Channel avatar URL
 */

/**
 * @typedef {Object} PlaylistItem
 * @property {string} type - Always "playlist"
 * @property {string} id - Playlist ID
 * @property {string} name - Playlist title
 * @property {string} url - Playlist URL
 * @property {string} views - Formatted view count
 * @property {string|Object} thumbnail - Thumbnail URL or object
 * @property {string} author_name - Channel name
 * @property {string} author_url - Channel URL
 * @property {string|null} author_img_url - Channel avatar URL
 * @property {number} number_videos - Number of videos in playlist
 */

/**
 * Youtube Search Helper
 * Provides methods to search and retrieve YouTube content
 */
class YoutubeSearch {
  /**
   * Perform a basic YouTube search using ytsr
   * @param {string} type - Search type ("video" or "playlist")
   * @param {string} query - Search query
   * @returns {Promise<SearchResponse>} Search results
   */
  static async main_ytsr(type, query) {
    try {
      const results = await ytsr(query, { type });

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: error.message,
      };
    }
  }

  /**
   * Search for videos on YouTube
   * @param {string} query - Search query
   * @returns {Promise<SearchResponse>} Video search results
   */
  static async searchVideos(query) {
    try {
      // Get video search results with a limit of 100 items
      const { items: allItems } = await ytsr(query, { type: "video", limit: 100 });

      // Process each video item to extract relevant information
      const items = allItems.map((video) => {
        // Extract video information
        const { id, name, url, thumbnail, author, views, duration, uploadedAt } = video;

        // Extract author information
        const { name: authorName, url: authorUrl, avatars } = author;

        // Get author avatar URL if available
        const authorImgUrl = avatars.length > 0 ? avatars[0].url : null;

        // Return formatted video information
        return {
          type: "video",
          id,
          name,
          url,
          views: separateNumbers(views),
          duration,
          uploadedAt,
          thumbnail,
          author_name: authorName,
          author_url: authorUrl,
          author_img_url: authorImgUrl,
        };
      });

      // Create results object with item count and items array
      const results = { number_items: items.length, items };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `Failed to search videos: ${error.message}`,
      };
    }
  }

  /**
   * Search for playlists on YouTube
   * @param {string} query - Search query
   * @returns {Promise<SearchResponse>} Playlist search results
   */
  static async searchPlaylists(query) {
    try {
      // Get playlist search results
      const { items: playlists } = await ytsr(query, { type: "playlist" });
      const items = [];

      // Process each playlist to extract relevant information
      for (const playlist of playlists) {
        // Extract playlist information
        const { id, name, url, thumbnail, author, views } = playlist;

        // Extract author information
        const { name: authorName, url: authorUrl, avatars } = author;

        // Get author avatar URL if available
        const authorImgUrl = avatars.length > 0 ? avatars[0].url : null;

        // Get number of videos in the playlist
        const { numberVideo } = await Playlist.numberVideo(url);

        // Create formatted playlist item
        const item = {
          type: "playlist",
          id,
          name,
          url,
          views: separateNumbers(views),
          thumbnail,
          author_name: authorName,
          author_url: authorUrl,
          author_img_url: authorImgUrl,
          number_videos: numberVideo,
        };

        items.push(item);
      }

      // Create results object with item count and items array
      const results = { number_items: items.length, items };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `Failed to search playlists: ${error.message}`,
      };
    }
  }

  /**
   * Search YouTube by type and query
   * @param {string} type - Search type ("video" or "playlist")
   * @param {string} query - Search query
   * @returns {Promise<SearchResponse>} Search results
   */
  static async search(type, query) {
    try {
      if (type === "video") {
        return await this.searchVideos(query);
      } else if (type === "playlist") {
        return await this.searchPlaylists(query);
      } else {
        return {
          results: null,
          err: true,
          err_msg: `Invalid search type: ${type}. Must be "video" or "playlist".`,
        };
      }
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `Search error: ${error.message}`,
      };
    }
  }

  /**
   * Prepare and format origin video information
   * @param {Object} videoData - Raw video data
   * @returns {VideoItem} Formatted video information
   * @private
   */
  static #prepareOriginVideoInfo(videoData) {
    // Return as-is if not an object
    if (!isObject(videoData)) return videoData;

    // Extract video information with defaults
    const { videoId: id, title: name = null, video_url: url = null, thumbnail = null, author = {}, viewCount = null, lengthSeconds = null, uploadDate = null } = videoData;

    // Extract author information with defaults
    const { name: authorName = null, user_url: authorUrl = null, thumbnails = [] } = author || {};

    // Get author avatar URL if available
    const authorImgUrl = Array.isArray(thumbnails) && thumbnails.length > 0 ? thumbnails[0].url : null;

    // Process thumbnail URL
    const thumbnailUrl = thumbnail && Array.isArray(thumbnail.thumbnails) && thumbnail.thumbnails.length > 0 ? thumbnail.thumbnails[0].url : null;

    // Format values
    const views = separateNumbers(viewCount);
    const duration = secondsToDuration(lengthSeconds);
    const uploadedAt = datetimeToDuration(uploadDate);

    // Return formatted video information
    return {
      type: "video",
      id,
      name,
      url,
      views,
      duration,
      uploadedAt,
      thumbnail: thumbnailUrl,
      author_name: authorName,
      author_url: authorUrl,
      author_img_url: authorImgUrl,
    };
  }

  /**
   * Prepare and format recommended video information
   * @param {Object} videoData - Raw video data
   * @returns {VideoItem} Formatted video information
   * @private
   */
  static #prepareRecommendations(videoData) {
    // Return as-is if not an object
    if (!isObject(videoData)) return videoData;

    // Extract video information with defaults
    const { title: name = null, id = null, thumbnails: videoThumbnails = [], author = {}, view_count = null, length_seconds = null, published: uploadedAt = null } = videoData;

    // Generate video URL from ID
    const url = id !== null ? `https://www.youtube.com/watch?v=${id}` : null;

    // Get thumbnail URL if available
    const thumbnail = Array.isArray(videoThumbnails) && videoThumbnails.length > 0 ? videoThumbnails[0].url : null;

    // Extract author information with defaults
    const { name: authorName = null, user_url: authorUrl = null, thumbnails: authorThumbnails = [] } = author || {};

    // Get author avatar URL if available
    const authorImgUrl = Array.isArray(authorThumbnails) && authorThumbnails.length > 0 ? authorThumbnails[0].url : null;

    // Format values
    const views = separateNumbers(view_count);
    const duration = secondsToDuration(length_seconds);

    // Return formatted video information
    return {
      type: "video",
      id,
      name,
      url,
      views,
      duration,
      uploadedAt,
      thumbnail,
      author_name: authorName,
      author_url: authorUrl,
      author_img_url: authorImgUrl,
    };
  }

  /**
   * Get video information and recommended videos
   * @param {string} url - YouTube video URL
   * @returns {Promise<SearchResponse>} Video and recommendations
   */
  static async videoAndRecommendations(url) {
    try {
      // Get video information
      const { VideoData, err, err_msg } = await Video.main_getInfo(url);

      // Return error if video info retrieval failed
      if (err) {
        return {
          results: null,
          err,
          err_msg,
        };
      }

      // Prepare origin video information
      const originVideoInfo = this.#prepareOriginVideoInfo(VideoData.videoDetails);

      // Prepare recommendations videos information
      const recommendations = VideoData.related_videos.map((video) => this.#prepareRecommendations(video));

      // Create results object
      const results = {
        origin_video_info: originVideoInfo,
        recommendations,
      };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return {
        results: null,
        err: true,
        err_msg: `Failed to get video and recommendations: ${error.message}`,
      };
    }
  }
}

module.exports = { YoutubeSearch };
