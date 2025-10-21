import { google } from 'googleapis';
import fs from 'fs';
import logger from '../utils/logger.js';
import { YouTubeUploadError } from '../utils/error-handler.js';

/**
 * Step 8: YouTube Upload
 * Uploads the final video to YouTube channel
 */
export class YouTubeUploadStep {
  constructor(config) {
    this.config = config;
    this.youtube = null;
    this.initializeYouTubeClient();
  }

  /**
   * Initialize YouTube API client
   */
  initializeYouTubeClient() {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.config.env.youtube.clientId,
        this.config.env.youtube.clientSecret,
        'http://localhost' // Redirect URI (not used for refresh token flow)
      );

      // Set refresh token
      oauth2Client.setCredentials({
        refresh_token: this.config.env.youtube.refreshToken
      });

      // Initialize YouTube API
      this.youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });

      logger.info('YouTube API client initialized');
    } catch (error) {
      logger.error('Failed to initialize YouTube client', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute YouTube upload
   */
  async execute(videoData, topicData, scriptData) {
    try {
      logger.info('Starting YouTube upload...', {
        videoPath: videoData.brandedVideoPath,
        topic: topicData.topic.title
      });

      // Prepare video metadata
      const metadata = this.prepareMetadata(topicData, scriptData);

      // Upload video
      const uploadResult = await this.uploadVideo(
        videoData.brandedVideoPath,
        metadata
      );

      logger.info('YouTube upload completed successfully', {
        videoId: uploadResult.videoId,
        url: uploadResult.url
      });

      return uploadResult;
    } catch (error) {
      logger.error('YouTube upload failed', { error: error.message });
      throw new YouTubeUploadError('Failed to upload to YouTube', error);
    }
  }

  /**
   * Prepare video metadata for YouTube
   */
  prepareMetadata(topicData, scriptData) {
    const { topic, metadata } = topicData;

    // Title (Arabic + English)
    const title = `${topic.title} | Seekapa`;

    // Description
    const description = this.buildDescription(topic, metadata, scriptData);

    // Tags
    const tags = metadata.tags || [];

    // Category (27 = Education, 24 = Entertainment, 25 = News & Politics)
    const categoryId = topicData.contentType === 'breaking_news' ? '25' : '27';

    return {
      title,
      description,
      tags,
      categoryId,
      defaultLanguage: 'ar',
      defaultAudioLanguage: 'ar',
      privacyStatus: 'public' // or 'private' for testing
    };
  }

  /**
   * Build video description
   */
  buildDescription(topic, metadata, scriptData) {
    const lines = [
      topic.angle || topic.focus,
      '',
      '📊 حول سيكابا | About Seekapa:',
      'سيكابا - شريكك الموثوق في عالم التداول',
      'Seekapa - Your trusted partner in trading',
      '',
      '🌐 الموقع | Website:',
      'https://seekapa.com',
      '',
      '📱 تابعونا | Follow Us:',
      'YouTube: https://youtube.com/@seekapa',
      'Instagram: @seekapa',
      'Twitter: @seekapa',
      '',
      '⚠️ تنويه | Disclaimer:',
      'المحتوى المقدم لأغراض تعليمية فقط. التداول ينطوي على مخاطر.',
      'Content provided for educational purposes only. Trading involves risks.',
      '',
      `🏷️ ${metadata.hashtags?.join(' ') || ''}`,
      '',
      '---',
      `Created: ${new Date().toLocaleDateString('ar-AE')}`,
      'Powered by AI | مدعوم بالذكاء الاصطناعي'
    ];

    return lines.join('\n');
  }

  /**
   * Upload video to YouTube
   */
  async uploadVideo(videoPath, metadata) {
    try {
      // Verify file exists
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      const fileSize = fs.statSync(videoPath).size;
      logger.info('Uploading video...', {
        path: videoPath,
        size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`
      });

      // Upload video
      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId,
            defaultLanguage: metadata.defaultLanguage,
            defaultAudioLanguage: metadata.defaultAudioLanguage
          },
          status: {
            privacyStatus: metadata.privacyStatus,
            selfDeclaredMadeForKids: false,
            embeddable: true,
            publicStatsViewable: true
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });

      const videoId = response.data.id;
      const url = `https://www.youtube.com/watch?v=${videoId}`;

      logger.info('Video uploaded successfully', { videoId, url });

      return {
        videoId,
        url,
        title: metadata.title,
        uploadTime: new Date().toISOString()
      };
    } catch (error) {
      logger.error('YouTube API upload failed', {
        error: error.message,
        details: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Update video thumbnail (optional)
   */
  async updateThumbnail(videoId, thumbnailPath) {
    try {
      if (!fs.existsSync(thumbnailPath)) {
        logger.warn('Thumbnail file not found, skipping thumbnail update');
        return;
      }

      await this.youtube.thumbnails.set({
        videoId,
        media: {
          body: fs.createReadStream(thumbnailPath)
        }
      });

      logger.info('Thumbnail updated successfully', { videoId });
    } catch (error) {
      logger.error('Thumbnail update failed', { error: error.message });
      // Non-critical error, don't throw
    }
  }
}

export default YouTubeUploadStep;
