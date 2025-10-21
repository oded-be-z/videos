const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

/**
 * Thumbnail Generator
 * Extracts frames from videos to create thumbnails
 */
class ThumbnailGenerator {
  /**
   * Extract thumbnail from video at specific timestamp
   * @param {Object} options - Extraction options
   * @param {string} options.videoPath - Path to source video
   * @param {string} options.outputPath - Path for output thumbnail
   * @param {number} options.timestamp - Time in seconds to extract frame (default: middle of video)
   * @param {Object} options.size - Thumbnail dimensions {width, height}
   * @returns {Promise<string>} Path to generated thumbnail
   */
  static async extractFrame(options) {
    const {
      videoPath,
      outputPath,
      timestamp = null,
      size = { width: 1280, height: 720 } // YouTube recommended: 1280x720
    } = options;

    try {
      // Verify video exists
      await fs.access(videoPath);

      // Get video duration if timestamp not specified
      let frameTime = timestamp;
      if (frameTime === null) {
        const duration = await this.getVideoDuration(videoPath);
        frameTime = duration / 2; // Middle of video
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Build ffmpeg command
      const ffmpegCommand = [
        'ffmpeg',
        '-ss', frameTime.toString(), // Seek to timestamp
        '-i', `"${videoPath}"`, // Input file
        '-vframes', '1', // Extract single frame
        '-vf', `scale=${size.width}:${size.height}`, // Resize
        '-q:v', '2', // High quality
        '-y', // Overwrite output file
        `"${outputPath}"`
      ].join(' ');

      console.log(`Extracting thumbnail at ${frameTime}s...`);
      await execAsync(ffmpegCommand);

      // Verify thumbnail was created
      await fs.access(outputPath);
      const stats = await fs.stat(outputPath);

      if (stats.size === 0) {
        throw new Error('Generated thumbnail file is empty');
      }

      console.log(`Thumbnail generated: ${outputPath} (${(stats.size / 1024).toFixed(2)} KB)`);
      return outputPath;

    } catch (error) {
      console.error('Failed to generate thumbnail:', error.message);
      throw error;
    }
  }

  /**
   * Extract multiple frames for thumbnail selection
   * @param {string} videoPath - Path to source video
   * @param {string} outputDir - Directory for output thumbnails
   * @param {number} count - Number of frames to extract (default: 5)
   * @returns {Promise<Array<string>>} Array of thumbnail paths
   */
  static async extractMultipleFrames(videoPath, outputDir, count = 5) {
    try {
      const duration = await this.getVideoDuration(videoPath);
      const interval = duration / (count + 1);

      const thumbnails = [];
      const videoBaseName = path.basename(videoPath, path.extname(videoPath));

      for (let i = 1; i <= count; i++) {
        const timestamp = interval * i;
        const outputPath = path.join(outputDir, `${videoBaseName}_thumb_${i}.jpg`);

        const thumbnail = await this.extractFrame({
          videoPath,
          outputPath,
          timestamp
        });

        thumbnails.push(thumbnail);
      }

      console.log(`Extracted ${thumbnails.length} thumbnail options`);
      return thumbnails;

    } catch (error) {
      console.error('Failed to extract multiple frames:', error.message);
      throw error;
    }
  }

  /**
   * Get video duration in seconds
   * @param {string} videoPath - Path to video file
   * @returns {Promise<number>} Duration in seconds
   */
  static async getVideoDuration(videoPath) {
    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim());
    } catch (error) {
      console.error('Failed to get video duration:', error.message);
      throw error;
    }
  }

  /**
   * Create custom thumbnail with text overlay
   * @param {Object} options - Thumbnail options
   * @param {string} options.videoPath - Path to source video
   * @param {string} options.outputPath - Path for output thumbnail
   * @param {string} options.title - Title text to overlay
   * @param {string} options.subtitle - Subtitle text (persona name)
   * @param {number} options.timestamp - Time to extract frame
   * @returns {Promise<string>} Path to generated thumbnail
   */
  static async createCustomThumbnail(options) {
    const {
      videoPath,
      outputPath,
      title,
      subtitle,
      timestamp = null
    } = options;

    try {
      // First extract base frame
      const tempFrame = outputPath.replace('.jpg', '_temp.jpg');
      await this.extractFrame({
        videoPath,
        outputPath: tempFrame,
        timestamp
      });

      // Create text overlay using ffmpeg
      // Note: This requires ffmpeg with libfreetype for text rendering
      const filterComplex = [
        // Add gradient overlay for text readability
        'drawbox=y=ih-200:color=black@0.6:width=iw:height=200:t=fill',

        // Add title text (requires font path - adjust as needed)
        `drawtext=text='${this.escapeText(title)}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-150`,

        // Add subtitle text
        `drawtext=text='${this.escapeText(subtitle)}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:fontsize=32:fontcolor=white@0.8:x=(w-text_w)/2:y=h-90`
      ].join(',');

      const ffmpegCommand = [
        'ffmpeg',
        '-i', `"${tempFrame}"`,
        '-vf', `"${filterComplex}"`,
        '-q:v', '2',
        '-y',
        `"${outputPath}"`
      ].join(' ');

      await execAsync(ffmpegCommand);

      // Clean up temp file
      await fs.unlink(tempFrame);

      console.log(`Custom thumbnail created: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.warn('Failed to create custom thumbnail with text overlay:', error.message);
      console.log('Falling back to simple frame extraction...');

      // Fallback to simple extraction if text overlay fails
      return await this.extractFrame({
        videoPath,
        outputPath,
        timestamp
      });
    }
  }

  /**
   * Escape special characters in text for ffmpeg
   */
  static escapeText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/:/g, '\\:')
      .replace(/'/g, "\\'");
  }

  /**
   * Generate thumbnail for YouTube (optimized settings)
   * @param {string} videoPath - Path to source video
   * @param {string} personaName - Persona name for subtitle
   * @param {string} topic - Video topic for title
   * @returns {Promise<string>} Path to thumbnail
   */
  static async generateYouTubeThumbnail(videoPath, personaName = '', topic = '') {
    const videoBaseName = path.basename(videoPath, path.extname(videoPath));
    const outputDir = path.join(path.dirname(videoPath), 'thumbnails');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${videoBaseName}_thumbnail.jpg`);

    // If we have title/subtitle, create custom thumbnail
    if (topic && personaName) {
      return await this.createCustomThumbnail({
        videoPath,
        outputPath,
        title: topic,
        subtitle: personaName
      });
    }

    // Otherwise, simple frame extraction from middle
    return await this.extractFrame({
      videoPath,
      outputPath,
      size: { width: 1280, height: 720 }
    });
  }

  /**
   * Validate thumbnail meets YouTube requirements
   * @param {string} thumbnailPath - Path to thumbnail file
   * @returns {Promise<Object>} Validation result {valid, errors, warnings}
   */
  static async validateThumbnail(thumbnailPath) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      const stats = await fs.stat(thumbnailPath);

      // Check file size (max 2MB for YouTube)
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB > 2) {
        result.valid = false;
        result.errors.push(`File size ${fileSizeMB.toFixed(2)}MB exceeds YouTube limit of 2MB`);
      }

      // Get image dimensions using ffprobe
      const command = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${thumbnailPath}"`;
      const { stdout } = await execAsync(command);
      const [width, height] = stdout.trim().split('x').map(Number);

      // Check aspect ratio (16:9 recommended)
      const aspectRatio = width / height;
      if (Math.abs(aspectRatio - (16/9)) > 0.1) {
        result.warnings.push(`Aspect ratio ${aspectRatio.toFixed(2)} differs from recommended 16:9`);
      }

      // Check minimum resolution (640x360)
      if (width < 640 || height < 360) {
        result.warnings.push(`Resolution ${width}x${height} is below recommended 640x360`);
      }

      // Check recommended resolution (1280x720)
      if (width !== 1280 || height !== 720) {
        result.warnings.push(`Resolution ${width}x${height} differs from recommended 1280x720`);
      }

      result.dimensions = { width, height };
      result.fileSize = fileSizeMB;

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation failed: ${error.message}`);
    }

    return result;
  }
}

module.exports = ThumbnailGenerator;
