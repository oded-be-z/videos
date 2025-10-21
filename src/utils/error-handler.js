import logger from './logger.js';

/**
 * Custom error classes for different pipeline stages
 */
export class PipelineError extends Error {
  constructor(message, stage, originalError = null) {
    super(message);
    this.name = 'PipelineError';
    this.stage = stage;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export class ResearchError extends PipelineError {
  constructor(message, originalError = null) {
    super(message, 'research', originalError);
    this.name = 'ResearchError';
  }
}

export class EventDetectionError extends PipelineError {
  constructor(message, originalError = null) {
    super(message, 'event-detection', originalError);
    this.name = 'EventDetectionError';
  }
}

export class ScriptGenerationError extends PipelineError {
  constructor(message, originalError = null) {
    super(message, 'script-generation', originalError);
    this.name = 'ScriptGenerationError';
  }
}

export class VideoProductionError extends PipelineError {
  constructor(message, originalError = null) {
    super(message, 'video-production', originalError);
    this.name = 'VideoProductionError';
  }
}

export class YouTubeUploadError extends PipelineError {
  constructor(message, originalError = null) {
    super(message, 'youtube-upload', originalError);
    this.name = 'YouTubeUploadError';
  }
}

/**
 * Centralized error handler
 */
export class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.RETRY_DELAY_MS) || 5000;
  }

  /**
   * Handle pipeline errors with retry logic
   */
  async handleError(error, context = {}) {
    logger.error('Pipeline error occurred', {
      error: error.message,
      stage: error.stage || 'unknown',
      context,
      stack: error.stack
    });

    // Track error counts
    const errorKey = `${error.stage}_${error.name}`;
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    // Determine if retry is possible
    if (count < this.maxRetries && this.isRetryable(error)) {
      logger.info(`Retrying operation (attempt ${count + 1}/${this.maxRetries})`);
      await this.delay(this.retryDelay * count); // Exponential backoff
      return { retry: true, attempt: count + 1 };
    }

    // Max retries reached or non-retryable error
    logger.error('Max retries reached or non-retryable error', {
      errorKey,
      attempts: count,
      maxRetries: this.maxRetries
    });

    return { retry: false, fatal: true };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    // Network errors, rate limits, and temporary API failures are retryable
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /rate limit/i,
      /502/,
      /503/,
      /504/,
      /ECONNRESET/,
      /ETIMEDOUT/
    ];

    const errorMessage = error.message || error.toString();
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Delay helper for retry backoff
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset error counts (useful between pipeline runs)
   */
  reset() {
    this.errorCounts.clear();
    logger.info('Error handler reset');
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {};
    this.errorCounts.forEach((count, key) => {
      stats[key] = count;
    });
    return stats;
  }
}

export default new ErrorHandler();
