/**
 * Arabic GCC Dialect Validator
 * Ensures scripts use Khaleeji dialect and not Modern Standard Arabic
 */

export class ArabicValidator {
  // GCC/Khaleeji dialect indicators
  static gccDialectWords = [
    'يا شباب', 'أهلين', 'عساكم', 'طيبين', 'الحين', 'شلون',
    'وايد', 'زين', 'ان شاء الله', 'عساك', 'تراه', 'يلا',
    'خل', 'شوي', 'مال', 'حق', 'يبا', 'يبي', 'ليش', 'هني'
  ];

  // Modern Standard Arabic indicators (to avoid)
  static msaIndicators = [
    'إن شئت', 'أيها', 'كيف حالكم', 'أنتم', 'نحن نود', 'يجب علينا',
    'من الضروري', 'ينبغي', 'لابد', 'حيثما', 'إذ'
  ];

  // Financial terms that should be present
  static financialTerms = [
    'تداول', 'سوق', 'أسواق', 'سعر', 'أسعار', 'تحليل', 'فرصة',
    'استراتيجية', 'مخاطر', 'ربح', 'خسارة', 'ذهب', 'نفط', 'عملات',
    'فوركس', 'بيتكوين', 'كريبتو', 'أسهم', 'مؤشر', 'دولار', 'يورو'
  ];

  /**
   * Check if text uses GCC dialect
   * @param {string} text - Arabic text to validate
   * @returns {Object} Validation result
   */
  static validateGCCDialect(text) {
    if (!text || typeof text !== 'string') {
      return {
        isValid: false,
        score: 0,
        message: 'Invalid or empty text'
      };
    }

    const lowerText = text.toLowerCase();

    // Count GCC dialect words
    const gccMatches = this.gccDialectWords.filter(word =>
      lowerText.includes(word.toLowerCase())
    ).length;

    // Count MSA indicators (should be minimal)
    const msaMatches = this.msaIndicators.filter(word =>
      lowerText.includes(word.toLowerCase())
    ).length;

    // Calculate score (0-100)
    const gccScore = Math.min(gccMatches * 15, 70); // Max 70 points for GCC words
    const msaPenalty = Math.min(msaMatches * 10, 30); // Max 30 point penalty
    const score = Math.max(0, gccScore - msaPenalty);

    const isValid = score >= 30 && msaMatches <= 2;

    return {
      isValid,
      score,
      gccMatches,
      msaMatches,
      message: isValid
        ? `Good GCC dialect usage (score: ${score}/100)`
        : `Needs more Khaleeji dialect markers (score: ${score}/100)`
    };
  }

  /**
   * Check if text contains financial terms
   * @param {string} text - Arabic text
   * @returns {Object} Validation result
   */
  static validateFinancialContent(text) {
    if (!text || typeof text !== 'string') {
      return {
        isValid: false,
        matchCount: 0,
        message: 'Invalid or empty text'
      };
    }

    const lowerText = text.toLowerCase();
    const matches = this.financialTerms.filter(term =>
      lowerText.includes(term.toLowerCase())
    );

    const isValid = matches.length >= 3; // At least 3 financial terms

    return {
      isValid,
      matchCount: matches.length,
      matchedTerms: matches,
      message: isValid
        ? `Contains ${matches.length} financial terms`
        : `Needs more financial terminology (only ${matches.length} found)`
    };
  }

  /**
   * Check for Arabic-specific quality issues
   * @param {string} text - Arabic text
   * @returns {Object} Quality check result
   */
  static checkQuality(text) {
    const issues = [];

    // Check for repeated words
    const words = text.split(/\s+/);
    const wordSet = new Set(words);
    if (words.length > wordSet.size * 1.2) {
      issues.push('High word repetition detected');
    }

    // Check for excessive exclamation marks
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      issues.push('Too many exclamation marks (keep professional tone)');
    }

    // Check for proper Arabic characters
    const arabicCharCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (arabicCharCount < totalChars * 0.8) {
      issues.push('Text should be primarily in Arabic');
    }

    return {
      isValid: issues.length === 0,
      issues,
      message: issues.length === 0
        ? 'Text quality is good'
        : `Quality issues found: ${issues.join(', ')}`
    };
  }

  /**
   * Comprehensive validation
   * @param {string} text - Arabic text to validate
   * @returns {Object} Complete validation result
   */
  static validate(text) {
    const dialectCheck = this.validateGCCDialect(text);
    const financialCheck = this.validateFinancialContent(text);
    const qualityCheck = this.checkQuality(text);

    const isValid = dialectCheck.isValid && financialCheck.isValid && qualityCheck.isValid;

    return {
      isValid,
      dialect: dialectCheck,
      financial: financialCheck,
      quality: qualityCheck,
      overallMessage: isValid
        ? 'Script passes all Arabic validation checks'
        : 'Script needs improvements in GCC dialect, financial content, or quality'
    };
  }
}

export default ArabicValidator;
