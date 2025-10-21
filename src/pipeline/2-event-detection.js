import logger from '../utils/logger.js';
import { EventDetectionError } from '../utils/error-handler.js';

/**
 * Step 2: Event Detection
 * Analyzes market data to detect breaking news and calculate urgency score
 */
export class EventDetectionStep {
  constructor(config) {
    this.config = config;
    this.urgencyThreshold = config.env.pipeline.urgencyThreshold;
  }

  /**
   * Execute event detection
   */
  async execute(marketData) {
    try {
      logger.info('Starting event detection...');

      if (!marketData) {
        throw new Error('Market data is required for event detection');
      }

      // Analyze urgency based on multiple factors
      const urgencyFactors = {
        breakingNews: this.analyzeBreakingNews(marketData),
        priceVolatility: this.analyzePriceVolatility(marketData),
        economicEvents: this.analyzeEconomicEvents(marketData),
        marketSentiment: this.analyzeMarketSentiment(marketData)
      };

      // Calculate overall urgency score (0-10)
      const urgencyScore = this.calculateUrgencyScore(urgencyFactors);

      // Determine if this is urgent content
      const isUrgent = urgencyScore >= this.urgencyThreshold;

      const result = {
        urgencyScore,
        isUrgent,
        threshold: this.urgencyThreshold,
        factors: urgencyFactors,
        recommendation: this.getRecommendation(urgencyScore, isUrgent),
        timestamp: new Date().toISOString()
      };

      logger.info('Event detection completed', {
        urgencyScore: urgencyScore.toFixed(2),
        isUrgent,
        recommendation: result.recommendation
      });

      return result;
    } catch (error) {
      logger.error('Event detection failed', { error: error.message });
      throw new EventDetectionError('Failed to detect events', error);
    }
  }

  /**
   * Analyze breaking news urgency
   */
  analyzeBreakingNews(marketData) {
    const urgentEvents = marketData.summary?.urgentEvents || [];
    const breakingNewsContent = marketData.breakingNews?.answer || '';

    // Score based on number of urgent events and keywords
    const urgentKeywords = [
      'breaking', 'just announced', 'unexpected', 'emergency',
      'crisis', 'crash', 'surge', 'record'
    ];

    let score = 0;

    // +2 points per urgent event (max 6)
    score += Math.min(urgentEvents.length * 2, 6);

    // +0.5 points per urgent keyword (max 2)
    const keywordMatches = urgentKeywords.filter(keyword =>
      breakingNewsContent.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 0.5, 2);

    return {
      score: Math.min(score, 10),
      urgentEvents: urgentEvents.length,
      keywordMatches,
      details: 'Breaking news analysis'
    };
  }

  /**
   * Analyze price volatility
   */
  analyzePriceVolatility(marketData) {
    const forexContent = marketData.forex?.answer || '';
    const commoditiesContent = marketData.commodities?.answer || '';

    // Look for significant percentage changes
    const percentagePattern = /(\d+\.?\d*)%/g;
    const percentages = [];

    [forexContent, commoditiesContent].forEach(content => {
      const matches = content.match(percentagePattern);
      if (matches) {
        matches.forEach(match => {
          const value = parseFloat(match.replace('%', ''));
          if (!isNaN(value)) percentages.push(Math.abs(value));
        });
      }
    });

    // Calculate max volatility
    const maxVolatility = percentages.length > 0 ? Math.max(...percentages) : 0;

    // Score based on volatility
    let score = 0;
    if (maxVolatility > 5) score = 10;
    else if (maxVolatility > 3) score = 7;
    else if (maxVolatility > 2) score = 5;
    else if (maxVolatility > 1) score = 3;
    else if (maxVolatility > 0.5) score = 1;

    return {
      score,
      maxVolatility: maxVolatility.toFixed(2),
      significantMoves: percentages.filter(p => p > 1).length,
      details: 'Price volatility analysis'
    };
  }

  /**
   * Analyze economic events
   */
  analyzeEconomicEvents(marketData) {
    const economicContent = marketData.economicIndicators?.answer || '';

    // High-impact economic events
    const highImpactEvents = [
      'central bank', 'interest rate', 'fed decision', 'ecb meeting',
      'employment report', 'gdp', 'inflation report', 'nfp',
      'fomc', 'monetary policy', 'rate hike', 'rate cut'
    ];

    let score = 0;
    let matchedEvents = [];

    highImpactEvents.forEach(event => {
      if (economicContent.toLowerCase().includes(event)) {
        score += 1;
        matchedEvents.push(event);
      }
    });

    // Cap at 10
    score = Math.min(score, 10);

    return {
      score,
      highImpactEvents: matchedEvents.length,
      matchedEvents: matchedEvents.slice(0, 5),
      details: 'Economic events analysis'
    };
  }

  /**
   * Analyze market sentiment
   */
  analyzeMarketSentiment(marketData) {
    const allContent = [
      marketData.forex?.answer,
      marketData.commodities?.answer,
      marketData.breakingNews?.answer,
      marketData.economicIndicators?.answer
    ].filter(Boolean).join(' ');

    // Sentiment keywords
    const positiveKeywords = ['surge', 'rally', 'gain', 'rise', 'strengthen', 'bullish', 'optimism'];
    const negativeKeywords = ['crash', 'plunge', 'fall', 'drop', 'weaken', 'bearish', 'concern', 'crisis'];

    const positiveCount = positiveKeywords.filter(kw =>
      allContent.toLowerCase().includes(kw)
    ).length;

    const negativeCount = negativeKeywords.filter(kw =>
      allContent.toLowerCase().includes(kw)
    ).length;

    // Strong sentiment either way = higher urgency
    const sentimentStrength = Math.abs(positiveCount - negativeCount);
    const score = Math.min(sentimentStrength * 1.5, 10);

    return {
      score,
      positive: positiveCount,
      negative: negativeCount,
      sentiment: positiveCount > negativeCount ? 'positive' :
                 negativeCount > positiveCount ? 'negative' : 'neutral',
      details: 'Market sentiment analysis'
    };
  }

  /**
   * Calculate overall urgency score
   */
  calculateUrgencyScore(factors) {
    // Weighted average of all factors
    const weights = {
      breakingNews: 0.35,
      priceVolatility: 0.30,
      economicEvents: 0.25,
      marketSentiment: 0.10
    };

    const score =
      (factors.breakingNews.score * weights.breakingNews) +
      (factors.priceVolatility.score * weights.priceVolatility) +
      (factors.economicEvents.score * weights.economicEvents) +
      (factors.marketSentiment.score * weights.marketSentiment);

    return Math.min(Math.max(score, 0), 10); // Clamp between 0-10
  }

  /**
   * Get content recommendation based on urgency
   */
  getRecommendation(urgencyScore, isUrgent) {
    if (urgencyScore >= 9) {
      return 'URGENT: Create and publish breaking news video immediately';
    } else if (urgencyScore >= 7) {
      return 'HIGH PRIORITY: Create time-sensitive content within 2 hours';
    } else if (urgencyScore >= 5) {
      return 'MODERATE: Consider creating relevant market update video';
    } else if (urgencyScore >= 3) {
      return 'LOW PRIORITY: Include in next scheduled educational content';
    } else {
      return 'NORMAL: Proceed with regular scheduled content';
    }
  }
}

export default EventDetectionStep;
