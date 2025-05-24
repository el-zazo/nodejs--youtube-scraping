const Video = require("./src/utils/Video");
const Playlist = require("./src/utils/Playlist");
const YoutubeSearch = require("./src/utils/YoutubeSearch");

module.exports = {
  ...Video,
  ...Playlist,
  ...YoutubeSearch,
};
