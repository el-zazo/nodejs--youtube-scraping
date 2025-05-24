const ytpl = require("ytpl");

// Helpers
const { Video } = require("./Video");

// Default Options For Get Downloads Links
const { GET_DOWNLOADS_LINKS_OPTIONS } = require("../options/get_downloads_links_options");

/**
 * ## Youtube Playlist Helper
 */
class Playlist {
  /**
   * ### Main ytpl method
   *
   * @param {string} url
   * @param {number} limit -- default is `1`
   */
  static async main_ytpl(url = "", limit = 1) {
    try {
      // Extract Info From URL
      const PlaylistData = await ytpl(url, { limit: isNaN(limit) ? 1 : limit });

      return { PlaylistData, err: false, err_msg: "" };
    } catch (error) {
      return { PlaylistData: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Get Number Videos In Playlist
   */
  static async numberVideo(url = "") {
    try {
      // Extract Complete Data For a Playlist
      const { estimatedItemCount } = await ytpl(url);

      // Return Result
      return { numberVideo: parseInt(estimatedItemCount), err: false, err_msg: "" };
    } catch (error) {
      return { numberVideo: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Get Youtube Playlist Info
   *
   * _default `limit` is `Infinity`_\
   * _default `withDownloadLinks` is `false` | Set `true` for add download links in every video data_
   */
  static async getInfo(url = "", withDownloadLinks = false) {
    try {
      // Extract Complete Data For a Playlist
      const data = await ytpl(url, { limit: "Infinity" });

      // Select My Info
      const { id, title, items } = data;
      let PlaylistData = { id, title, url, number_videos: items.length, videos: {} };
      items.forEach((v, i) => (PlaylistData.videos[+i + 1] = { id: v.id, title: v.title, video_url: v.url }));

      // Add Download Links if is true
      if (withDownloadLinks) PlaylistData = await Playlist.#add_download_links(PlaylistData);

      // Return Result
      return { PlaylistData, err: false, err_msg: "" };
    } catch (error) {
      return { PlaylistData: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Add Download Links To a `PlaylistData`
   */
  static async #add_download_links(PlaylistData) {
    for (const [n, { video_url }] of Object.entries(PlaylistData.videos)) {
      // Get Complete Download Data For Current Video
      const { VideoData, err, err_msg } = await Video.getInfo(video_url, { VideoNumber: n });

      // Update Video Data in Result
      PlaylistData.videos[n].formats = !err && VideoData.formats ? VideoData.formats : `Error in Get Video Info | ERROR MESSAGE : ${err_msg}`;
    }

    return PlaylistData;
  }

  /**
   * ### Prepare From & To
   *
   * _return is `{succ: boolean, msg_err: String, from: number, to: number}`
   */
  static async #prepare_from_to(url, from, to) {
    let msg_err;
    const err_in_nv = (e) => `Error in Get Number Videos in Playlist | ERROR MESSAGE : ${e}`;

    if (from === null || to === null || isNaN(from) || isNaN(to)) {
      const { numberVideo, err, err_msg } = await this.numberVideo(url);
      msg_err = err ? err_in_nv(err_msg) : "";

      return { succ: !err, msg_err, from: 1, to: numberVideo };
    } else {
      [from, to] = [+from, +to];

      // Check (From & To => 0) and (From <= To)
      const err_msg_1 = `ERROR: From '${from}' And To '${to}' Must Be an Number Grett Them 0`;
      const err_msg_2 = `ERROR: From '${from}' Must be less then or equale [<=] To '${to}'`;
      msg_err = from <= 0 || to <= 0 ? err_msg_1 : from > to ? err_msg_2 : null;

      if (msg_err !== null) return { succ: false, msg_err, from: null, to: null };

      // Check if [From, To] Not in Number Video
      const { numberVideo, err, err_msg } = await this.numberVideo(url);
      const succ = !err && (from > numberVideo || to > numberVideo);
      if (err) msg_err = err_in_nv(err_msg);
      else if (!succ) msg_err = `ERROR: From '${from}' And To '${to}' Must Not Be Grett Them Number Videos in Playlist '${numberVideo}'`;
      else msg_err = "";

      return { succ, msg_err, from, to };
    }
  }

  /**
   * ### Get Just Download Links For A Range of Videos
   *
   * _if from or to is not correct return all videos_
   * @param {String} url
   * @param {GET_DOWNLOADS_LINKS_OPTIONS} options
   */
  static async getDownloadsLinks(url = "", options) {
    let { VideoDataType, types, from: init_from, to: init_to, qualitys } = { ...GET_DOWNLOADS_LINKS_OPTIONS, ...options };
    VideoDataType = VideoDataType.toLowerCase().trim();

    // Prepare From & To
    const { succ, msg_err, from, to } = await this.#prepare_from_to(url, init_from, init_to);
    if (!succ) return { results: null, err: true, err_msg: msg_err };

    // Get Playlist Info
    const { PlaylistData, err: pl_error, err_msg } = await Playlist.getInfo(url);

    if (!pl_error) {
      // Result Container
      let DLD_Links = VideoDataType === "text" ? "" : [];

      // HELPER: Add New Value In DLD_Links
      const add = (link) => (VideoDataType === "text" ? (DLD_Links += `${link}\n`) : DLD_Links.push(link));

      // Loop in Range & Get Link For Every Video
      for (let vdInd = from; vdInd <= to; vdInd++) {
        // Video YTB Link
        const vd_url = Object.keys(PlaylistData.videos).includes(String(vdInd)) && Object.keys(PlaylistData.videos[vdInd]).includes("video_url") ? PlaylistData.videos[vdInd].video_url : null;

        // Get 1 Link or Error
        add(vd_url !== null ? await Video.getDownloadLink(vd_url, vdInd, types, qualitys) : `Video Url Not Exists | N: ${vdInd}`);
      }

      return { results: DLD_Links, err: false, err_msg: "" };
    }

    return { results: null, err: true, err_msg: `Error In Download Playlist Data | ERROR MESSAGE : ${err_msg}` };
  }
}

module.exports = { Playlist };
