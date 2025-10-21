/**
 * Event Detector
 * Detects breaking news and market-moving events
 */
class EventDetector {
  constructor() {
    // Keywords that indicate high-impact events
    this.urgentKeywords = {
      critical: [
        'fed decision',
        'interest rate',
        'rate hike',
        'rate cut',
        'central bank',
        'market crash',
        'flash crash',
        'circuit breaker',
        'trading halt',
        'black swan',
        'war',
        'military action',
        'nuclear',
        'terrorist attack',
        'coup',
        'default',
        'bankruptcy',
        'collapse'
      ],
      high: [
        'inflation',
        'cpi',
        'jobs report',
        'nonfarm payroll',
        'unemployment',
        'gdp',
        'recession',
        'bear market',
        'bull market',
        'sanctions',
        'trade war',
        'tariff',
        'opec',
        'production cut',
        'supply shock',
        'regulatory',
        'sec announcement',
        'ban',
        'fraud',
        'hack',
        'breach'
      ],
      medium: [
        'earnings',
        'forecast',
        'guidance',
        'outlook',
        'volatility',
        'rally',
        'selloff',
        'correction',
        'rebound',
        'support',
        'resistance',
        'breakout',
        'analyst upgrade',
        'analyst downgrade',
        'merger',
        'acquisition'
      ]
    };

    // Market impact indicators
    this.marketImpactPatterns = [
      /(\d+)%\s+(surge|crash|drop|fall|rise|gain|rally)/i,
      /all-time (high|low)/i,
      /record (high|low)/i,
      /historical/i,
      /unprecedented/i,
      /emergency/i,
      /urgent/i,
      /breaking/i,
      /alert/i
    ];

    // Time sensitivity patterns
    this.timeSensitivePatterns = [
      /just now/i,
      /moments ago/i,
      /breaking/i,
      /urgent/i,
      /developing/i,
      /live/i,
      /happening now/i,
      /minutes ago/i,
      /hours ago/i
    ];
  }

  /**
   * Detect events from text content
   * @param {string} content - Text to analyze
   * @returns {object[]} - Array of detected events
   */
  detectEvents(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const events = [];
    const sentences = this.splitIntoSentences(content);

    for (const sentence of sentences) {
      const event = this.analyzeEvent(sentence);
      if (event.isEvent) {
        events.push(event);
      }
    }

    return events.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * Analyze a single sentence for event indicators
   * @param {string} sentence - Sentence to analyze
   * @returns {object} - Event analysis
   */
  analyzeEvent(sentence) {
    const lowerSentence = sentence.toLowerCase();

    const analysis = {
      isEvent: false,
      text: sentence,
      urgency: 0,
      category: 'unknown',
      keywords: [],
      timesSensitive: false,
      marketImpact: false
    };

    // Check for urgent keywords
    for (const [category, keywords] of Object.entries(this.urgentKeywords)) {
      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword)) {
          analysis.isEvent = true;
          analysis.keywords.push(keyword);

          // Assign base urgency by category
          if (category === 'critical') {
            analysis.urgency = Math.max(analysis.urgency, 9);
            analysis.category = 'critical';
          } else if (category === 'high') {
            analysis.urgency = Math.max(analysis.urgency, 7);
            if (analysis.category !== 'critical') {
              analysis.category = 'high';
            }
          } else if (category === 'medium') {
            analysis.urgency = Math.max(analysis.urgency, 5);
            if (analysis.category === 'unknown') {
              analysis.category = 'medium';
            }
          }
        }
      }
    }

    // Check for market impact patterns
    for (const pattern of this.marketImpactPatterns) {
      if (pattern.test(sentence)) {
        analysis.marketImpact = true;
        analysis.urgency = Math.min(analysis.urgency + 1, 10);

        // Extract percentage if present
        const percentMatch = sentence.match(/(\d+(?:\.\d+)?)%/);
        if (percentMatch) {
          const percent = parseFloat(percentMatch[1]);
          if (percent >= 5) {
            analysis.urgency = Math.min(analysis.urgency + 1, 10);
          }
          if (percent >= 10) {
            analysis.urgency = Math.min(analysis.urgency + 1, 10);
          }
        }
      }
    }

    // Check for time sensitivity
    for (const pattern of this.timeSensitivePatterns) {
      if (pattern.test(sentence)) {
        analysis.timeSensitive = true;
        analysis.urgency = Math.min(analysis.urgency + 1, 10);
        break;
      }
    }

    return analysis;
  }

  /**
   * Detect breaking news from Perplexity response
   * @param {object} perplexityResponse - Response from Perplexity API
   * @returns {object} - Breaking news analysis
   */
  detectBreakingNews(perplexityResponse) {
    if (!perplexityResponse || !perplexityResponse.content) {
      return {
        hasBreakingNews: false,
        events: [],
        maxUrgency: 0
      };
    }

    const events = this.detectEvents(perplexityResponse.content);
    const criticalEvents = events.filter(e => e.urgency >= 8);
    const maxUrgency = events.length > 0 ? Math.max(...events.map(e => e.urgency)) : 0;

    return {
      hasBreakingNews: criticalEvents.length > 0,
      events,
      criticalEvents,
      maxUrgency,
      citations: perplexityResponse.citations || [],
      timestamp: perplexityResponse.timestamp
    };
  }

  /**
   * Extract market-relevant events
   * @param {object[]} events - Array of events
   * @returns {object} - Categorized events
   */
  categorizeEvents(events) {
    return {
      critical: events.filter(e => e.urgency >= 9),
      high: events.filter(e => e.urgency >= 7 && e.urgency < 9),
      medium: events.filter(e => e.urgency >= 5 && e.urgency < 7),
      low: events.filter(e => e.urgency < 5)
    };
  }

  /**
   * Split text into sentences
   * @param {string} text - Text to split
   * @returns {string[]} - Array of sentences
   */
  splitIntoSentences(text) {
    // Simple sentence splitting
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  /**
   * Generate event summary
   * @param {object[]} events - Array of events
   * @returns {string} - Summary text
   */
  generateSummary(events) {
    if (events.length === 0) {
      return 'No significant events detected';
    }

    const categorized = this.categorizeEvents(events);
    const parts = [];

    if (categorized.critical.length > 0) {
      parts.push(`${categorized.critical.length} CRITICAL event(s)`);
    }
    if (categorized.high.length > 0) {
      parts.push(`${categorized.high.length} high-priority event(s)`);
    }
    if (categorized.medium.length > 0) {
      parts.push(`${categorized.medium.length} medium-priority event(s)`);
    }

    return `Detected: ${parts.join(', ')}`;
  }
}

module.exports = EventDetector;
