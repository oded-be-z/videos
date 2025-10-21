require('dotenv').config();
const YouTubeService = require('./services/youtube');
const MetadataGenerator = require('./utils/youtube-metadata');
const ThumbnailGenerator = require('./utils/thumbnail-generator');
const PlaylistManager = require('./utils/playlist-manager');
const config = require('./config/youtube-config.json');
const path = require('path');
const fs = require('fs').promises;

/**
 * Main YouTube Upload System
 * Orchestrates video upload with metadata, thumbnails, and playlists
 */
class YouTubeUploadSystem {
  constructor() {
    this.youtubeService = new YouTubeService();
    this.playlistManager = null;
    this.initialized = false;
  }

  /**
   * Initialize the upload system
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Initializing YouTube Upload System...');

    try {
      // Initialize YouTube service (OAuth2)
      await this.youtubeService.initialize();

      // Initialize playlist manager
      this.playlistManager = new PlaylistManager(this.youtubeService);

      this.initialized = true;
      console.log('YouTube Upload System initialized successfully!');

    } catch (error) {
      console.error('Failed to initialize YouTube Upload System:', error.message);
      throw error;
    }
  }

  /**
   * Upload video with full automation
   * @param {Object} options - Upload options
   * @param {string} options.videoPath - Path to video file
   * @param {Object} options.videoData - Video metadata and information
   * @param {boolean} options.generateThumbnail - Auto-generate thumbnail
   * @param {boolean} options.addToPlaylists - Auto-add to playlists
   * @returns {Promise<Object>} Upload result
   */
  async uploadVideo(options) {
    const {
      videoPath,
      videoData,
      generateThumbnail = true,
      addToPlaylists = true
    } = options;

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log('\n========================================');
      console.log('YOUTUBE VIDEO UPLOAD');
      console.log('========================================\n');

      // 1. Generate metadata
      console.log('Step 1: Generating metadata...');
      const metadata = MetadataGenerator.generateMetadata(videoData);
      console.log(`✓ Title: ${metadata.title}`);
      console.log(`✓ Tags: ${metadata.tags.length} tags`);

      // 2. Generate thumbnail (if enabled)
      let thumbnailPath = null;
      if (generateThumbnail && config.thumbnails.enabled) {
        console.log('\nStep 2: Generating thumbnail...');
        try {
          thumbnailPath = await ThumbnailGenerator.generateYouTubeThumbnail(
            videoPath,
            videoData.persona.name,
            videoData.topicArabic || videoData.topic
          );
          console.log(`✓ Thumbnail: ${thumbnailPath}`);
        } catch (error) {
          console.warn('⚠ Thumbnail generation failed:', error.message);
          console.log('Continuing without custom thumbnail...');
        }
      } else {
        console.log('\nStep 2: Skipping thumbnail generation (disabled)');
      }

      // 3. Upload video
      console.log('\nStep 3: Uploading video to YouTube...');
      const uploadResult = await this.youtubeService.uploadVideo({
        videoPath,
        metadata,
        privacyStatus: config.upload.defaultPrivacyStatus,
        categoryId: config.upload.defaultCategoryId,
        thumbnail: thumbnailPath
      });

      console.log(`✓ Video uploaded successfully!`);
      console.log(`✓ Video ID: ${uploadResult.videoId}`);
      console.log(`✓ Video URL: ${uploadResult.videoUrl}`);

      // 4. Add to playlists (if enabled)
      if (addToPlaylists && config.playlists.autoAdd) {
        console.log('\nStep 4: Adding to playlists...');
        try {
          const playlists = await this.playlistManager.categorizeAndAdd(
            uploadResult.videoId,
            metadata,
            {
              personaName: videoData.persona.name,
              videoType: videoData.videoType,
              topic: videoData.topic,
              tradingPairs: videoData.tradingPairs
            }
          );
          console.log(`✓ Added to ${playlists.length} playlists`);
        } catch (error) {
          console.warn('⚠ Playlist addition failed:', error.message);
        }
      } else {
        console.log('\nStep 4: Skipping playlist addition (disabled)');
      }

      // 5. Log upload
      await this.logUpload({
        ...uploadResult,
        metadata,
        videoData,
        thumbnailPath
      });

      console.log('\n========================================');
      console.log('UPLOAD COMPLETE!');
      console.log('========================================\n');

      return uploadResult;

    } catch (error) {
      console.error('\n❌ Upload failed:', error.message);
      throw error;
    }
  }

  /**
   * Upload multiple videos in batch
   * @param {Array} videos - Array of video upload options
   * @param {number} delayBetween - Delay between uploads in ms
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadBatch(videos, delayBetween = 5000) {
    console.log(`\nStarting batch upload of ${videos.length} videos...\n`);

    const results = [];
    const errors = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`\n[${i + 1}/${videos.length}] Uploading: ${video.videoData.topic}`);

      try {
        const result = await this.uploadVideo(video);
        results.push(result);

        // Delay between uploads to avoid quota issues
        if (i < videos.length - 1 && delayBetween > 0) {
          console.log(`\nWaiting ${delayBetween / 1000}s before next upload...`);
          await new Promise(resolve => setTimeout(resolve, delayBetween));
        }

      } catch (error) {
        console.error(`Failed to upload ${video.videoData.topic}:`, error.message);
        errors.push({
          video: video.videoData.topic,
          error: error.message
        });
      }
    }

    console.log('\n========================================');
    console.log('BATCH UPLOAD SUMMARY');
    console.log('========================================');
    console.log(`Total videos: ${videos.length}`);
    console.log(`Successful: ${results.length}`);
    console.log(`Failed: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nFailed uploads:');
      errors.forEach(err => {
        console.log(`- ${err.video}: ${err.error}`);
      });
    }

    return { results, errors };
  }

  /**
   * Setup standard playlists
   */
  async setupPlaylists() {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Creating standard Seekapa playlists...\n');
    const playlists = await this.playlistManager.createStandardPlaylists();

    console.log('\n========================================');
    console.log(`Created ${Object.keys(playlists).length} playlists`);
    console.log('========================================\n');

    return playlists;
  }

  /**
   * Get channel information
   */
  async getChannelInfo() {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.youtubeService.getChannelInfo();
  }

  /**
   * Log upload to file
   */
  async logUpload(uploadData) {
    try {
      const logDir = path.join(__dirname, '../logs');
      await fs.mkdir(logDir, { recursive: true });

      const logFile = path.join(logDir, 'youtube-uploads.json');
      let logs = [];

      // Read existing logs
      try {
        const content = await fs.readFile(logFile, 'utf8');
        logs = JSON.parse(content);
      } catch (error) {
        // File doesn't exist yet
      }

      // Add new log
      logs.push({
        timestamp: new Date().toISOString(),
        videoId: uploadData.videoId,
        videoUrl: uploadData.videoUrl,
        title: uploadData.title,
        persona: uploadData.videoData.persona.name,
        videoType: uploadData.videoData.videoType,
        thumbnailGenerated: !!uploadData.thumbnailPath
      });

      // Write logs
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));

    } catch (error) {
      console.warn('Failed to log upload:', error.message);
    }
  }

  /**
   * Get upload history
   */
  async getUploadHistory() {
    try {
      const logFile = path.join(__dirname, '../logs/youtube-uploads.json');
      const content = await fs.readFile(logFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }
}

// Export main class
module.exports = YouTubeUploadSystem;

// Export utilities for direct use
module.exports.YouTubeService = YouTubeService;
module.exports.MetadataGenerator = MetadataGenerator;
module.exports.ThumbnailGenerator = ThumbnailGenerator;
module.exports.PlaylistManager = PlaylistManager;
