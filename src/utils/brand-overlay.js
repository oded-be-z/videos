/**
 * Brand Overlay System
 * Adds Seekapa branding (logo watermark) to videos using FFmpeg
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class BrandOverlay {
  constructor(logoPath) {
    this.logoPath = logoPath;
  }

  /**
   * Verify logo file exists
   * @returns {Promise<boolean>} True if logo exists
   */
  async verifyLogo() {
    try {
      await fs.access(this.logoPath);
      console.log(`[BrandOverlay] Logo verified: ${this.logoPath}`);
      return true;
    } catch (error) {
      console.error(`[BrandOverlay] Logo not found: ${this.logoPath}`);
      throw new Error(`Logo file not found: ${this.logoPath}`);
    }
  }

  /**
   * Add Seekapa logo watermark to video
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {Object} options - Overlay options
   * @param {number} options.logoWidth - Logo width in pixels (default: 120)
   * @param {number} options.opacity - Logo opacity 0-1 (default: 0.3)
   * @param {string} options.position - Logo position: bottom-right, bottom-left, top-right, top-left (default: bottom-right)
   * @param {number} options.margin - Margin from edges in pixels (default: 10)
   * @returns {Promise<string>} Path to output video
   */
  async addWatermark(inputPath, outputPath, options = {}) {
    const {
      logoWidth = 120,
      opacity = 0.3,
      position = 'bottom-right',
      margin = 10
    } = options;

    // Verify input file exists
    try {
      await fs.access(inputPath);
    } catch (error) {
      throw new Error(`Input video not found: ${inputPath}`);
    }

    // Verify logo exists
    await this.verifyLogo();

    console.log(`[BrandOverlay] Adding watermark to ${inputPath}`);
    console.log(`[BrandOverlay] Logo: ${this.logoPath}, Width: ${logoWidth}px, Opacity: ${opacity}, Position: ${position}`);

    // Calculate position overlay
    const positionMap = {
      'bottom-right': `W-w-${margin}:H-h-${margin}`,
      'bottom-left': `${margin}:H-h-${margin}`,
      'top-right': `W-w-${margin}:${margin}`,
      'top-left': `${margin}:${margin}`
    };

    const overlayPosition = positionMap[position] || positionMap['bottom-right'];

    // Build complex filter
    // 1. Scale logo to desired width and maintain aspect ratio
    // 2. Convert to RGBA format
    // 3. Apply opacity using colorchannelmixer
    // 4. Overlay on video at specified position
    const complexFilter = [
      `[1:v]scale=${logoWidth}:-1,format=rgba,colorchannelmixer=aa=${opacity}[logo]`,
      `[0:v][logo]overlay=${overlayPosition}`
    ].join(';');

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .input(this.logoPath)
        .complexFilter(complexFilter)
        .outputOptions([
          '-codec:a copy', // Copy audio without re-encoding
          '-c:v libx264',  // Use H.264 video codec
          '-preset fast',  // Fast encoding
          '-crf 23'        // Quality (lower = better quality, 23 is good)
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('[BrandOverlay] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[BrandOverlay] Processing: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`[BrandOverlay] Watermark added successfully: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('[BrandOverlay] FFmpeg error:', error.message);
          reject(new Error(`Failed to add watermark: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Get video metadata using FFmpeg
   * @param {string} videoPath - Path to video file
   * @returns {Promise<Object>} Video metadata (duration, resolution, etc.)
   */
  async getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          console.error('[BrandOverlay] Error getting video metadata:', error.message);
          reject(new Error(`Failed to get video metadata: ${error.message}`));
        } else {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

          const info = {
            duration: metadata.format.duration,
            size: metadata.format.size,
            bitrate: metadata.format.bit_rate,
            width: videoStream?.width,
            height: videoStream?.height,
            fps: videoStream?.r_frame_rate,
            videoCodec: videoStream?.codec_name,
            audioCodec: audioStream?.codec_name
          };

          console.log('[BrandOverlay] Video metadata:', info);
          resolve(info);
        }
      });
    });
  }

  /**
   * Validate video meets requirements
   * @param {string} videoPath - Path to video file
   * @param {Object} requirements - Video requirements
   * @param {number} requirements.minDuration - Minimum duration in seconds
   * @param {number} requirements.maxDuration - Maximum duration in seconds
   * @param {number} requirements.maxSize - Maximum file size in bytes
   * @returns {Promise<Object>} Validation result
   */
  async validateVideo(videoPath, requirements = {}) {
    const {
      minDuration = 30,
      maxDuration = 120,
      maxSize = 100 * 1024 * 1024 // 100MB
    } = requirements;

    try {
      const metadata = await this.getVideoMetadata(videoPath);
      const issues = [];

      if (metadata.duration < minDuration) {
        issues.push(`Duration too short: ${metadata.duration}s (minimum: ${minDuration}s)`);
      }

      if (metadata.duration > maxDuration) {
        issues.push(`Duration too long: ${metadata.duration}s (maximum: ${maxDuration}s)`);
      }

      if (metadata.size > maxSize) {
        issues.push(`File size too large: ${(metadata.size / 1024 / 1024).toFixed(2)}MB (maximum: ${(maxSize / 1024 / 1024).toFixed(2)}MB)`);
      }

      const isValid = issues.length === 0;

      if (isValid) {
        console.log(`[BrandOverlay] Video validation passed for ${videoPath}`);
      } else {
        console.warn(`[BrandOverlay] Video validation failed for ${videoPath}:`, issues);
      }

      return {
        isValid,
        issues,
        metadata
      };
    } catch (error) {
      console.error('[BrandOverlay] Error validating video:', error.message);
      throw error;
    }
  }

  /**
   * Process video with brand overlay (convenience method)
   * Validates input, adds watermark, and validates output
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {Object} options - Processing options (overlay + validation options)
   * @returns {Promise<Object>} Processing result with paths and metadata
   */
  async processVideo(inputPath, outputPath, options = {}) {
    try {
      console.log(`[BrandOverlay] Processing video: ${inputPath} -> ${outputPath}`);

      // Step 1: Validate input video
      console.log('[BrandOverlay] Step 1/3: Validating input video...');
      const inputValidation = await this.validateVideo(inputPath, options);
      if (!inputValidation.isValid) {
        throw new Error(`Input video validation failed: ${inputValidation.issues.join(', ')}`);
      }

      // Step 2: Add watermark
      console.log('[BrandOverlay] Step 2/3: Adding brand watermark...');
      await this.addWatermark(inputPath, outputPath, options);

      // Step 3: Validate output video
      console.log('[BrandOverlay] Step 3/3: Validating output video...');
      const outputValidation = await this.validateVideo(outputPath, options);

      console.log('[BrandOverlay] Video processing completed successfully!');

      return {
        inputPath,
        outputPath,
        inputMetadata: inputValidation.metadata,
        outputMetadata: outputValidation.metadata,
        success: true
      };
    } catch (error) {
      console.error('[BrandOverlay] Error processing video:', error.message);
      throw error;
    }
  }
}

module.exports = BrandOverlay;
