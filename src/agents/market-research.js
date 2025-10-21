const PerplexityService = require('../services/perplexity');
const MarketDataService = require('../services/market-data');
const EventDetector = require('../utils/event-detector');
const UrgencyScorer = require('../utils/urgency-scorer');

/**
 * Market Research Agent
 * Main orchestrator for market research and event detection
 */
class MarketResearchAgent {
  constructor() {
    this.perplexity = new PerplexityService();
    this.marketData = new MarketDataService();
    this.eventDetector = new EventDetector();
    this.urgencyScorer = new UrgencyScorer();

    // Track last research time
    this.lastResearch = {
      forex: null,
      crypto: null,
      commodities: null,
      breaking: null
    };
  }

  /**
   * Research forex market comprehensively
   * @param {string|string[]} pairs - Single pair or array of pairs
   * @returns {Promise<object>}
   */
  async researchForex(pairs) {
    console.log(`[MarketResearch] Starting forex research for ${Array.isArray(pairs) ? pairs.join(', ') : pairs}`);

    try {
      const pairArray = Array.isArray(pairs) ? pairs : [pairs];
      const results = [];

      for (const pair of pairArray) {
        // Get price data
        const priceData = await this.marketData.getForexPrice(pair);

        // Get research from Perplexity
        const research = await this.perplexity.researchForex(pair);

        // Detect events
        const analysis = this.eventDetector.detectBreakingNews(research);

        // Calculate price change context
        const context = {
          priceChange: this.estimatePriceChange(priceData),
          hoursSinceEvent: 0 // Assume real-time for now
        };

        // Score urgency
        const scored = this.urgencyScorer.scoreResearch(research, context);

        results.push({
          pair,
          priceData,
          research: research.content,
          citations: research.citations,
          analysis: scored,
          timestamp: new Date().toISOString()
        });
      }

      this.lastResearch.forex = new Date();

      return {
        type: 'forex',
        results,
        summary: this.generateSummary(results),
        shouldOverride: results.some(r => r.analysis.shouldOverride)
      };
    } catch (error) {
      console.error('[MarketResearch] Forex research failed:', error.message);
      throw error;
    }
  }

  /**
   * Research cryptocurrency market
   * @param {string|string[]} symbols - Single symbol or array of symbols
   * @returns {Promise<object>}
   */
  async researchCrypto(symbols) {
    console.log(`[MarketResearch] Starting crypto research for ${Array.isArray(symbols) ? symbols.join(', ') : symbols}`);

    try {
      const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
      const results = [];

      for (const symbol of symbolArray) {
        // Get price data
        const priceData = await this.marketData.getCryptoPrice(symbol);

        // Get research from Perplexity
        const research = await this.perplexity.researchCrypto(symbol);

        // Detect events
        const analysis = this.eventDetector.detectBreakingNews(research);

        // Calculate context
        const context = {
          priceChange: priceData.change24h || 0,
          volume: {
            current: priceData.volume24h || 0,
            average: priceData.volume24h || 0 // Would need historical data
          },
          hoursSinceEvent: 0
        };

        // Score urgency
        const scored = this.urgencyScorer.scoreResearch(research, context);

        results.push({
          symbol,
          priceData,
          research: research.content,
          citations: research.citations,
          analysis: scored,
          timestamp: new Date().toISOString()
        });
      }

      this.lastResearch.crypto = new Date();

      return {
        type: 'crypto',
        results,
        summary: this.generateSummary(results),
        shouldOverride: results.some(r => r.analysis.shouldOverride)
      };
    } catch (error) {
      console.error('[MarketResearch] Crypto research failed:', error.message);
      throw error;
    }
  }

  /**
   * Research commodities market
   * @param {string|string[]} commodities - Single commodity or array
   * @returns {Promise<object>}
   */
  async researchCommodities(commodities) {
    console.log(`[MarketResearch] Starting commodities research for ${Array.isArray(commodities) ? commodities.join(', ') : commodities}`);

    try {
      const commodityArray = Array.isArray(commodities) ? commodities : [commodities];
      const results = [];

      for (const commodity of commodityArray) {
        // Get price data
        const priceData = await this.marketData.getCommodityPrice(commodity);

        // Get research from Perplexity
        const research = await this.perplexity.researchCommodity(commodity);

        // Detect events
        const analysis = this.eventDetector.detectBreakingNews(research);

        // Score urgency
        const scored = this.urgencyScorer.scoreResearch(research, {});

        results.push({
          commodity,
          priceData,
          research: research.content,
          citations: research.citations,
          analysis: scored,
          timestamp: new Date().toISOString()
        });
      }

      this.lastResearch.commodities = new Date();

      return {
        type: 'commodities',
        results,
        summary: this.generateSummary(results),
        shouldOverride: results.some(r => r.analysis.shouldOverride)
      };
    } catch (error) {
      console.error('[MarketResearch] Commodities research failed:', error.message);
      throw error;
    }
  }

