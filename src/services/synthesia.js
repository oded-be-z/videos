/**
 * Synthesia API Client
 * Handles video creation, status polling, and downloads
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class SynthesiaClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.synthesia.io/v2';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new video with Synthesia
   * @param {Object} options - Video creation options
   * @param {string} options.title - Video title
   * @param {string} options.script - Arabic script text
   * @param {string} options.avatar - Avatar ID
   * @param {string} options.voice - Voice ID (e.g., 'ar-SA-female-natural')
   * @param {string} options.background - Background type
   * @param {boolean} options.test - Test mode (default: false)
   * @returns {Promise<Object>} Created video object with ID
   */
  async createVideo({
    title,
    script,
    avatar = 'anna_costume1_cameraA', // Default avatar
    voice = 'ar-SA', // Default Saudi Arabic voice
    background = 'off_white',
    test = false,
    dialect = 'ar-SA'
  }) {
    try {
      console.log(`[Synthesia] Creating video: "${title}"`);
      console.log(`[Synthesia] Script length: ${script.length} characters`);
      console.log(`[Synthesia] Avatar: ${avatar}, Voice: ${voice}, Background: ${background}`);

      const requestBody = {
        test,
        title,
        input: [
          {
            avatar,
            avatarSettings: {
              voice,
              horizontalAlign: 'center',
              scale: 1.0
            },
            script,
            scriptSettings: {
              language: 'ar',
              dialect
            },
            background
          }
        ],
        visibility: 'private'
      };

      console.log('[Synthesia] Request body:', JSON.stringify(requestBody, null, 2));

      const response = await this.client.post('/videos', requestBody);

      console.log(`[Synthesia] Video created successfully! ID: ${response.data.id}`);
      console.log(`[Synthesia] Status: ${response.data.status}`);

      return response.data;
    } catch (error) {
      console.error('[Synthesia] Error creating video:', error.response?.data || error.message);
      throw new Error(`Failed to create video: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get video status and details
   * @param {string} videoId - Synthesia video ID
   * @returns {Promise<Object>} Video object with status
   */
  async getVideoStatus(videoId) {
    try {
      const response = await this.client.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error(`[Synthesia] Error getting video status for ${videoId}:`, error.response?.data || error.message);
      throw new Error(`Failed to get video status: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Poll video status until completion
   * @param {string} videoId - Synthesia video ID
   * @param {number} pollInterval - Polling interval in milliseconds (default: 30000 - 30 seconds)
   * @param {number} timeout - Timeout in milliseconds (default: 1800000 - 30 minutes)
   * @returns {Promise<Object>} Completed video object with download link
   */
  async pollVideoCompletion(videoId, pollInterval = 30000, timeout = 1800000) {
    console.log(`[Synthesia] Starting to poll video ${videoId} (interval: ${pollInterval}ms, timeout: ${timeout}ms)`);

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const elapsedTime = Date.now() - startTime;

          // Check timeout
          if (elapsedTime > timeout) {
            clearInterval(pollIntervalId);
            reject(new Error(`Video processing timeout after ${timeout / 1000 / 60} minutes`));
            return;
          }

          const video = await this.getVideoStatus(videoId);
          console.log(`[Synthesia] Video ${videoId} status: ${video.status} (elapsed: ${Math.round(elapsedTime / 1000)}s)`);

          if (video.status === 'complete') {
            clearInterval(pollIntervalId);
            console.log(`[Synthesia] Video ${videoId} completed! Download available.`);
            resolve(video);
          } else if (video.status === 'failed') {
            clearInterval(pollIntervalId);
            reject(new Error(`Video processing failed: ${video.error || 'Unknown error'}`));
          }
          // Otherwise continue polling (status is 'in_progress' or 'pending')
        } catch (error) {
          clearInterval(pollIntervalId);
          reject(error);
        }
      };

      const pollIntervalId = setInterval(poll, pollInterval);
      // Run first poll immediately
      poll();
    });
  }

  /**
   * Download video to local file
   * @param {string} downloadUrl - Video download URL
   * @param {string} outputPath - Local output path
   * @returns {Promise<string>} Path to downloaded file
   */
  async downloadVideo(downloadUrl, outputPath) {
    try {
      console.log(`[Synthesia] Downloading video to ${outputPath}...`);

      const response = await axios.get(downloadUrl, {
        responseType: 'stream'
      });

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Write stream to file
      const writer = require('fs').createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`[Synthesia] Video downloaded successfully to ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', (error) => {
          console.error('[Synthesia] Error downloading video:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('[Synthesia] Error downloading video:', error.message);
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  /**
   * Create video and wait for completion (convenience method)
   * @param {Object} options - Video creation options (same as createVideo)
   * @param {string} outputDir - Directory to save downloaded video
   * @returns {Promise<Object>} Object with videoId, downloadPath, and video metadata
   */
  async createAndDownloadVideo(options, outputDir = './output') {
    try {
      // Step 1: Create video
      const video = await this.createVideo(options);
      const videoId = video.id;

      // Step 2: Poll for completion
      const completedVideo = await this.pollVideoCompletion(videoId);

      // Step 3: Download video
      const downloadUrl = completedVideo.download;
      if (!downloadUrl) {
        throw new Error('No download URL available in completed video');
      }

      const fileName = `${videoId}.mp4`;
      const downloadPath = path.join(outputDir, fileName);
      await this.downloadVideo(downloadUrl, downloadPath);

      return {
        videoId,
        downloadPath,
        title: completedVideo.title,
        duration: completedVideo.duration,
        status: completedVideo.status
      };
    } catch (error) {
      console.error('[Synthesia] Error in createAndDownloadVideo:', error.message);
      throw error;
    }
  }

  /**
   * List all videos in account
   * @param {number} limit - Number of videos to retrieve
   * @returns {Promise<Array>} Array of video objects
   */
  async listVideos(limit = 50) {
    try {
      const response = await this.client.get('/videos', {
        params: { limit }
      });
      return response.data.videos || [];
    } catch (error) {
      console.error('[Synthesia] Error listing videos:', error.response?.data || error.message);
      throw new Error(`Failed to list videos: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete a video
   * @param {string} videoId - Synthesia video ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVideo(videoId) {
    try {
      console.log(`[Synthesia] Deleting video ${videoId}...`);
      await this.client.delete(`/videos/${videoId}`);
      console.log(`[Synthesia] Video ${videoId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`[Synthesia] Error deleting video ${videoId}:`, error.response?.data || error.message);
      throw new Error(`Failed to delete video: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = SynthesiaClient;
