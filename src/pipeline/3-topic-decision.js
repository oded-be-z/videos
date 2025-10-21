import logger from '../utils/logger.js';

/**
 * Step 3: Topic Decision
 * Hybrid logic: Breaking news (if urgent) vs. Scheduled educational content
 */
export class TopicDecisionStep {
  constructor(config) {
    this.config = config;
    this.schedule = config.schedule;
    this.topics = config.topics;
  }

  /**
   * Execute topic decision
   */
  async execute(urgencyData, marketData) {
    try {
      logger.info('Starting topic decision...');

      const { urgencyScore, isUrgent } = urgencyData;

      let topic;
      let contentType;
      let reasoning;

      if (isUrgent) {
        // URGENT: Breaking news content
        topic = this.selectBreakingNewsTopic(marketData, urgencyData);
        contentType = 'breaking_news';
        reasoning = `Urgency score ${urgencyScore.toFixed(2)} exceeds threshold. Creating time-sensitive content.`;
      } else {
        // NORMAL: Scheduled educational content
        topic = this.selectScheduledTopic();
        contentType = 'educational';
        reasoning = `Regular scheduled content. Urgency score ${urgencyScore.toFixed(2)} below threshold.`;
      }

      const result = {
        topic,
        contentType,
        urgencyScore,
        isUrgent,
        reasoning,
        metadata: this.getTopicMetadata(topic, contentType),
        timestamp: new Date().toISOString()
      };

      logger.info('Topic decision completed', {
        contentType,
        topic: topic.title || topic.category,
        urgencyScore: urgencyScore.toFixed(2)
      });

      return result;
    } catch (error) {
      logger.error('Topic decision failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Select breaking news topic based on urgency factors
   */
  selectBreakingNewsTopic(marketData, urgencyData) {
    const { factors } = urgencyData;

    // Determine primary topic based on highest scoring factor
    const factorScores = {
      forex: factors.priceVolatility.score,
      economic: factors.economicEvents.score,
      breaking: factors.breakingNews.score,
      sentiment: factors.marketSentiment.score
    };

    const topFactor = Object.entries(factorScores)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Generate topic based on top factor
    let topic = {
      category: 'breaking_news',
      angle: '',
      focus: '',
      urgentEvents: marketData.summary?.urgentEvents || []
    };

    switch (topFactor) {
      case 'forex':
        topic.title = 'عاجل: تحركات حادة في سوق العملات';
        topic.angle = 'Major currency movements and their impact on traders';
        topic.focus = this.extractForexFocus(marketData);
        break;

      case 'economic':
        topic.title = 'عاجل: قرارات اقتصادية مهمة';
        topic.angle = 'Critical economic decisions affecting markets';
        topic.focus = this.extractEconomicFocus(marketData);
        break;

      case 'breaking':
        topic.title = 'عاجل: آخر تطورات الأسواق المالية';
        topic.angle = 'Breaking financial news and market reactions';
        topic.focus = this.extractBreakingNewsFocus(marketData);
        break;

      default:
        topic.title = 'تحديث عاجل: تحليل السوق';
        topic.angle = 'Urgent market analysis and trading opportunities';
        topic.focus = 'General market update based on recent developments';
    }

    return topic;
  }

  /**
   * Extract forex-focused content
   */
  extractForexFocus(marketData) {
    const keyPoints = marketData.summary?.keyPoints || [];
    const forexPoints = keyPoints.filter(point =>
      /eur|usd|gbp|jpy|chf|aud|cad|forex|currency|exchange/i.test(point)
    );

    return forexPoints.slice(0, 3).join('; ') || 'Major forex pairs analysis';
  }

  /**
   * Extract economic-focused content
   */
  extractEconomicFocus(marketData) {
    const economicContent = marketData.economicIndicators?.answer || '';
    const sentences = economicContent.split(/[.!?]+/).filter(s => s.length > 20);
    return sentences.slice(0, 2).join('. ') || 'Economic indicators update';
  }

  /**
   * Extract breaking news focus
   */
  extractBreakingNewsFocus(marketData) {
    const urgentEvents = marketData.summary?.urgentEvents || [];
    return urgentEvents.slice(0, 2).join('; ') || 'Latest market developments';
  }

  /**
   * Select scheduled educational topic
   */
  selectScheduledTopic() {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentHour = now.getHours();

    // Find matching scheduled slot
    const scheduledSlot = this.schedule.publishTimes.find(slot => {
      const [hour] = slot.time.split(':').map(Number);
      return slot.day === dayOfWeek && Math.abs(hour - currentHour) <= 1;
    });

    // Educational topics rotation
    const educationalTopics = [
      {
        title: 'أساسيات التداول للمبتدئين',
        category: 'trading_basics',
        angle: 'Introduction to forex trading fundamentals',
        focus: 'Basic concepts every new trader should know',
        targetAudience: 'beginners'
      },
      {
        title: 'إدارة المخاطر في التداول',
        category: 'risk_management',
        angle: 'Protecting your capital through proper risk management',
        focus: 'Stop loss, position sizing, and risk-reward ratios',
        targetAudience: 'intermediate'
      },
      {
        title: 'التحليل الفني: المؤشرات الأساسية',
        category: 'technical_analysis',
        angle: 'Understanding key technical indicators',
        focus: 'Moving averages, RSI, MACD, and support/resistance',
        targetAudience: 'intermediate'
      },
      {
        title: 'علم النفس في التداول',
        category: 'trading_psychology',
        angle: 'Mastering emotions for successful trading',
        focus: 'Discipline, patience, and emotional control',
        targetAudience: 'all_levels'
      },
      {
        title: 'فهم الرافعة المالية',
        category: 'trading_basics',
        angle: 'How leverage works in forex trading',
        focus: 'Benefits, risks, and proper leverage usage',
        targetAudience: 'beginners'
      },
      {
        title: 'استراتيجيات التداول اليومي',
        category: 'technical_analysis',
        angle: 'Effective day trading strategies',
        focus: 'Scalping, momentum trading, and breakout strategies',
        targetAudience: 'advanced'
      }
    ];

    // Rotate through topics based on day of year
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const topicIndex = dayOfYear % educationalTopics.length;

    const selectedTopic = educationalTopics[topicIndex];

    return {
      ...selectedTopic,
      persona: scheduledSlot?.persona || 'maha',
      scheduledTime: scheduledSlot?.time || 'unscheduled'
    };
  }

  /**
   * Get topic metadata for video production
   */
  getTopicMetadata(topic, contentType) {
    return {
      category: topic.category,
      tags: this.generateTags(topic, contentType),
      hashtags: this.generateHashtags(topic, contentType),
      duration: contentType === 'breaking_news' ? 45 : 60,
      priority: contentType === 'breaking_news' ? 'high' : 'normal',
      thumbnail_style: contentType === 'breaking_news' ? 'urgent' : 'educational'
    };
  }

  /**
   * Generate relevant tags
   */
  generateTags(topic, contentType) {
    const baseTags = ['Seekapa', 'فوركس', 'تداول', 'Forex', 'Trading'];

    const contentTypeTags = contentType === 'breaking_news'
      ? ['Breaking News', 'Market Update', 'أخبار عاجلة', 'تحديث السوق']
      : ['Education', 'Tutorial', 'تعليم', 'شرح'];

    const categoryTags = {
      forex_analysis: ['Forex Analysis', 'تحليل العملات'],
      trading_basics: ['Trading Basics', 'أساسيات التداول'],
      risk_management: ['Risk Management', 'إدارة المخاطر'],
      technical_analysis: ['Technical Analysis', 'التحليل الفني'],
      trading_psychology: ['Trading Psychology', 'علم نفس التداول']
    };

    const specificTags = categoryTags[topic.category] || [];

    return [...baseTags, ...contentTypeTags, ...specificTags];
  }

  /**
   * Generate hashtags for social media
   */
  generateHashtags(topic, contentType) {
    const hashtags = [
      '#Seekapa',
      '#فوركس',
      '#تداول',
      '#ForexTrading',
      '#TradingEducation'
    ];

    if (contentType === 'breaking_news') {
      hashtags.push('#BreakingNews', '#MarketUpdate', '#عاجل');
    } else {
      hashtags.push('#LearnTrading', '#تعلم_التداول');
    }

    return hashtags;
  }
}

export default TopicDecisionStep;