  /**
   * Monitor for breaking news across all markets
   * @returns {Promise<object>}
   */
  async monitorBreakingNews() {
    console.log('[MarketResearch] Monitoring for breaking news...');

    try {
      // Query Perplexity for breaking news
      const research = await this.perplexity.detectBreakingNews();

      // Detect and score events
      const analysis = this.eventDetector.detectBreakingNews(research);
      const scored = this.urgencyScorer.scoreResearch(research, {});

      this.lastResearch.breaking = new Date();

      return {
        type: 'breaking_news',
        content: research.content,
        citations: research.citations,
        analysis: scored,
        shouldOverride: scored.shouldOverride,
        criticalEvents: scored.scoredEvents.filter(e => e.score >= 9),
        report: this.urgencyScorer.generateReport(scored.scoredEvents),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[MarketResearch] Breaking news monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * Research a specific market event
   * @param {string} event - Event description
   * @returns {Promise<object>}
   */
  async researchEvent(event) {
    console.log(`[MarketResearch] Researching event: ${event}`);

    try {
      const research = await this.perplexity.researchEvent(event);
      const analysis = this.eventDetector.detectBreakingNews(research);
      const scored = this.urgencyScorer.scoreResearch(research, {});

      return {
        type: 'event_analysis',
        event,
        content: research.content,
        citations: research.citations,
        analysis: scored,
        shouldOverride: scored.shouldOverride,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[MarketResearch] Event research failed:', error.message);
      throw error;
    }
  }

  /**
   * Comprehensive market scan
   * @param {object} targets - Markets to scan
   * @returns {Promise<object>}
   */
  async comprehensiveScan(targets = {}) {
    console.log('[MarketResearch] Starting comprehensive market scan...');

    const {
      forex = ['EUR/USD', 'GBP/USD', 'USD/JPY'],
      crypto = ['BTC', 'ETH'],
      commodities = ['gold', 'oil']
    } = targets;

    try {
      const [forexResults, cryptoResults, commodityResults, breakingNews] = await Promise.all([
        this.researchForex(forex).catch(e => ({ error: e.message, results: [] })),
        this.researchCrypto(crypto).catch(e => ({ error: e.message, results: [] })),
        this.researchCommodities(commodities).catch(e => ({ error: e.message, results: [] })),
        this.monitorBreakingNews().catch(e => ({ error: e.message }))
      ]);

      // Aggregate all critical events
      const allEvents = [];

      if (forexResults.results) {
        forexResults.results.forEach(r => {
          if (r.analysis.scoredEvents) {
            allEvents.push(...r.analysis.scoredEvents.map(e => ({ ...e, market: 'forex', symbol: r.pair })));
          }
        });
      }

      if (cryptoResults.results) {
        cryptoResults.results.forEach(r => {
          if (r.analysis.scoredEvents) {
            allEvents.push(...r.analysis.scoredEvents.map(e => ({ ...e, market: 'crypto', symbol: r.symbol })));
          }
        });
      }

      if (commodityResults.results) {
        commodityResults.results.forEach(r => {
          if (r.analysis.scoredEvents) {
            allEvents.push(...r.analysis.scoredEvents.map(e => ({ ...e, market: 'commodities', symbol: r.commodity })));
          }
        });
      }

      if (breakingNews.analysis?.scoredEvents) {
        allEvents.push(...breakingNews.analysis.scoredEvents.map(e => ({ ...e, market: 'breaking' })));
      }

      // Sort by urgency
      allEvents.sort((a, b) => b.score - a.score);

      const shouldOverride = allEvents.some(e => e.score >= this.urgencyScorer.threshold);

      return {
        type: 'comprehensive_scan',
        forex: forexResults,
        crypto: cryptoResults,
        commodities: commodityResults,
        breakingNews,
        topEvents: allEvents.slice(0, 10),
        shouldOverride,
        summary: this.generateComprehensiveSummary({
          forex: forexResults,
          crypto: cryptoResults,
          commodities: commodityResults,
          breakingNews,
          topEvents: allEvents.slice(0, 10)
        }),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[MarketResearch] Comprehensive scan failed:', error.message);
      throw error;
    }
  }

  /**
   * Estimate price change from price data
   * @param {object} priceData - Price data object
   * @returns {number} - Estimated percentage change
   */
  estimatePriceChange(priceData) {
    // Simple estimation based on bid-ask spread
    // In production, you'd compare to previous day's close
    if (priceData.bid && priceData.ask) {
      const mid = (priceData.bid + priceData.ask) / 2;
      return ((priceData.price - mid) / mid) * 100;
    }
    return 0;
  }

  /**
   * Generate summary for research results
   * @param {object[]} results - Research results
   * @returns {string}
   */
  generateSummary(results) {
    const totalEvents = results.reduce((sum, r) => sum + (r.analysis.events?.length || 0), 0);
    const criticalEvents = results.reduce((sum, r) => sum + (r.analysis.criticalCount || 0), 0);

    return `Found ${totalEvents} event(s) including ${criticalEvents} critical event(s) across ${results.length} market(s)`;
  }

  /**
   * Generate comprehensive summary
   * @param {object} scanResults - Results from comprehensive scan
   * @returns {string}
   */
  generateComprehensiveSummary(scanResults) {
    const lines = ['=== MARKET RESEARCH SUMMARY ===\n'];

    if (scanResults.topEvents.length > 0) {
      const critical = scanResults.topEvents.filter(e => e.score >= 9).length;
      const high = scanResults.topEvents.filter(e => e.score >= 7 && e.score < 9).length;

      lines.push(`Top Events: ${critical} critical, ${high} high-priority`);

      if (critical > 0) {
        lines.push('\nCRITICAL EVENTS:');
        scanResults.topEvents
          .filter(e => e.score >= 9)
          .slice(0, 3)
          .forEach(e => {
            lines.push(`  🔴 [${e.market}] ${e.text.substring(0, 80)}...`);
          });
      }
    }

    return lines.join('\n');
  }

  /**
   * Get status of last research
   * @returns {object}
   */
  getStatus() {
    return {
      lastResearch: this.lastResearch,
      cacheStatus: {
        entries: this.marketData.cache.size
      }
    };
  }
}

module.exports = MarketResearchAgent;
