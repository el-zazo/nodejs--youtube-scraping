// Utilities
const { Video, Playlist, YoutubeSearch } = require("./index");

/**
 * Test Runner
 * Executes all test functions and logs results
 */
const runTests = async () => {
  console.log("\n🧪 STARTING TESTS FOR YOUTUBE SCRAPING UTILITIES\n");

  try {
    // // Test Video class
    // console.log("\n📹 TESTING VIDEO CLASS\n");
    // await testVideoGetInfo();
    // await testVideoGetDownloadLink();
    // await testVideoGetDownloadLinkForMany();

    // Test Playlist class
    console.log("\n📑 TESTING PLAYLIST CLASS\n");
    await testPlaylistNumberVideo();
    // await testPlaylistGetInfo();
    // await testPlaylistGetDownloadsLinks();

    // // Test YoutubeSearch class
    // console.log("\n🔍 TESTING YOUTUBE SEARCH CLASS\n");
    // await testYoutubeSearchVideos();
    // await testYoutubeSearchPlaylists();
    // await testYoutubeSearchVideoAndRecommendations();

    console.log("\n✅ ALL TESTS COMPLETED\n");
  } catch (error) {
    console.error("\n❌ TEST EXECUTION FAILED:", error.message);
  }
};

/**
 * Helper function to log test results
 */
const logTestResult = (testName, result) => {
  console.log(`Test: ${testName}`);
  console.log("Result:", result.err ? "❌ FAILED" : "✅ SUCCESS");

  if (result.err) {
    console.log("Error Message:", result.err_msg);
  } else {
    console.log("Data Available:", result.VideoData || result.PlaylistData || result.results ? "Yes" : "No");
  }

  console.log("Complete Result:", result);
  console.log("-".repeat(50));
};

// ==========================================
// VIDEO CLASS TESTS
// ==========================================

/**
 * Test Video.getInfo method
 */
const testVideoGetInfo = async () => {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Astley - Never Gonna Give You Up

  // Test with default options
  const defaultResult = await Video.getInfo(videoUrl);
  logTestResult("Video.getInfo (Default Options)", defaultResult);

  // Test with custom options
  const customResult = await Video.getInfo(videoUrl, {
    VideoDataType: "json",
    types: ["video and audio"],
    qualitys: { "720p": true },
  });
  logTestResult("Video.getInfo (Custom Options)", customResult);
};

/**
 * Test Video.getDownloadLink method
 */
const testVideoGetDownloadLink = async () => {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Astley - Never Gonna Give You Up

  // Test with default options
  const result = await Video.getDownloadLink(videoUrl);
  logTestResult("Video.getDownloadLink", result);
};

/**
 * Test Video.getDownloadLinkForMany method
 */
const testVideoGetDownloadLinkForMany = async () => {
  const videoUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
    "https://www.youtube.com/watch?v=9bZkp7q19f0", // PSY - Gangnam Style
  ];

  const result = await Video.getDownloadLinkForMany(videoUrls);
  logTestResult("Video.getDownloadLinkForMany", result);
};

// ==========================================
// PLAYLIST CLASS TESTS
// ==========================================

/**
 * Test Playlist.numberVideo method
 */
const testPlaylistNumberVideo = async () => {
  const playlistUrl = "https://www.youtube.com/playlist?list=PL15udlupN2IDSDTpCd0lhK2eY4Hcq8mU5"; // Popular music videos

  const result = await Playlist.numberVideo(playlistUrl);
  logTestResult("Playlist.numberVideo", result);
};

/**
 * Test Playlist.getInfo method
 */
const testPlaylistGetInfo = async () => {
  const playlistUrl = "https://www.youtube.com/playlist?list=PL15udlupN2IDSDTpCd0lhK2eY4Hcq8mU5"; // Popular music videos

  // Test without download links
  const withoutLinksResult = await Playlist.getInfo(playlistUrl, false);
  logTestResult("Playlist.getInfo (Without Download Links)", withoutLinksResult);

  // Test with download links (limited to first video only to save time)
  const withLinksResult = await Playlist.getInfo(playlistUrl, true);
  logTestResult("Playlist.getInfo (With Download Links)", withLinksResult);
};

/**
 * Test Playlist.getDownloadsLinks method
 */
const testPlaylistGetDownloadsLinks = async () => {
  const playlistUrl = "https://www.youtube.com/playlist?list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab"; // Popular music videos

  // Test with range (first 2 videos only)
  const result = await Playlist.getDownloadsLinks(playlistUrl, {
    from: 1,
    to: 2,
    types: ["video and audio"],
    qualitys: { "360p": true },
  });

  logTestResult("Playlist.getDownloadsLinks", result);
};

// ==========================================
// YOUTUBE SEARCH CLASS TESTS
// ==========================================

/**
 * Test YoutubeSearch.searchVideos method
 */
const testYoutubeSearchVideos = async () => {
  const query = "javascript tutorial";

  const result = await YoutubeSearch.searchVideos(query);
  logTestResult("YoutubeSearch.searchVideos", result);

  // Log number of results if available
  if (!result.err && result.results) {
    console.log(`Found ${result.results.number_items} videos for query: "${query}"`);
    console.log("First result:", result.results.items[0]?.name || "N/A");
  }
};

/**
 * Test YoutubeSearch.searchPlaylists method
 */
const testYoutubeSearchPlaylists = async () => {
  const query = "javascript tutorial";

  const result = await YoutubeSearch.searchPlaylists(query);
  logTestResult("YoutubeSearch.searchPlaylists", result);

  // Log number of results if available
  if (!result.err && result.results) {
    console.log(`Found ${result.results.number_items} playlists for query: "${query}"`);
    console.log("First result:", result.results.items[0]?.name || "N/A");
  }
};

/**
 * Test YoutubeSearch.videoAndRecommendations method
 */
const testYoutubeSearchVideoAndRecommendations = async () => {
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Astley - Never Gonna Give You Up

  const result = await YoutubeSearch.videoAndRecommendations(videoUrl);
  logTestResult("YoutubeSearch.videoAndRecommendations", result);

  // Log recommendations count if available
  if (!result.err && result.results && result.results.recommendations) {
    console.log(`Found ${result.results.recommendations.length} recommended videos`);
    console.log("First recommendation:", result.results.recommendations[0]?.name || "N/A");
  }
};

// Run all tests
runTests().catch((error) => {
  console.error("Error running tests:", error);
});
