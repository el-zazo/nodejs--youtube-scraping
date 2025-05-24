const { isObject, separateNumbers, secondsToDuration, datetimeToDuration } = require("@elzazo/main-utils");

function prepareOriginVideoInfo(VideoData) {
  if (!isObject(VideoData)) return VideoData; // check is object

  // Get Info
  const { videoId: id, title: name = null, video_url: url = null, thumbnail = null, author = {}, viewCount = null, lengthSeconds = null, uploadDate = null } = VideoData;

  // Author Info
  const { name: author_name = null, user_url: author_url = null, thumbnails = [] } = author ? author : {};

  // Author Image
  const author_img_url = Array.isArray(thumbnails) && thumbnails.length > 0 ? thumbnails[0].url : null;

  // Update Values
  const new_thumbnail = Array.isArray(thumbnail.thumbnails) && thumbnail.thumbnails.length > 0 ? thumbnail.thumbnails[0].url : null;
  const views = separateNumbers(viewCount);
  const duration = secondsToDuration(lengthSeconds);
  const uploadedAt = datetimeToDuration(uploadDate);

  return { type: "video", id, name, url, views, duration, uploadedAt, thumbnail: new_thumbnail, author_name, author_url, author_img_url };
}

function prepareRecommandations(VideoData) {
  if (!isObject(VideoData)) return VideoData; // check is object

  // Get Info
  const { title: name = null, id = null, thumbnails: video_thumbnails = [], author = {}, view_count = null, length_seconds = null, published: uploadedAt = null } = VideoData;

  // Some Info To Set
  const url = id !== null ? `https://www.youtube.com/watch?v=${id}` : null;
  const thumbnail = Array.isArray(video_thumbnails) && video_thumbnails.length > 0 ? video_thumbnails[0].url : null;

  // Author Info
  const { name: author_name = null, user_url: author_url = null, thumbnails: author_thumbnails = [] } = author ? author : {};

  // Author Image
  const author_img_url = Array.isArray(author_thumbnails) && author_thumbnails.length > 0 ? author_thumbnails[0].url : null;

  // Update Values
  const views = separateNumbers(view_count);
  const duration = secondsToDuration(length_seconds);

  return { type: "video", id, name, url, views, duration, uploadedAt, thumbnail, author_name, author_url, author_img_url };
}

module.exports = { prepareOriginVideoInfo, prepareRecommandations };
