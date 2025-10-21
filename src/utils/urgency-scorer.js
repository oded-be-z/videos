/**
 * Urgency Scorer
 * Scores events from 1-10 based on multiple factors
 * Scores 8+ trigger override of scheduled content
 */
class UrgencyScorer {
  constructor() {
    this.threshold = parseInt(process.env.URGENCY_THRESHOLD) || 8;

    // Base scores for different event types
    this.baseScores = {
      'fed_decision': 10,
      'rate_change': 10,
      'war': 10,
      'market_crash': 10,
      'default': 10,
      'emergency': 9,
      'major_hack': 9,
      'trade_war': 8,
      'sanctions': 8,
      'earnings': 6,
      'analyst_rating': 4,
      'technical_analysis': 3
    };

    // Time decay factors (how quickly urgency decreases)
    this.timeDecay = {
      0: 1.0,      // 0-1 hours: full urgency
      1: 0.9,      // 1-2 hours: 90%
      2: 0.8,      // 2-3 hours: 80%
      3: 0.7,      // 3-4 hours: 70%
      6: 0.5,      // 6-12 hours: 50%
      12: 0.3,     // 12-24 hours: 30%
      24: 0.1      // 24+ hours: 10%
    };
  }

  /**
   * Calculate urgency score for an event
   * @param {object} event - Event object from EventDetector
   * @param {object} context - Additional context (market data, time, etc.)
   * @returns {number} - Urgency score (1-10)
   */
  calculateScore(event, context = {}) {
    let score = 0;

    // Base score from event category
    score += this.getCategoryScore(event);

    // Market impact modifier
    if (event.marketImpact) {
      score += 2;
    }

    // Time sensitivity modifier
    if (event.timeSensitive) {
      score += 1;
    }

    // Multiple keywords indicate more significant event
    const keywordBonus = Math.min(event.keywords?.length || 0, 3) * 0.5;
    score += keywordBonus;

    // Context modifiers
    if (context.priceChange) {
      score += this.getPriceChangeModifier(context.priceChange);
    }

    if (context.volume) {
      score += this.getVolumeModifier(context.volume);
    }

    if (context.hoursSinceEvent) {
      score *= this.getTimeDecay(context.hoursSinceEvent);
    }

    // Ensure score is between 1 and 10
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Get base score from event category
   * @param {object} event - Event object
   * @returns {number} - Base score
   */
  getCategoryScore(event) {
    if (event.category === 'critical') return 8;
    if (event.category === 'high') return 6;
    if (event.category === 'medium') return 4;
    return 2;
  }

  /**
   * Calculate modifier based on price change percentage
   * @param {number} priceChange - Percentage change
   * @returns {number} - Score modifier
   */
  getPriceChangeModifier(priceChange) {
    const absChange = Math.abs(priceChange);
    if (absChange >= 10) return 3;
    if (absChange >= 5) return 2;
    if (absChange >= 3) return 1;
    if (absChange >= 1) return 0.5;
    return 0;
  }

  /**
   * Calculate modifier based on trading volume
   * @param {object} volume - Volume data
   * @returns {number} - Score modifier
   */
  getVolumeModifier(volume) {
    if (!volume || !volume.current || !volume.average) {
      return 0;
    }

    const ratio = volume.current / volume.average;
    if (ratio >= 3) return 2;      // 3x average volume
    if (ratio >= 2) return 1.5;    // 2x average volume
    if (ratio >= 1.5) return 1;    // 1.5x average volume
    return 0;
  }

  /**
   * Get time decay factor
   * @param {number} hours - Hours since event
   * @returns {number} - Decay multiplier
   */
  getTimeDecay(hours) {
    for (const [threshold, decay] of Object.entries(this.timeDecay).reverse()) {
      if (hours >= parseInt(threshold)) {
        return decay;
      }
    }
    return 1.0;
  }

  /**
   * Score multiple events and return prioritized list
   * @param {object[]} events - Array of events
   * @param {object} context - Shared context
   * @returns {object[]} - Events with scores, sorted by urgency
   */
  scoreEvents(events, context = {}) {
    return events
      .map(event => ({
        ...event,
        score: this.calculateScore(event, context),
        shouldOverride: this.shouldOverrideContent(
          this.calculateScore(event, context)
        )
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Determine if event should override scheduled content
   * @param {number} score - Urgency score
   * @returns {boolean}
   */
  shouldOverrideContent(score) {
    return score >= this.threshold;
  }

  /**
   * Score a market research result
   * @param {object} research - Research result from Perplexity
   * @param {object} marketData - Price/volume data
   * @returns {object} - Scored research
   */
  scoreResearch(research, marketData = {}) {
    const EventDetector = require('./event-detector');
    const detector = new EventDetector();

    const analysis = detector.detectBreakingNews(research);
    const scoredEvents = this.scoreEvents(analysis.events, marketData);

    return {
      ...analysis,
      scoredEvents,
      maxScore: scoredEvents.length > 0 ? scoredEvents[0].score : 0,
      shouldOverride: scoredEvents.some(e => e.shouldOverride),
      criticalCount: scoredEvents.filter(e => e.score >= 9).length,
      highCount: scoredEvents.filter(e => e.score >= 7 && e.score < 9).length
    };
  }

  /**
   * Generate urgency report
   * @param {object[]} scoredEvents - Events with scores
   * @returns {string} - Human-readable report
   */
  generateReport(scoredEvents) {
    if (scoredEvents.length === 0) {
      return 'No urgent events detected';
    }

    const lines = ['=== URGENCY REPORT ===\n'];

    const overrideEvents = scoredEvents.filter(e => e.shouldOverride);
    if (overrideEvents.length > 0) {
      lines.push(`⚠️  ${overrideEvents.length} CRITICAL EVENT(S) - OVERRIDE RECOMMENDED\n`);
    }

    scoredEvents.slice(0, 10).forEach((event, index) => {
      const emoji = event.score >= 9 ? '🔴' : event.score >= 7 ? '🟠' : '🟡';
      lines.push(`${emoji} [${event.score}/10] ${event.text.substring(0, 100)}...`);
    });

    return lines.join('\n');
  }

  /**
   * Compare two events and return the more urgent one
   * @param {object} event1 - First event with score
   * @param {object} event2 - Second event with score
   * @returns {object} - More urgent event
   */
  compareUrgency(event1, event2) {
    if (!event1) return event2;
    if (!event2) return event1;

    const score1 = event1.score || this.calculateScore(event1);
    const score2 = event2.score || this.calculateScore(event2);

    return score1 >= score2 ? event1 : event2;
  }
}

module.exports = UrgencyScorer;
