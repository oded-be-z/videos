/**
 * Video Processor Service
 * Wrapper for FFmpeg operations and video processing
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class VideoProcessor {
  /**
   * Merge multiple video clips into one
   * @param {Array<string>} videoPaths - Array of video file paths
   * @param {string} outputPath - Output video path
   * @returns {Promise<string>} Path to merged video
   */
  static async mergeVideos(videoPaths, outputPath) {
    console.log(`[VideoProcessor] Merging ${videoPaths.length} videos...`);

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add all input videos
      videoPaths.forEach(videoPath => {
        command.input(videoPath);
      });

      // Merge using concat filter
      const filterComplex = videoPaths.map((_, i) => `[${i}:v][${i}:a]`).join('') +
        `concat=n=${videoPaths.length}:v=1:a=1[outv][outa]`;

      command
        .complexFilter(filterComplex)
        .outputOptions(['-map', '[outv]', '-map', '[outa]'])
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('[VideoProcessor] FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[VideoProcessor] Merging: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`[VideoProcessor] Videos merged successfully: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error merging videos:', error.message);
          reject(new Error(`Failed to merge videos: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Extract audio from video
   * @param {string} videoPath - Input video path
   * @param {string} audioPath - Output audio path
   * @returns {Promise<string>} Path to extracted audio
   */
  static async extractAudio(videoPath, audioPath) {
    console.log(`[VideoProcessor] Extracting audio from ${videoPath}...`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .output(audioPath)
        .on('end', () => {
          console.log(`[VideoProcessor] Audio extracted: ${audioPath}`);
          resolve(audioPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error extracting audio:', error.message);
          reject(new Error(`Failed to extract audio: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Convert video to different format
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {Object} options - Conversion options
   * @returns {Promise<string>} Path to converted video
   */
  static async convertVideo(inputPath, outputPath, options = {}) {
    const {
      videoCodec = 'libx264',
      audioCodec = 'aac',
      videoBitrate = '2000k',
      audioBitrate = '192k',
      fps = null,
      resolution = null
    } = options;

    console.log(`[VideoProcessor] Converting ${inputPath} to ${outputPath}...`);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
        .videoBitrate(videoBitrate)
        .audioBitrate(audioBitrate);

      if (fps) {
        command = command.fps(fps);
      }

      if (resolution) {
        command = command.size(resolution);
      }

      command
        .output(outputPath)
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[VideoProcessor] Converting: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          console.log(`[VideoProcessor] Video converted: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error converting video:', error.message);
          reject(new Error(`Failed to convert video: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Create video thumbnail
   * @param {string} videoPath - Input video path
   * @param {string} thumbnailPath - Output thumbnail path
   * @param {Object} options - Thumbnail options
   * @returns {Promise<string>} Path to thumbnail
   */
  static async createThumbnail(videoPath, thumbnailPath, options = {}) {
    const {
      timestamp = '00:00:01',
      size = '1280x720'
    } = options;

    console.log(`[VideoProcessor] Creating thumbnail from ${videoPath}...`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size
        })
        .on('end', () => {
          console.log(`[VideoProcessor] Thumbnail created: ${thumbnailPath}`);
          resolve(thumbnailPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error creating thumbnail:', error.message);
          reject(new Error(`Failed to create thumbnail: ${error.message}`));
        });
    });
  }

  /**
   * Trim video to specific duration
   * @param {string} inputPath - Input video path
   * @param {string} outputPath - Output video path
   * @param {number} startTime - Start time in seconds
   * @param {number} duration - Duration in seconds
   * @returns {Promise<string>} Path to trimmed video
   */
  static async trimVideo(inputPath, outputPath, startTime, duration) {
    console.log(`[VideoProcessor] Trimming ${inputPath} from ${startTime}s for ${duration}s...`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('end', () => {
          console.log(`[VideoProcessor] Video trimmed: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error trimming video:', error.message);
          reject(new Error(`Failed to trim video: ${error.message}`));
        })
        .run();
    });
  }

  /**
   * Add background music to video
   * @param {string} videoPath - Input video path
   * @param {string} audioPath - Background music path
   * @param {string} outputPath - Output video path
   * @param {Object} options - Audio mixing options
   * @returns {Promise<string>} Path to output video
   */
  static async addBackgroundMusic(videoPath, audioPath, outputPath, options = {}) {
    const {
      musicVolume = 0.3,
      videoVolume = 1.0
    } = options;

    console.log(`[VideoProcessor] Adding background music to ${videoPath}...`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .complexFilter([
          `[0:a]volume=${videoVolume}[a0]`,
          `[1:a]volume=${musicVolume}[a1]`,
          `[a0][a1]amix=inputs=2:duration=first[aout]`
        ])
        .outputOptions(['-map', '0:v', '-map', '[aout]'])
        .output(outputPath)
        .on('end', () => {
          console.log(`[VideoProcessor] Background music added: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('[VideoProcessor] Error adding background music:', error.message);
          reject(new Error(`Failed to add background music: ${error.message}`));
        })
        .run();
    });
  }
}

module.exports = VideoProcessor;
