// Data
const { D_Q } = require("../constants/default_qualitys");

const GET_DOWNLOADS_LINKS_OPTIONS = {
  /**
   * ### Video Data Type
   *
   * _default is `json` and for transfer video data to text use `text`_
   */
  VideoDataType: "json",

  /**
   * ### Video Types
   * Types To Get in Response
   *
   * _default is `['video and audio']`_
   */
  types: ["video and audio"],

  /**
   * ### From Video Number
   * Greater Than `1`
   *
   * _default is `null`_
   */
  from: null,

  /**
   * ### From Video Number
   * Less Than `Number of Videos in Playlist`
   *
   * _default is `null`_
   */
  to: null,

  /**
   * ### Qualitys
   *
   * _default is no quality | set true for qualitys you need to find_
   */
  qualitys: D_Q,
};

module.exports = { GET_DOWNLOADS_LINKS_OPTIONS };
