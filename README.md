# YouTube Scraping

A powerful Node.js library for scraping YouTube videos, playlists, and search results with a clean and simple API.

## 📋 Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage Examples](#usage-examples)
  - [Video](#video-examples)
  - [Playlist](#playlist-examples)
  - [YouTube Search](#youtube-search-examples)
- [API Reference](#api-reference)
  - [Video](#video)
  - [Playlist](#playlist)
  - [YoutubeSearch](#youtubesearch)
- [Options](#options)
- [Error Handling](#error-handling)
- [License](#license)

## 🚀 Installation

```bash
npm install @el-zazo/youtube-scraping
```

## ✨ Features

- **Video Information**: Get detailed information about YouTube videos
- **Download Links**: Retrieve download links for videos with quality filtering
- **Playlist Processing**: Extract information from playlists with optional download links
- **Search Functionality**: Search for videos and playlists by query
- **Recommendations**: Get video recommendations based on a video URL
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Customizable Options**: Filter by video type, quality, and more

## 🔍 Usage Examples

### Video Examples

```javascript
const { Video } = require("@el-zazo/youtube-scraping");

// Get video information
async function getVideoInfo() {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  // With default options
  const result = await Video.getInfo(videoUrl);

  if (!result.err) {
    console.log("Video Title:", result.VideoData.title);
    console.log("Duration:", result.VideoData.duration);
    console.log("Views:", result.VideoData.views);
  }

  // With custom options (filter by type and quality)
  const customResult = await Video.getInfo(videoUrl, {
    VideoDataType: "json",
    types: ["video and audio"],
    qualitys: { "720p": true },
  });

  console.log("Filtered formats:", customResult.VideoData.formats);
}

// Get a single download link
async function getDownloadLink() {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const result = await Video.getDownloadLink(videoUrl);

  if (!result.err) {
    console.log("Download URL:", result.url);
  }
}

// Get download links for multiple videos
async function getMultipleDownloadLinks() {
  const videoUrls = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=9bZkp7q19f0"];

  const result = await Video.getDownloadLinkForMany(videoUrls);

  if (!result.err) {
    console.log("Download Links:", result.urls);
  }
}
```

### Playlist Examples

```javascript
const { Playlist } = require("@el-zazo/youtube-scraping");

// Get number of videos in a playlist
async function getPlaylistVideoCount() {
  const playlistUrl = "https://www.youtube.com/playlist?list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab";
  const result = await Playlist.numberVideo(playlistUrl);

  if (!result.err) {
    console.log("Number of videos:", result.numberVideo);
  }
}

// Get playlist information
async function getPlaylistInfo() {
  const playlistUrl = "https://www.youtube.com/playlist?list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab";

  // Without download links
  const basicInfo = await Playlist.getInfo(playlistUrl, false);

  if (!basicInfo.err) {
    console.log("Playlist Title:", basicInfo.PlaylistData.title);
    console.log("Channel:", basicInfo.PlaylistData.channel);
    console.log("Videos:", basicInfo.PlaylistData.videos.length);
  }

  // With download links (may take longer)
  const withLinks = await Playlist.getInfo(playlistUrl, true);
  console.log("First video download link:", withLinks.PlaylistData.videos[0].downloadLink);
}

// Get download links for a range of videos in a playlist
async function getPlaylistDownloadLinks() {
  const playlistUrl = "https://www.youtube.com/playlist?list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab";

  // Get links for videos 1-5 only
  const result = await Playlist.getDownloadsLinks(playlistUrl, {
    from: 1,
    to: 5,
    types: ["video and audio"],
    qualitys: { "360p": true },
  });

  if (!result.err) {
    console.log("Download Links:", result.urls);
  }
}
```

### YouTube Search Examples

```javascript
const { YoutubeSearch } = require("@el-zazo/youtube-scraping");

// Search for videos
async function searchVideos() {
  const query = "javascript tutorial";
  const result = await YoutubeSearch.searchVideos(query);

  if (!result.err) {
    console.log(`Found ${result.results.number_items} videos`);
    console.log("First result:", result.results.items[0].name);
  }
}

// Search for playlists
async function searchPlaylists() {
  const query = "javascript tutorial";
  const result = await YoutubeSearch.searchPlaylists(query);

  if (!result.err) {
    console.log(`Found ${result.results.number_items} playlists`);
    console.log("First result:", result.results.items[0].name);
  }
}

// Get video and recommendations
async function getVideoAndRecommendations() {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const result = await YoutubeSearch.videoAndRecommendations(videoUrl);

  if (!result.err) {
    console.log("Video:", result.results.origin_video_info.name);
    console.log("Recommendations:", result.results.recommendations.length);
  }
}
```

## 📚 API Reference

### Video

| Method                                        | Description                            | Parameters                                                                         | Return Value                                    |
| --------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| `Video.getInfo(url, options)`                 | Get detailed video information         | `url`: YouTube video URL<br>`options`: (Optional) Configuration options            | Object with video data and error information    |
| `Video.getDownloadLink(url, options)`         | Get a single download link             | `url`: YouTube video URL<br>`options`: (Optional) Configuration options            | Object with download URL and error information  |
| `Video.getDownloadLinkForMany(urls, options)` | Get download links for multiple videos | `urls`: Array of YouTube video URLs<br>`options`: (Optional) Configuration options | Object with download URLs and error information |

### Playlist

| Method                                     | Description                               | Parameters                                                                            | Return Value                                    |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `Playlist.numberVideo(url)`                | Get number of videos in playlist          | `url`: YouTube playlist URL                                                           | Object with video count and error information   |
| `Playlist.getInfo(url, withDownloadLinks)` | Get detailed playlist information         | `url`: YouTube playlist URL<br>`withDownloadLinks`: Boolean to include download links | Object with playlist data and error information |
| `Playlist.getDownloadsLinks(url, options)` | Get download links for videos in playlist | `url`: YouTube playlist URL<br>`options`: Configuration with range and filters        | Object with download URLs and error information |

### YoutubeSearch

| Method                                       | Description                        | Parameters               | Return Value                                                   |
| -------------------------------------------- | ---------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `YoutubeSearch.searchVideos(query)`          | Search for videos                  | `query`: Search term     | Object with search results and error information               |
| `YoutubeSearch.searchPlaylists(query)`       | Search for playlists               | `query`: Search term     | Object with search results and error information               |
| `YoutubeSearch.videoAndRecommendations(url)` | Get video info and recommendations | `url`: YouTube video URL | Object with video data, recommendations, and error information |

## ⚙️ Options

### Video Options

```javascript
{
  VideoDataType: 'json', // or 'text'
  types: ['video and audio', 'video only', 'audio only'], // Filter by format type
  qualitys: { // Filter by quality
    '144p': true,
    '240p': true,
    '360p': true,
    '480p': true,
    '720p': true,
    '1080p': true,
    '1440p': true,
    '2160p': true
  }
}
```

### Playlist Download Links Options

```javascript
{
  from: 1, // Start from video number (1-based index)
  to: 10, // End at video number
  types: ['video and audio'], // Filter by format type
  qualitys: { '720p': true }, // Filter by quality
  responseType: 'json' // or 'text'
}
```

## 🛠️ Error Handling

All methods return an object with the following structure:

```javascript
{
  VideoData: { ... }, // or PlaylistData or results (depending on method)
  err: false, // true if an error occurred
  err_msg: '' // Error message if err is true
}
```

Example error handling:

```javascript
const result = await Video.getInfo("https://www.youtube.com/watch?v=invalid");

if (result.err) {
  console.error("Error:", result.err_msg);
} else {
  // Process result.VideoData
}
```

## 📄 License

ISC
