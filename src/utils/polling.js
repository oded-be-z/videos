/**
 * Polling Utility
 * Generic polling mechanism with timeout and retry logic
 */

class Poller {
  /**
   * Poll a function until it returns a truthy value or times out
   * @param {Function} fn - Function to poll (should return Promise)
   * @param {Function} condition - Condition function to check result (should return boolean)
   * @param {Object} options - Polling options
   * @param {number} options.interval - Polling interval in ms (default: 30000)
   * @param {number} options.timeout - Timeout in ms (default: 1800000 - 30 min)
   * @param {Function} options.onPoll - Callback after each poll
   * @returns {Promise} Result when condition is met
   */
  static async poll(fn, condition, options = {}) {
    const {
      interval = 30000,
      timeout = 1800000,
      onPoll = null
    } = options;

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const elapsedTime = Date.now() - startTime;

          // Check timeout
          if (elapsedTime > timeout) {
            clearInterval(pollIntervalId);
            reject(new Error(`Polling timeout after ${timeout / 1000 / 60} minutes`));
            return;
          }

          const result = await fn();

          // Call onPoll callback if provided
          if (onPoll) {
            onPoll(result, elapsedTime);
          }

          // Check condition
          if (condition(result)) {
            clearInterval(pollIntervalId);
            resolve(result);
          }
        } catch (error) {
          clearInterval(pollIntervalId);
          reject(error);
        }
      };

      const pollIntervalId = setInterval(poll, interval);
      // Run first poll immediately
      poll();
    });
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry (should return Promise)
   * @param {Object} options - Retry options
   * @param {number} options.maxAttempts - Maximum retry attempts (default: 3)
   * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
   * @param {number} options.maxDelay - Maximum delay in ms (default: 60000)
   * @param {Function} options.onRetry - Callback before each retry
   * @returns {Promise} Result of successful attempt
   */
  static async retry(fn, options = {}) {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 60000,
      onRetry = null
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          throw new Error(`Failed after ${maxAttempts} attempts: ${error.message}`);
        }

        // Calculate exponential backoff delay
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt - 1),
          maxDelay
        );

        if (onRetry) {
          onRetry(attempt, maxAttempts, delay, error);
        }

        console.log(`[Poller] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`);
        await Poller.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Resolves after sleep
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format elapsed time in human-readable format
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time string
   */
  static formatElapsedTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = Poller;
