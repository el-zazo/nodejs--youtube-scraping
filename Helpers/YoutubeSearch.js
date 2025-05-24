const ytsr = require("@distube/ytsr");
const { separateNumbers } = require("@elzazo/main-utils");

// Helpers
const { Playlist } = require("./Playlist");
const { Video } = require("./Video");
const { prepareOriginVideoInfo, prepareRecommandations } = require("./video_recommandations_helpers");

/**
 * ## Search In Youtube
 */
class YoutubeSearch {
  /**
   * ### Main ytsr
   *
   * #### All Types:
   * - `video`
   * - `playlist`
   */
  static async main_ytsr(type, query) {
    try {
      const results = await ytsr(query, { type });

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return { results: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Search For Videos
   */
  static async searchVideos(query) {
    try {
      const { items: all_items } = await ytsr(query, { type: "video", limit: 100 });
      const items = all_items.map((video) => {
        // Video Info
        const { id, name, url, thumbnail, author, views, duration, uploadedAt } = video;

        // Author Info
        const { name: author_name, url: author_url, avatars } = author;

        // Author Image
        const author_img_url = avatars.length > 0 ? avatars[0].url : null;

        // Return Info Complete
        return { type: "video", id, name, url, views: separateNumbers(views), duration, uploadedAt, thumbnail, author_name, author_url, author_img_url };
      });
      const results = { number_items: items.length, items };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return { results: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Search For Playlists
   */
  static async searchPlaylists(query) {
    try {
      const { items: playlists } = await ytsr(query, { type: "playlist" });
      const items = [];

      for (let playlist of playlists) {
        // Playlist Info
        const { id, name, url, thumbnail, author, views } = playlist;

        // Author Info
        const { name: author_name, url: author_url, avatars } = author;

        // Author Image
        const author_img_url = avatars.length > 0 ? avatars[0].url : null;

        // Get Number Videos
        const number_videos = await Playlist.numberVideo(url);

        // Return Info Complete
        const item = { type: "playlist", id, name, url, views: separateNumbers(views), thumbnail, author_name, author_url, author_img_url, number_videos };

        items.push(item);
      }

      const results = { number_items: items.length, items };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return { results: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Search By Type And Query
   *
   * #### All Types:
   * - `video`
   * - `playlist`
   */
  static async search(type, query) {
    if (type === "video") return await YoutubeSearch.searchVideos(query);
    else if (type === "playlist") return await YoutubeSearch.searchPlaylists(query);
    else return { results: null, err: true, err_msg: "Invalid Search Type" };
  }

  /**
   * ### Get Video Info And Here Recommandations Videos
   */
  static async videoAndRecommandations(url) {
    try {
      const { VideoData, err, err_msg } = await Video.main_getInfo(url);

      // Error
      if (err) return { results: null, err, err_msg };

      // Prepare Origin Video Info
      const origin_video_info = prepareOriginVideoInfo(VideoData.videoDetails);

      // Prepare Recommandations Videos Info
      const recommandations = VideoData.related_videos.map((video) => prepareRecommandations(video));

      // Result
      const results = { origin_video_info, recommandations };

      return { results, err: false, err_msg: "" };
    } catch (error) {
      return { results: null, err: true, err_msg: error.message };
    }
  }
}

module.exports = { YoutubeSearch };
