/**
 * Compliance Checker
 * Ensures all scripts contain required risk disclosures and regulatory information
 */

import disclaimers from '../config/disclaimers.json' assert { type: 'json' };

export class ComplianceChecker {
  /**
   * Check if script contains required risk warning
   * @param {string} text - Script text in Arabic
   * @returns {Object} Compliance check result
   */
  static checkRiskWarning(text) {
    if (!text || typeof text !== 'string') {
      return {
        isCompliant: false,
        message: 'Invalid or empty text'
      };
    }

    const lowerText = text.toLowerCase();

    // Check for any of the risk warnings
    const hasShortWarning = lowerText.includes('التداول يحمل مخاطر');
    const hasMediumWarning = lowerText.includes('التداول في الأسواق المالية ينطوي على مخاطر');
    const hasLongWarning = lowerText.includes('قد تخسر كامل رأس المال');

    const hasAnyWarning = hasShortWarning || hasMediumWarning || hasLongWarning;

    // Check for key risk phrases
    const riskKeywords = ['مخاطر', 'تخسر', 'رأس مال', 'رأس المال'];
    const foundKeywords = riskKeywords.filter(keyword => lowerText.includes(keyword));

    return {
      isCompliant: hasAnyWarning || foundKeywords.length >= 2,
      hasWarning: hasAnyWarning,
      foundKeywords,
      message: hasAnyWarning
        ? 'Risk warning is present'
        : foundKeywords.length >= 2
        ? 'Risk-related keywords found'
        : 'Missing required risk warning'
    };
  }

  /**
   * Check if CTA (Call to Action) is appropriate and compliant
   * @param {string} text - Script text
   * @returns {Object} CTA compliance result
   */
  static checkCTA(text) {
    if (!text || typeof text !== 'string') {
      return {
        isCompliant: false,
        message: 'Invalid or empty text'
      };
    }

    const lowerText = text.toLowerCase();

    // Prohibited CTAs that promise guaranteed returns
    const prohibitedPhrases = [
      'مضمون',
      'ربح مؤكد',
      'بدون مخاطر',
      '100%',
      'دون خسارة'
    ];

    const foundProhibited = prohibitedPhrases.filter(phrase =>
      lowerText.includes(phrase)
    );

    // Approved CTAs
    const approvedCTAs = [
      'افتح حساب تجريبي',
      'تعلم المزيد',
      'زر موقعنا',
      'تواصل معنا',
      'استكشف الأسواق',
      'ابدأ التعلم'
    ];

    const hasApprovedCTA = approvedCTAs.some(cta =>
      lowerText.includes(cta.toLowerCase())
    );

    return {
      isCompliant: foundProhibited.length === 0,
      hasApprovedCTA,
      prohibitedFound: foundProhibited,
      message: foundProhibited.length === 0
        ? 'CTA is compliant'
        : `Found prohibited promises: ${foundProhibited.join(', ')}`
    };
  }

  /**
   * Check for balanced content (not overly promotional)
   * @param {string} text - Script text
   * @returns {Object} Balance check result
   */
  static checkBalance(text) {
    if (!text || typeof text !== 'string') {
      return {
        isBalanced: false,
        message: 'Invalid or empty text'
      };
    }

    const lowerText = text.toLowerCase();

    // Educational/informational words
    const educationalWords = [
      'تعلم', 'فهم', 'معرفة', 'استراتيجية', 'تحليل',
      'دراسة', 'بحث', 'معلومات', 'نصائح'
    ];

    // Promotional words
    const promotionalWords = [
      'افتح', 'سجل', 'اشترك', 'انضم', 'ابدأ',
      'احصل', 'اربح', 'استفد'
    ];

    const educationalCount = educationalWords.filter(word =>
      lowerText.includes(word)
    ).length;

    const promotionalCount = promotionalWords.filter(word =>
      lowerText.includes(word)
    ).length;

    // Educational content should be at least equal to promotional
    const isBalanced = educationalCount >= promotionalCount * 0.8;

    return {
      isBalanced,
      educationalCount,
      promotionalCount,
      ratio: promotionalCount > 0 ? (educationalCount / promotionalCount).toFixed(2) : 'N/A',
      message: isBalanced
        ? 'Content is well-balanced (educational vs promotional)'
        : 'Content is too promotional, needs more educational value'
    };
  }

  /**
   * Comprehensive compliance check
   * @param {string} text - Script text
   * @returns {Object} Complete compliance result
   */
  static checkCompliance(text) {
    const riskCheck = this.checkRiskWarning(text);
    const ctaCheck = this.checkCTA(text);
    const balanceCheck = this.checkBalance(text);

    const isCompliant = riskCheck.isCompliant && ctaCheck.isCompliant && balanceCheck.isBalanced;

    return {
      isCompliant,
      riskWarning: riskCheck,
      cta: ctaCheck,
      balance: balanceCheck,
      overallMessage: isCompliant
        ? 'Script passes all compliance checks'
        : 'Script has compliance issues that need to be addressed',
      recommendations: this.getRecommendations(riskCheck, ctaCheck, balanceCheck)
    };
  }

  /**
   * Get recommendations based on compliance checks
   * @param {Object} riskCheck - Risk warning check result
   * @param {Object} ctaCheck - CTA check result
   * @param {Object} balanceCheck - Balance check result
   * @returns {Array} List of recommendations
   */
  static getRecommendations(riskCheck, ctaCheck, balanceCheck) {
    const recommendations = [];

    if (!riskCheck.isCompliant) {
      recommendations.push({
        type: 'risk_warning',
        severity: 'critical',
        message: 'Add mandatory risk warning',
        suggestion: disclaimers.risk_warnings.short.ar
      });
    }

    if (!ctaCheck.isCompliant) {
      recommendations.push({
        type: 'cta',
        severity: 'critical',
        message: 'Remove prohibited promises/guarantees',
        suggestion: 'Use approved CTAs like demo account or educational resources'
      });
    }

    if (!balanceCheck.isBalanced) {
      recommendations.push({
        type: 'balance',
        severity: 'warning',
        message: 'Add more educational content',
        suggestion: 'Include market analysis, trading tips, or terminology explanations'
      });
    }

    return recommendations;
  }

  /**
   * Add risk warning to script if missing
   * @param {string} text - Original script text
   * @param {string} warningType - 'short', 'medium', or 'long'
   * @returns {string} Script with risk warning added
   */
  static addRiskWarning(text, warningType = 'short') {
    const warning = disclaimers.risk_warnings[warningType]?.ar || disclaimers.risk_warnings.short.ar;

    // Check if warning already exists
    if (text.includes('مخاطر') || text.includes('تخسر')) {
      return text;
    }

    // Add warning at the end, before CTA if present
    const lines = text.split('\n').filter(line => line.trim());
    const lastLine = lines[lines.length - 1];

    // If last line is a CTA, insert warning before it
    if (lastLine.includes('زر موقعنا') || lastLine.includes('افتح حساب') || lastLine.includes('تواصل')) {
      lines.splice(lines.length - 1, 0, warning);
      return lines.join('\n\n');
    }

    // Otherwise, add at the end
    return `${text}\n\n${warning}`;
  }
}

export default ComplianceChecker;
