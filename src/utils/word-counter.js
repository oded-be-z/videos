/**
 * Word Counter Utility
 * Counts Arabic words and estimates speaking duration
 */

export class WordCounter {
  /**
   * Count words in Arabic text
   * @param {string} text - Arabic text to count
   * @returns {number} Word count
   */
  static countWords(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    // Remove extra whitespace and split by spaces
    const words = text
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length > 0);

    return words.length;
  }

  /**
   * Estimate speaking duration based on word count
   * Average speaking rate for Arabic: 3 words per second
   * @param {string} text - Arabic text
   * @returns {number} Estimated duration in seconds
   */
  static estimateDuration(text) {
    const wordCount = this.countWords(text);
    const wordsPerSecond = 3; // Conservative estimate for clear Arabic speech
    return Math.round(wordCount / wordsPerSecond);
  }

  /**
   * Check if word count is within target range
   * @param {string} text - Arabic text
   * @param {number} minWords - Minimum word count (default: 180)
   * @param {number} maxWords - Maximum word count (default: 220)
   * @returns {Object} Validation result with isValid and message
   */
  static validateWordCount(text, minWords = 180, maxWords = 220) {
    const wordCount = this.countWords(text);
    const isValid = wordCount >= minWords && wordCount <= maxWords;

    return {
      isValid,
      wordCount,
      minWords,
      maxWords,
      message: isValid
        ? `Word count (${wordCount}) is within target range (${minWords}-${maxWords})`
        : `Word count (${wordCount}) is outside target range (${minWords}-${maxWords})`
    };
  }

  /**
   * Get detailed statistics about the text
   * @param {string} text - Arabic text
   * @returns {Object} Detailed statistics
   */
  static getStatistics(text) {
    const wordCount = this.countWords(text);
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;
    const estimatedDuration = this.estimateDuration(text);

    return {
      wordCount,
      characterCount,
      characterCountNoSpaces,
      estimatedDuration,
      averageWordLength: wordCount > 0 ? Math.round(characterCountNoSpaces / wordCount) : 0
    };
  }
}

export default WordCounter;
