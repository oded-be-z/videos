const moment = require('moment');

/**
 * YouTube Metadata Generator
 * Generates SEO-optimized titles, descriptions, and tags for YouTube videos
 */
class MetadataGenerator {
  /**
   * Generate video title
   * Format: "[Topic] | [Persona] | Seekapa - [Date]"
   * @param {Object} options - Title options
   * @param {string} options.topic - Video topic in Arabic
   * @param {string} options.personaName - Persona name
   * @param {string} options.language - Language code (ar/en)
   * @param {Date} options.date - Video date (defaults to today)
   * @returns {string} Formatted title
   */
  static generateTitle(options) {
    const {
      topic,
      personaName,
      language = 'ar',
      date = new Date()
    } = options;

    // Format date in Arabic or English
    const formattedDate = language === 'ar'
      ? this.formatArabicDate(date)
      : moment(date).format('MMMM D, YYYY');

    // Build title
    const title = `${topic} | ${personaName} | Seekapa - ${formattedDate}`;

    // YouTube title limit is 100 characters
    if (title.length > 100) {
      console.warn(`Title is ${title.length} characters (max 100). Consider shortening.`);
      return title.substring(0, 97) + '...';
    }

    return title;
  }

  /**
   * Generate video description
   * @param {Object} options - Description options
   * @param {string} options.topic - Video topic
   * @param {string} options.summary - Video summary (2-3 sentences)
   * @param {Array} options.tradingPairs - Trading pairs mentioned [{pair, price}]
   * @param {string} options.keyInsight - Main takeaway from video
   * @param {Object} options.persona - Persona information {name, bio, specialty}
   * @param {Array} options.hashtags - Additional hashtags
   * @returns {string} Formatted description
   */
  static generateDescription(options) {
    const {
      topic,
      summary,
      tradingPairs = [],
      keyInsight,
      persona,
      hashtags = []
    } = options;

    let description = '';

    // Video summary
    description += `${summary}\n\n`;

    // Trading pairs section (if provided)
    if (tradingPairs.length > 0) {
      description += '📊 الأزواج المتداولة:\n';
      tradingPairs.forEach(pair => {
        description += `- ${pair.pair}: ${pair.price}\n`;
      });
      description += '\n';
    }

    // Key insight
    if (keyInsight) {
      description += '💡 النصيحة:\n';
      description += `${keyInsight}\n\n`;
    }

    // Risk disclaimer (REQUIRED for trading content)
    description += '⚠️ تنويه المخاطر:\n';
    description += 'تداول الفوركس والعقود مقابل الفروقات يحمل مخاطر عالية وقد لا يكون مناسباً لجميع المستثمرين.\n';
    description += 'قد تخسر بعض أو كل رأس مالك المستثمر.\n';
    description += 'هذا المحتوى لأغراض تعليمية فقط وليس نصيحة استثمارية.\n';
    description += 'استشر مستشاراً مالياً مستقلاً قبل اتخاذ أي قرار استثماري.\n\n';

    // Call to action
    description += '🔗 ابدأ التداول مع Seekapa:\n';
    description += 'https://seekapa.com\n\n';

    // Persona bio
    if (persona) {
      description += `👤 عن ${persona.name}:\n`;
      description += `${persona.bio}\n`;
      if (persona.specialty) {
        description += `التخصص: ${persona.specialty}\n`;
      }
      description += '\n';
    }

    // Social media links
    description += '📱 تابعنا:\n';
    description += 'Instagram: https://instagram.com/seekapa\n';
    description += 'Twitter: https://twitter.com/seekapa\n';
    description += 'LinkedIn: https://linkedin.com/company/seekapa\n\n';

    // Hashtags
    const allHashtags = [
      'فوركس',
      'تداول',
      'Seekapa',
      'forex',
      'trading',
      ...hashtags
    ];

    if (persona && persona.tag) {
      allHashtags.push(persona.tag);
    }

    description += allHashtags.map(tag => `#${tag}`).join(' ');

    // YouTube description limit is 5000 characters
    if (description.length > 5000) {
      console.warn(`Description is ${description.length} characters (max 5000). Truncating.`);
      return description.substring(0, 4997) + '...';
    }

    return description;
  }

