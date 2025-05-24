const { getInfo } = require("@distube/ytdl-core");

// Data And Options
const { D_Q } = require("../Data/default_qualitys");
const { ALL_TYPES } = require("../Data/all_types");
const { MAIN_GET_INFO_OPTIONS } = require("../options/main_get_info_options");

/**
 * ## Youtube Video Helper
 */
class Video {
  /**
   * ### All Video Types
   *
   * - `video`
   * - `audio`
   * - `video and audio`
   */
  static ALL_TYPES = ALL_TYPES;

  /**
   * ### ytdl-core method getInfo
   * @param {string} url
   */
  static async main_getInfo(url) {
    try {
      // Extract Video Info
      const info = await getInfo(url);

      // Return Result
      return { VideoData: info, err: false, err_msg: "" };
    } catch (error) {
      return { VideoData: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Get Info To Download a Youtube Video
   *
   * @param {string} url
   * @param {MAIN_GET_INFO_OPTIONS} GET_INFO_OPTIONS
   */
  static async getInfo(url, GET_INFO_OPTIONS) {
    let { VideoNumber, VideoDataType, types, qualitys } = { ...MAIN_GET_INFO_OPTIONS, ...GET_INFO_OPTIONS };
    VideoDataType = VideoDataType.trim().toLowerCase();

    try {
      // Extract Video Info
      const info = await getInfo(url);

      // Select My Info
      const { videoId: id, title, video_url } = info.videoDetails;
      let formats = Video.#prepare_formats(info.formats, VideoNumber, title);

      // Filter By Types
      formats = Video.#filter_formats_by_types(formats, types);

      // Filter By Qualitys
      formats = Video.#filter_formats_by_qualitys(formats, qualitys);

      // Set My Video Data
      let VideoData = { id, title, video_url, formats };

      // Transfer Data To Text If Type is Text
      if (VideoDataType === "text") VideoData = Video.#data_to_text(VideoData);

      return { VideoData, err: false, err_msg: "" };
    } catch (error) {
      return { VideoData: null, err: true, err_msg: error.message };
    }
  }

  /**
   * ### Set My Params in Every Format
   *
   * **Like:**
   * - type
   * - title
   * - url
   * - .....
   *
   * _add video number & title to url_
   * @param {Array} formats
   * @param {number} VideoNumber
   * @param {string} video_title
   */
  static #prepare_formats(formats, VideoNumber = 1, video_title = "video title") {
    // Delete All Special Caracter From Title like: ["/", "#", ....]
    video_title = video_title.replace(/(\/|#)/gi, "~");

    // Set My Format Params
    const format_s = formats
      .filter((f) => Object.keys(f).includes("mimeType"))
      .map((f) => {
        const { mimeType, qualityLabel: quality, hasAudio } = f;

        // Prepare Params
        const mime_type = mimeType.split("; ")[0];
        const video = quality != null ? true : false;
        const audio = hasAudio ? true : false;
        const type = video && audio ? "video and audio" : video ? "video" : audio ? "audio" : "others";
        const title = `${mime_type} [${video ? quality : ""}] [${audio ? "+audio" : "-audio"}]`;

        // For URL | Add Video Number & Title
        const url = f.url.replace(/\/videoplayback\?/gi, `/videoplayback/${VideoNumber} - ${video_title}?`);

        return { title, mime_type, video, audio, type, quality, url };
      });

    return format_s;
  }

  /**
   * ### Filter Formats By Types
   *
   * _default is all types `['video', 'audio', 'video and audio']`_
   * @param {object} formats
   * @param {ALL_TYPES} types
   */
  static #filter_formats_by_types(formats, types) {
    if (!Array.isArray(types)) {
      console.log("Types in (Video -> Filter Format) Must be Array");
      return formats;
    }

    // Filter Type And Get Just DLD Url
    return formats.filter((f) => types.includes(f.type));
  }

  /**
   * ### Filter Formats by Qualitys
   *
   * _default is no quality | set true for qualitys you need to find_
   * @param {array} formats
   * @param {D_Q} qualitys
   */
  static #filter_formats_by_qualitys(formats, qualitys) {
    qualitys = { ...D_Q, ...qualitys };

    // Create Regulare Expression by Qualitys
    const qualitys_on = Object.entries(qualitys).filter(([k, v]) => v).map(([k, v]) => k).join("|"); // prettier-ignore
    const regExp = new RegExp(`(${qualitys_on})`, "gi");

    // Test, Filter And Return
    return formats.filter((link) => regExp.test(link.title));
  }

  /**
   * ### Transform VideoData (from getInfo) To Text
   * @param {object} VideoData
   */
  static #data_to_text(VideoData) {
    const { id, title, video_url, formats } = VideoData;

    // Prepare Texts
    const sp = "-".repeat(100);
    const titles = `ID          : ${id}\nTitle       : ${title}\nYoutube Url : ${video_url}`;
    const str_formats = formats.map((f) => `Type : ${f.title}\nUrl  : ${f.url}`).join("\n\n");

    return `${titles}\n${sp}\n\n${str_formats}`;
  }

  /**
   * ### Get Download Link By Types & Qualitys
   *
   * _default types is `['video and audio']`_\
   * _default is no quality | set true for qualitys you need to find_
   * @param {string} video_url
   * @param {number} VideoNumber default is `1`
   * @param {ALL_TYPES} types
   * @param {D_Q} qualitys
   */
  static async getDownloadLink(video_url, VideoNumber = 1, types = ["video and audio"], qualitys) {
    const e = `| N: ${VideoNumber} | url: ${video_url}`; // For Message Error
    qualitys = { ...D_Q, ...qualitys };

    // Get Video Info
    const { VideoData, err: v_error, err_msg } = await Video.getInfo(video_url, { VideoNumber, types, qualitys });
    const { formats } = VideoData;

    if (!v_error) {
      const link = formats.length > 0 ? formats[0].url : `No Download Link ${e}`;
      return { results: link, err: false, err_msg: "" };
    } else {
      const error_message = `ERROR: In Download Video Data ${e} | ERROR MESSAGE : ${err_msg}`;
      return { results: null, err: true, err_msg: error_message };
    }
  }

  /**
   * ### Get Download Link By Types & Qualitys For Many Videos
   *
   * _default types is `['video and audio']`_\
   * _default is no quality | set true for qualitys you need to find_
   * @param {Array<String>|String} video_urls
   * @param {ALL_TYPES} types
   * @param {D_Q} qualitys
   */
  static async getDownloadLinkForMany(video_urls = [], types = ["video and audio"], qualitys) {
    qualitys = { ...D_Q, ...qualitys };
    if (typeof video_urls === "string") video_urls = [video_urls];

    const links = [];

    for (let i in video_urls) {
      const { results: link, err, err_msg } = await this.getDownloadLink(video_urls[i], +i + 1, types, qualitys);
      links.push(err ? err_msg : link);
    }

    return { results: links.join("\n\n"), err: false, err_msg: "" };
  }
}

module.exports = { Video };
