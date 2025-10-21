const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { OAuth2Client } = require('./oauth');

/**
 * YouTube Upload Service
 * Handles video uploads to YouTube using OAuth2 authentication
 */
class YouTubeService {
  constructor() {
    this.youtube = null;
    this.oauth2Client = null;
  }

  /**
   * Initialize YouTube API client with OAuth2
   */
  async initialize() {
    try {
      this.oauth2Client = await OAuth2Client.getAuthenticatedClient();
      this.youtube = google.youtube({
        version: 'v3',
        auth: this.oauth2Client
      });
      console.log('YouTube API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize YouTube API client:', error.message);
      throw error;
    }
  }

  /**
   * Upload video to YouTube
   * @param {Object} options - Upload options
   * @param {string} options.videoPath - Path to video file
   * @param {Object} options.metadata - Video metadata (title, description, tags)
   * @param {string} options.privacyStatus - Privacy status (public, unlisted, private)
   * @param {string} options.categoryId - YouTube category ID
   * @returns {Promise<Object>} Upload result with video ID and URL
   */
  async uploadVideo(options) {
    const {
      videoPath,
      metadata,
      privacyStatus = 'public',
      categoryId = '22', // People & Blogs
      thumbnail = null
    } = options;

    try {
      // Validate video file exists
      await fs.access(videoPath);
      const fileSize = (await fs.stat(videoPath)).size;
      console.log(`Uploading video: ${path.basename(videoPath)} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

      // Prepare request body
      const requestBody = {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags || [],
          categoryId: categoryId,
          defaultLanguage: metadata.language || 'ar',
          defaultAudioLanguage: metadata.audioLanguage || 'ar'
        },
        status: {
          privacyStatus: privacyStatus,
          selfDeclaredMadeForKids: false,
          embeddable: true,
          publicStatsViewable: true
        }
      };

      // Upload video
      const response = await this.youtube.videos.insert({
        part: 'snippet,status',
        requestBody: requestBody,
        media: {
          body: require('fs').createReadStream(videoPath)
        }
      });

      const videoId = response.data.id;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      console.log(`Video uploaded successfully!`);
      console.log(`Video ID: ${videoId}`);
      console.log(`Video URL: ${videoUrl}`);

      // Upload custom thumbnail if provided
      if (thumbnail) {
        await this.uploadThumbnail(videoId, thumbnail);
      }

      return {
        success: true,
        videoId: videoId,
        videoUrl: videoUrl,
        title: metadata.title,
        uploadedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Video upload failed:', error.message);

      // Handle quota exceeded error
      if (error.code === 403 && error.message.includes('quota')) {
        throw new Error('YouTube API quota exceeded. Please try again tomorrow.');
      }

      throw error;
    }
  }

  /**
   * Upload custom thumbnail for a video
   * @param {string} videoId - YouTube video ID
   * @param {string} thumbnailPath - Path to thumbnail image
   */
  async uploadThumbnail(videoId, thumbnailPath) {
    try {
      await fs.access(thumbnailPath);

      await this.youtube.thumbnails.set({
        videoId: videoId,
        media: {
          body: require('fs').createReadStream(thumbnailPath)
        }
      });

      console.log(`Custom thumbnail uploaded for video ${videoId}`);
    } catch (error) {
      console.error('Thumbnail upload failed:', error.message);
      // Don't throw - thumbnail is optional
    }
  }

  /**
   * Add video to playlist
   * @param {string} videoId - YouTube video ID
   * @param {string} playlistId - YouTube playlist ID
   */
  async addToPlaylist(videoId, playlistId) {
    try {
      await this.youtube.playlistItems.insert({
        part: 'snippet',
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        }
      });

      console.log(`Video ${videoId} added to playlist ${playlistId}`);
    } catch (error) {
      console.error('Failed to add video to playlist:', error.message);
      // Don't throw - playlist is optional
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo() {
    try {
      const response = await this.youtube.channels.list({
        part: 'snippet,statistics,contentDetails',
        mine: true
      });

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0];
        return {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          customUrl: channel.snippet.customUrl,
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        };
      }

      throw new Error('No channel found for authenticated user');
    } catch (error) {
      console.error('Failed to get channel info:', error.message);
      throw error;
    }
  }

  /**
   * Create a new playlist
   * @param {string} title - Playlist title
   * @param {string} description - Playlist description
   * @param {string} privacyStatus - Privacy status (public, unlisted, private)
   */
  async createPlaylist(title, description, privacyStatus = 'public') {
    try {
      const response = await this.youtube.playlists.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: title,
            description: description,
            defaultLanguage: 'ar'
          },
          status: {
            privacyStatus: privacyStatus
          }
        }
      });

      console.log(`Playlist created: ${response.data.id}`);
      return {
        id: response.data.id,
        title: response.data.snippet.title
      };
    } catch (error) {
      console.error('Failed to create playlist:', error.message);
      throw error;
    }
  }

  /**
   * Get all playlists for the channel
   */
  async getPlaylists() {
    try {
      const response = await this.youtube.playlists.list({
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50
      });

      return response.data.items.map(playlist => ({
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        itemCount: playlist.contentDetails.itemCount
      }));
    } catch (error) {
      console.error('Failed to get playlists:', error.message);
      throw error;
    }
  }

  /**
   * Update video metadata
   * @param {string} videoId - YouTube video ID
   * @param {Object} updates - Metadata updates
   */
  async updateVideo(videoId, updates) {
    try {
      // First get current video details
      const currentVideo = await this.youtube.videos.list({
        part: 'snippet,status',
        id: videoId
      });

      if (!currentVideo.data.items || currentVideo.data.items.length === 0) {
        throw new Error(`Video ${videoId} not found`);
      }

      const video = currentVideo.data.items[0];

      // Merge updates with current data
      const requestBody = {
        id: videoId,
        snippet: {
          ...video.snippet,
          ...updates.snippet
        },
        status: {
          ...video.status,
          ...updates.status
        }
      };

      await this.youtube.videos.update({
        part: 'snippet,status',
        requestBody: requestBody
      });

      console.log(`Video ${videoId} updated successfully`);
    } catch (error) {
      console.error('Failed to update video:', error.message);
      throw error;
    }
  }

  /**
   * Delete a video
   * @param {string} videoId - YouTube video ID
   */
  async deleteVideo(videoId) {
    try {
      await this.youtube.videos.delete({
        id: videoId
      });

      console.log(`Video ${videoId} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete video:', error.message);
      throw error;
    }
  }

  /**
   * Get video statistics
   * @param {string} videoId - YouTube video ID
   */
  async getVideoStats(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'statistics,snippet',
        id: videoId
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Video ${videoId} not found`);
      }

      const video = response.data.items[0];
      return {
        videoId: videoId,
        title: video.snippet.title,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        comments: video.statistics.commentCount,
        publishedAt: video.snippet.publishedAt
      };
    } catch (error) {
      console.error('Failed to get video stats:', error.message);
      throw error;
    }
  }
}

module.exports = YouTubeService;