  /**
   * Generate video tags
   * @param {Object} options - Tag options
   * @param {string} options.topic - Video topic
   * @param {string} options.personaName - Persona name
   * @param {Array} options.tradingPairs - Trading pairs mentioned
   * @param {string} options.language - Content language
   * @param {Array} options.customTags - Additional custom tags
   * @returns {Array<string>} Array of tags
   */
  static generateTags(options) {
    const {
      topic,
      personaName,
      tradingPairs = [],
      language = 'ar',
      customTags = []
    } = options;

    const tags = [
      // Brand tags
      'Seekapa',
      'سيكابا',

      // Core trading tags (Arabic)
      'فوركس',
      'تداول',
      'تداول العملات',
      'أسواق المال',
      'التحليل الفني',
      'تحليل فني',

      // Core trading tags (English)
      'forex',
      'forex trading',
      'currency trading',
      'technical analysis',
      'trading signals',

      // Market tags
      'سوق الفوركس',
      'forex market',
      'financial markets',
      'أسواق الخليج',

      // Educational tags
      'تعليم التداول',
      'forex education',
      'trading tips',
      'نصائح التداول'
    ];

    // Add persona-specific tags
    if (personaName) {
      tags.push(personaName);
      tags.push(personaName.replace(/\s+/g, '')); // Without spaces
    }

    // Add trading pair tags
    tradingPairs.forEach(pair => {
      if (pair.pair) {
        tags.push(pair.pair);
        tags.push(pair.pair.replace('/', '')); // e.g., EURUSD
      }
    });

    // Add custom tags
    tags.push(...customTags);

    // Remove duplicates and limit to 500 characters total
    const uniqueTags = [...new Set(tags)];
    const filteredTags = [];
    let totalLength = 0;

    for (const tag of uniqueTags) {
      if (totalLength + tag.length + 1 <= 500 && filteredTags.length < 50) {
        filteredTags.push(tag);
        totalLength += tag.length + 1; // +1 for comma
      }
    }

    return filteredTags;
  }

  /**
   * Generate complete metadata package
   * @param {Object} videoData - Complete video data
   * @returns {Object} Complete metadata package
   */
  static generateMetadata(videoData) {
    const {
      topic,
      topicArabic,
      summary,
      tradingPairs,
      keyInsight,
      persona,
      language = 'ar',
      customTags = [],
      date = new Date()
    } = videoData;

    return {
      title: this.generateTitle({
        topic: topicArabic || topic,
        personaName: persona.name,
        language: language,
        date: date
      }),
      description: this.generateDescription({
        topic: topicArabic || topic,
        summary: summary,
        tradingPairs: tradingPairs,
        keyInsight: keyInsight,
        persona: persona,
        hashtags: customTags
      }),
      tags: this.generateTags({
        topic: topicArabic || topic,
        personaName: persona.name,
        tradingPairs: tradingPairs,
        language: language,
        customTags: customTags
      }),
      language: language,
      audioLanguage: language
    };
  }

  /**
   * Format date in Arabic
   * @param {Date} date - Date to format
   * @returns {string} Formatted Arabic date
   */
  static formatArabicDate(date) {
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const day = date.getDate();
    const month = arabicMonths[date.getMonth()];

    // Convert day to Arabic numerals
    const arabicDay = day.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');

    return `${arabicDay} ${month}`;
  }

  /**
   * Generate metadata for different video types
   */
  static generateByType(type, videoData) {
    switch (type) {
      case 'market_update':
        return this.generateMarketUpdateMetadata(videoData);
      case 'educational':
        return this.generateEducationalMetadata(videoData);
      case 'trading_tips':
        return this.generateTradingTipsMetadata(videoData);
      case 'market_analysis':
        return this.generateMarketAnalysisMetadata(videoData);
      default:
        return this.generateMetadata(videoData);
    }
  }

  /**
   * Generate metadata specifically for market update videos
   */
  static generateMarketUpdateMetadata(videoData) {
    const metadata = this.generateMetadata({
      ...videoData,
      topicArabic: `تحديث السوق - ${videoData.topicArabic || videoData.topic}`
    });

    // Add market update specific tags
    metadata.tags.push('تحديث السوق', 'market update', 'daily update', 'تحديث يومي');

    return metadata;
  }

  /**
   * Generate metadata for educational videos
   */
  static generateEducationalMetadata(videoData) {
    const metadata = this.generateMetadata({
      ...videoData,
      topicArabic: `تعليم: ${videoData.topicArabic || videoData.topic}`
    });

    // Add educational specific tags
    metadata.tags.push('تعليم', 'education', 'tutorial', 'شرح', 'learn trading');

    return metadata;
  }

  /**
   * Generate metadata for trading tips videos
   */
  static generateTradingTipsMetadata(videoData) {
    const metadata = this.generateMetadata({
      ...videoData,
      topicArabic: `نصيحة: ${videoData.topicArabic || videoData.topic}`
    });

    // Add tips specific tags
    metadata.tags.push('نصائح', 'tips', 'trading tips', 'نصائح التداول', 'strategy');

    return metadata;
  }

  /**
   * Generate metadata for market analysis videos
   */
  static generateMarketAnalysisMetadata(videoData) {
    const metadata = this.generateMetadata({
      ...videoData,
      topicArabic: `تحليل: ${videoData.topicArabic || videoData.topic}`
    });

    // Add analysis specific tags
    metadata.tags.push('تحليل', 'analysis', 'market analysis', 'تحليل السوق', 'charts');

    return metadata;
  }
}

module.exports = MetadataGenerator;
