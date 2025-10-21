import ffmpeg from 'fluent-ffmpeg';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Step 7: Brand Overlay
 * Adds Seekapa branding (logo, watermark) to the video
 */
export class BrandOverlayStep {
  constructor(config) {
    this.config = config;
    this.brand = config.brand;
    this.outputDir = path.join(process.cwd(), 'output', 'branded');
  }

  /**
   * Execute brand overlay
   */
  async execute(videoData) {
    try {
      logger.info('Starting brand overlay...', {
        inputVideo: videoData.videoPath
      });

      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Add logo and watermark
      const brandedVideoPath = await this.addBranding(videoData.videoPath);

      logger.info('Brand overlay completed successfully', {
        brandedVideoPath
      });

      return {
        ...videoData,
        originalVideoPath: videoData.videoPath,
        brandedVideoPath,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Brand overlay failed', { error: error.message });
      // If branding fails, return original video
      logger.warn('Proceeding with original video (no branding)');
      return {
        ...videoData,
        brandedVideoPath: videoData.videoPath,
        branding_error: error.message
      };
    }
  }

  /**
   * Add branding elements to video
   */
  async addBranding(inputPath) {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const filename = `seekapa_branded_${timestamp}.mp4`;
      const outputPath = path.join(this.outputDir, filename);

      // Check if logo exists
      const logoPath = this.brand.logo.path;

      // Build FFmpeg filter complex
      let filterComplex = [];
      let inputs = [inputPath];

      // Add logo overlay if logo exists
      fs.access(logoPath)
        .then(() => {
          inputs.push(logoPath);

          // Logo overlay filter (bottom-right, 15% size)
          filterComplex.push(
            '[1:v]scale=iw*0.15:-1[logo]',
            '[0:v][logo]overlay=W-w-20:H-h-20:enable=\'between(t,0,99999)\'[v1]'
          );

          // Add watermark text
          filterComplex.push(
            '[v1]drawtext=text=\'Seekapa.com\':fontsize=24:fontcolor=white@0.7:x=(w-text_w)/2:y=h-50:enable=\'between(t,0,99999)\'[vout]'
          );

          this.executeFFmpeg(inputs, filterComplex, outputPath, resolve, reject);
        })
        .catch(() => {
          logger.warn('Logo file not found, adding watermark only');

          // Watermark only
          filterComplex = [
            'drawtext=text=\'Seekapa.com\':fontsize=24:fontcolor=white@0.7:x=(w-text_w)/2:y=h-50'
          ];

          this.executeFFmpegSimple(inputPath, filterComplex[0], outputPath, resolve, reject);
        });
    });
  }

  /**
   * Execute FFmpeg with complex filters
   */
  executeFFmpeg(inputs, filterComplex, outputPath, resolve, reject) {
    let command = ffmpeg();

    // Add all inputs
    inputs.forEach(input => command.input(input));

    command
      .complexFilter(filterComplex.join(';'), 'vout')
      .outputOptions([
        '-map', '[vout]',
        '-map', '0:a',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy'
      ])
      .output(outputPath)
      .on('start', (cmdLine) => {
        logger.debug('FFmpeg command:', { cmdLine });
      })
      .on('progress', (progress) => {
        logger.debug('Processing:', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('FFmpeg processing complete');
        resolve(outputPath);
      })
      .on('error', (error) => {
        logger.error('FFmpeg error:', { error: error.message });
        reject(error);
      })
      .run();
  }

  /**
   * Execute FFmpeg with simple filter (watermark only)
   */
  executeFFmpegSimple(inputPath, filter, outputPath, resolve, reject) {
    ffmpeg(inputPath)
      .videoFilters(filter)
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'copy'
      ])
      .output(outputPath)
      .on('start', (cmdLine) => {
        logger.debug('FFmpeg command:', { cmdLine });
      })
      .on('progress', (progress) => {
        logger.debug('Processing:', { percent: progress.percent });
      })
      .on('end', () => {
        logger.info('FFmpeg processing complete');
        resolve(outputPath);
      })
      .on('error', (error) => {
        logger.error('FFmpeg error:', { error: error.message });
        reject(error);
      })
      .run();
  }
}

export default BrandOverlayStep;
