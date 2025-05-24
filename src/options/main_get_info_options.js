// Data
const { ALL_TYPES } = require("../constants/all_types");
const { D_Q } = require("../constants/default_qualitys");

const MAIN_GET_INFO_OPTIONS = {
  /**
   * ### Video Number
   * For Order If Many Videos Exists
   *
   * _default is `1`_
   */
  VideoNumber: 1,

  /**
   * ### Video Data Type
   * Response format. For transfer data to text use `text`
   *
   * _default is `json`_
   */
  VideoDataType: "json",

  /**
   * ### Video Types
   * Types To Get in Response
   *
   * _default is all types `['video', 'audio', 'video and audio']`_
   */
  types: ALL_TYPES,

  /**
   * ### Qualitys
   * Like `720p, 480p, 360p, 240p, 144p`
   *
   * _default is no quality | set true for qualitys you need to find_
   */
  qualitys: D_Q,
};

module.exports = { MAIN_GET_INFO_OPTIONS };
