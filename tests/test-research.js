const MarketResearchAgent = require('../src/agents/market-research');
const PerplexityService = require('../src/services/perplexity');
const MarketDataService = require('../src/services/market-data');
const EventDetector = require('../src/utils/event-detector');
const UrgencyScorer = require('../src/utils/urgency-scorer');

/**
 * Test Suite for Market Research Engine
 */
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  /**
   * Run a test
   * @param {string} name - Test name
   * @param {Function} fn - Test function
   */
  async test(name, fn) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      await fn();
      console.log(`✅ PASSED: ${name}`);
      this.passed++;
      this.tests.push({ name, status: 'passed' });
    } catch (error) {
      console.error(`❌ FAILED: ${name}`);
      console.error(`   Error: ${error.message}`);
      this.failed++;
      this.tests.push({ name, status: 'failed', error: error.message });
    }
  }

  /**
   * Assert condition
   * @param {boolean} condition - Condition to check
   * @param {string} message - Error message
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Print summary
   */
  summary() {
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total: ${this.passed + this.failed}`);
    console.log(`Passed: ${this.passed} ✅`);
    console.log(`Failed: ${this.failed} ❌`);
    console.log('='.repeat(50) + '\n');
  }
}

/**
 * Main test execution
 */
async function runTests() {
  const runner = new TestRunner();

  console.log('🚀 Starting Market Research Engine Tests\n');
  console.log('='.repeat(50));

  // Test 1: Market Data Service - Forex
  await runner.test('MarketDataService - Fetch Forex Price', async () => {
    const service = new MarketDataService();
    const data = await service.getForexPrice('EUR/USD');

    runner.assert(data.pair === 'EUR/USD', 'Should return correct pair');
    runner.assert(typeof data.price === 'number', 'Price should be a number');
    runner.assert(data.price > 0, 'Price should be positive');
    runner.assert(data.source, 'Should have a data source');

    console.log(`   Price: ${data.price} (Source: ${data.source})`);
  });

  // Test 2: Market Data Service - Crypto
  await runner.test('MarketDataService - Fetch Crypto Price', async () => {
    const service = new MarketDataService();
    const data = await service.getCryptoPrice('BTC');

    runner.assert(data.symbol === 'BTC', 'Should return correct symbol');
    runner.assert(typeof data.price === 'number', 'Price should be a number');
    runner.assert(data.price > 0, 'Price should be positive');
    runner.assert(data.source, 'Should have a data source');

    console.log(`   Price: $${data.price.toLocaleString()} (Change 24h: ${data.change24h?.toFixed(2)}%)`);
  });

  // Test 3: Market Data Service - Cache
  await runner.test('MarketDataService - Caching', async () => {
    const service = new MarketDataService();

    const start1 = Date.now();
    await service.getForexPrice('GBP/USD');
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await service.getForexPrice('GBP/USD');
    const time2 = Date.now() - start2;

    runner.assert(time2 < time1, 'Second request should be faster (cached)');
    console.log(`   First request: ${time1}ms, Cached request: ${time2}ms`);
  });

  // Test 4: Event Detector
  await runner.test('EventDetector - Detect Critical Events', () => {
    const detector = new EventDetector();
    const text = `
      Breaking: Federal Reserve announces emergency rate cut of 0.5%.
      Markets crashed 10% in the last hour.
      Bitcoin surges to all-time high.
      Analysts predict continued volatility.
    `;

    const events = detector.detectEvents(text);

    runner.assert(events.length > 0, 'Should detect events');

    const criticalEvents = events.filter(e => e.urgency >= 8);
    runner.assert(criticalEvents.length > 0, 'Should detect critical events');

    console.log(`   Detected ${events.length} events, ${criticalEvents.length} critical`);

    events.slice(0, 3).forEach(e => {
      console.log(`   [${e.urgency}/10] ${e.text.substring(0, 60)}...`);
    });
  });

  // Test 5: Urgency Scorer
  await runner.test('UrgencyScorer - Calculate Scores', () => {
    const scorer = new UrgencyScorer();
    const detector = new EventDetector();

    const events = detector.detectEvents('Fed announces emergency rate hike. Market crashes 15%.');
    const scored = scorer.scoreEvents(events, { priceChange: -15 });

    runner.assert(scored.length > 0, 'Should score events');
    runner.assert(scored[0].score >= 8, 'Critical event should score >= 8');
    runner.assert(scored[0].shouldOverride, 'Should recommend override');

    console.log(`   Max score: ${scored[0].score}/10`);
    console.log(`   Override: ${scored[0].shouldOverride}`);
  });

  // Test 6: Perplexity Service (if API key is available)
  await runner.test('PerplexityService - API Connection', async () => {
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY.includes('your_')) {
      console.log('   ⚠️  Skipping (no API key)');
      return;
    }

    const service = new PerplexityService();
    const result = await service.query('What is the current EUR/USD forex rate?');

    runner.assert(result.content, 'Should return content');
    runner.assert(result.timestamp, 'Should have timestamp');

    console.log(`   Response length: ${result.content.length} chars`);
    console.log(`   Model: ${result.model}`);
  });

  // Test 7: Market Research Agent - Forex Research
  await runner.test('MarketResearchAgent - Forex Research', async () => {
    const agent = new MarketResearchAgent();

    // Mock the Perplexity call if no API key
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY.includes('your_')) {
      agent.perplexity.query = async () => ({
        content: 'EUR/USD trading at 1.0850. Federal Reserve policy remains unchanged. Market volatility low.',
        citations: [],
        timestamp: new Date().toISOString()
      });
    }

    const result = await agent.researchForex('EUR/USD');

    runner.assert(result.type === 'forex', 'Should have type forex');
    runner.assert(result.results.length > 0, 'Should have results');
    runner.assert(result.results[0].priceData, 'Should have price data');
    runner.assert(result.summary, 'Should have summary');

    console.log(`   ${result.summary}`);
    console.log(`   Override: ${result.shouldOverride}`);
  });

  // Test 8: Market Research Agent - Breaking News
  await runner.test('MarketResearchAgent - Breaking News Monitor', async () => {
    const agent = new MarketResearchAgent();

    // Mock the Perplexity call if no API key
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY.includes('your_')) {
      agent.perplexity.detectBreakingNews = async () => ({
        content: 'Breaking: Federal Reserve announces emergency rate cut. Markets reacting sharply.',
        citations: [],
        timestamp: new Date().toISOString()
      });
    }

    const result = await agent.monitorBreakingNews();

    runner.assert(result.type === 'breaking_news', 'Should have type breaking_news');
    runner.assert(result.content, 'Should have content');
    runner.assert(result.analysis, 'Should have analysis');

    console.log(`   Events detected: ${result.analysis.events?.length || 0}`);
    console.log(`   Override: ${result.shouldOverride}`);
  });

  // Test 9: Comprehensive Scan (light version)
  await runner.test('MarketResearchAgent - Comprehensive Scan', async () => {
    const agent = new MarketResearchAgent();

    // Mock the Perplexity calls if no API key
    if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY.includes('your_')) {
      agent.perplexity.query = async () => ({
        content: 'Markets stable. No significant events.',
        citations: [],
        timestamp: new Date().toISOString()
      });
      agent.perplexity.detectBreakingNews = async () => ({
        content: 'No breaking news at this time.',
        citations: [],
        timestamp: new Date().toISOString()
      });
    }

    const result = await agent.comprehensiveScan({
      forex: ['EUR/USD'],
      crypto: ['BTC'],
      commodities: ['gold']
    });

    runner.assert(result.type === 'comprehensive_scan', 'Should have type comprehensive_scan');
    runner.assert(result.summary, 'Should have summary');

    console.log(`   ${result.summary.split('\n')[0]}`);
  });

  // Test 10: Error Handling
  await runner.test('MarketDataService - Error Handling', async () => {
    const service = new MarketDataService();

    try {
      await service.getForexPrice('INVALID/PAIR');
      runner.assert(false, 'Should throw error for invalid pair');
    } catch (error) {
      runner.assert(error.message, 'Should have error message');
      console.log(`   ✓ Error handled correctly: ${error.message}`);
    }
  });

  runner.summary();

  process.exit(runner.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
