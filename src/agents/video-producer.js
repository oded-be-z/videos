/**
 * Video Producer Agent
 * Main orchestrator for Synthesia AI avatar video generation
 */

require('dotenv').config();
const path = require('path');
const SynthesiaClient = require('../services/synthesia');
const BrandOverlay = require('../utils/brand-overlay');
const Poller = require('../utils/polling');
const config = require('../config/synthesia-config.json');

class VideoProducerAgent {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.SYNTHESIA_API_KEY;
    this.logoPath = options.logoPath || process.env.SEEKAPA_LOGO_PATH || '/home/odedbe/brand books/Seekapa/LOGOS/Seekapa White Logo.png';
    this.outputDir = options.outputDir || process.env.OUTPUT_DIR || path.join(__dirname, '../../output');
    this.config = config;

    if (!this.apiKey) {
      throw new Error('Synthesia API key is required. Set SYNTHESIA_API_KEY in environment.');
    }

    this.synthesia = new SynthesiaClient(this.apiKey);
    this.brandOverlay = new BrandOverlay(this.logoPath);

    console.log('[VideoProducer] Initialized with:');
    console.log(`  API Key: ${this.apiKey.substring(0, 8)}...`);
    console.log(`  Logo Path: ${this.logoPath}`);
    console.log(`  Output Dir: ${this.outputDir}`);
  }

  /**
   * Get avatar configuration by persona
   * @param {string} persona - Persona name (e.g., 'professional', 'friendly', 'expert')
   * @returns {Object} Avatar configuration
   */
  getAvatarConfig(persona = 'professional') {
    const avatarConfig = this.config.avatars[persona];
    if (!avatarConfig) {
      console.warn(`[VideoProducer] Persona "${persona}" not found, using default`);
      return this.config.avatars.professional;
    }
    return avatarConfig;
  }

  /**
   * Get voice configuration by language and gender
   * @param {string} language - Language code (e.g., 'ar-SA', 'ar-AE')
   * @param {string} gender - Gender ('male' or 'female')
   * @returns {Object} Voice configuration
   */
  getVoiceConfig(language = 'ar-SA', gender = 'female') {
    const voiceConfig = this.config.voices[language]?.[gender];
    if (!voiceConfig) {
      console.warn(`[VideoProducer] Voice "${language}-${gender}" not found, using default`);
      return this.config.voices['ar-SA'].female;
    }
    return voiceConfig;
  }

  /**
   * Produce a complete branded video
   * @param {Object} options - Video production options
   * @param {string} options.script - Arabic script text
   * @param {string} options.title - Video title
   * @param {string} options.persona - Avatar persona (default: 'professional')
   * @param {string} options.language - Language dialect (default: 'ar-SA')
   * @param {string} options.gender - Voice gender (default: 'female')
   * @param {string} options.background - Background type (default: 'off_white')
   * @param {boolean} options.test - Test mode (default: false)
   * @param {boolean} options.addBranding - Add Seekapa watermark (default: true)
   * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise<Object>} Production result with paths and metadata
   */
  async produceVideo(options) {
    const {
      script,
      title,
      persona = 'professional',
      language = 'ar-SA',
      gender = 'female',
      background = 'off_white',
      test = false,
      addBranding = true,
      maxRetries = 3
    } = options;

    console.log('\n========================================');
    console.log('[VideoProducer] Starting video production');
    console.log('========================================');
    console.log(`Title: ${title}`);
    console.log(`Persona: ${persona}`);
    console.log(`Language: ${language}`);
    console.log(`Gender: ${gender}`);
    console.log(`Script length: ${script.length} characters`);
    console.log(`Test mode: ${test}`);
    console.log(`Add branding: ${addBranding}`);
    console.log('========================================\n');

    try {
      // Step 1: Get avatar and voice configurations
      const avatarConfig = this.getAvatarConfig(persona);
      const voiceConfig = this.getVoiceConfig(language, gender);

      console.log(`[VideoProducer] Using avatar: ${avatarConfig.id} (${avatarConfig.name})`);
      console.log(`[VideoProducer] Using voice: ${voiceConfig.id} (${voiceConfig.name})`);

      // Step 2: Create video with Synthesia (with retry logic)
      const createVideoWithRetry = async () => {
        return await this.synthesia.createAndDownloadVideo({
          title,
          script,
          avatar: avatarConfig.id,
          voice: voiceConfig.id,
          background,
          test,
          dialect: language
        }, this.outputDir);
      };

      const videoResult = await Poller.retry(createVideoWithRetry, {
        maxAttempts: maxRetries,
        initialDelay: 5000,
        onRetry: (attempt, maxAttempts, delay, error) => {
          console.log(`[VideoProducer] Retry ${attempt}/${maxAttempts} after error: ${error.message}`);
          console.log(`[VideoProducer] Waiting ${delay}ms before retry...`);
        }
      });

      console.log(`[VideoProducer] Raw video downloaded: ${videoResult.downloadPath}`);

      // Step 3: Add brand watermark (if enabled)
      let finalVideoPath = videoResult.downloadPath;
      let brandedMetadata = null;

      if (addBranding) {
        console.log('[VideoProducer] Adding Seekapa brand watermark...');

        const brandedPath = path.join(
          this.outputDir,
          `branded_${path.basename(videoResult.downloadPath)}`
        );

        const brandResult = await this.brandOverlay.processVideo(
          videoResult.downloadPath,
          brandedPath,
          {
            logoWidth: 120,
            opacity: 0.3,
            position: 'bottom-right',
            margin: 10,
            minDuration: 10, // Allow shorter videos for testing
            maxDuration: 600, // Allow up to 10 minutes
            maxSize: 500 * 1024 * 1024 // 500MB
          }
        );

        finalVideoPath = brandedPath;
        brandedMetadata = brandResult.outputMetadata;

        console.log(`[VideoProducer] Branded video created: ${finalVideoPath}`);
      }

      // Step 4: Return final result
      const result = {
        success: true,
        videoId: videoResult.videoId,
        title: videoResult.title,
        rawVideoPath: videoResult.downloadPath,
        finalVideoPath: finalVideoPath,
        branded: addBranding,
        metadata: {
          duration: videoResult.duration,
          status: videoResult.status,
          persona,
          language,
          gender,
          avatar: avatarConfig.name,
          voice: voiceConfig.name,
          brandedMetadata
        },
        timestamp: new Date().toISOString()
      };

      console.log('\n========================================');
      console.log('[VideoProducer] Video production completed!');
      console.log('========================================');
      console.log(`Video ID: ${result.videoId}`);
      console.log(`Final Path: ${result.finalVideoPath}`);
      console.log(`Duration: ${result.metadata.duration}s`);
      console.log('========================================\n');

      return result;

    } catch (error) {
      console.error('\n========================================');
      console.error('[VideoProducer] Video production failed!');
      console.error('========================================');
      console.error(`Error: ${error.message}`);
      console.error('========================================\n');

      throw new Error(`Video production failed: ${error.message}`);
    }
  }

  /**
   * Produce multiple videos in batch
   * @param {Array<Object>} videoRequests - Array of video production options
   * @param {Object} options - Batch options
   * @param {boolean} options.sequential - Process sequentially vs parallel (default: true)
   * @param {number} options.concurrency - Max concurrent videos if parallel (default: 3)
   * @returns {Promise<Array<Object>>} Array of production results
   */
  async produceBatch(videoRequests, options = {}) {
    const {
      sequential = true,
      concurrency = 3
    } = options;

    console.log(`[VideoProducer] Starting batch production of ${videoRequests.length} videos`);
    console.log(`[VideoProducer] Mode: ${sequential ? 'Sequential' : `Parallel (concurrency: ${concurrency})`}`);

    const results = [];
    const errors = [];

    if (sequential) {
      // Process one at a time
      for (let i = 0; i < videoRequests.length; i++) {
        const request = videoRequests[i];
        console.log(`\n[VideoProducer] Processing video ${i + 1}/${videoRequests.length}`);

        try {
          const result = await this.produceVideo(request);
          results.push(result);
        } catch (error) {
          console.error(`[VideoProducer] Failed to produce video ${i + 1}:`, error.message);
          errors.push({
            index: i,
            request,
            error: error.message
          });
        }
      }
    } else {
      // Process in parallel with concurrency limit
      const chunks = [];
      for (let i = 0; i < videoRequests.length; i += concurrency) {
        chunks.push(videoRequests.slice(i, i + concurrency));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        console.log(`\n[VideoProducer] Processing chunk ${chunkIndex + 1}/${chunks.length} (${chunk.length} videos)`);

        const chunkResults = await Promise.allSettled(
          chunk.map(request => this.produceVideo(request))
        );

        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const globalIndex = chunkIndex * concurrency + index;
            errors.push({
              index: globalIndex,
              request: chunk[index],
              error: result.reason.message
            });
          }
        });
      }
    }

    console.log('\n========================================');
    console.log('[VideoProducer] Batch production completed');
    console.log('========================================');
    console.log(`Total videos: ${videoRequests.length}`);
    console.log(`Successful: ${results.length}`);
    console.log(`Failed: ${errors.length}`);
    console.log('========================================\n');

    return {
      results,
      errors,
      stats: {
        total: videoRequests.length,
        successful: results.length,
        failed: errors.length,
        successRate: ((results.length / videoRequests.length) * 100).toFixed(2) + '%'
      }
    };
  }

  /**
   * List all produced videos
   * @returns {Promise<Array>} Array of video objects
   */
  async listVideos() {
    return await this.synthesia.listVideos();
  }

  /**
   * Delete a video by ID
   * @param {string} videoId - Synthesia video ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteVideo(videoId) {
    return await this.synthesia.deleteVideo(videoId);
  }
}

module.exports = VideoProducerAgent;
