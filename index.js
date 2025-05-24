const Video = require("./Helpers/Video");
const Playlist = require("./Helpers/Playlist");
const YoutubeSearch = require("./Helpers/YoutubeSearch");

module.exports = {
  ...Video,
  ...Playlist,
  ...YoutubeSearch,
};
