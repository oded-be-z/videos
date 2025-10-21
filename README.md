# Market Research Engine

AI-powered market research engine for real-time forex, crypto, and commodities intelligence using Perplexity API and multiple market data sources.

## Features

- **Real-time Market Data**: Forex, cryptocurrency, and commodities prices
- **Breaking News Detection**: Automatic detection of market-moving events
- **Urgency Scoring**: 1-10 scale with automatic content override recommendations (8+)
- **Multi-source Aggregation**: Combines data from free and paid APIs
- **Intelligent Caching**: Reduces API calls and improves performance
- **Retry Logic**: Automatic retry with exponential backoff
- **Comprehensive Testing**: Full test suite included

## Quick Start

### Installation

```bash
cd /home/odedbe/videos-research-agent
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Add your API keys to `.env`:
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### Basic Usage

```javascript
const MarketResearchAgent = require('./src/agents/market-research');

const agent = new MarketResearchAgent();

// Research forex
const forexResult = await agent.researchForex('EUR/USD');
console.log(forexResult.summary);

// Monitor breaking news
const newsResult = await agent.monitorBreakingNews();
if (newsResult.shouldOverride) {
  console.log('CRITICAL EVENT - Override scheduled content!');
}
```

## Architecture

```
/home/odedbe/videos-research-agent/
├── src/
│   ├── agents/
│   │   └── market-research.js      # Main orchestrator
│   ├── services/
│   │   ├── perplexity.js           # Perplexity API integration
│   │   └── market-data.js          # Multi-source data aggregator
│   └── utils/
│       ├── event-detector.js       # Breaking news detection
│       └── urgency-scorer.js       # Score events 1-10
├── tests/
│   └── test-research.js            # Test suite
├── .env.example                    # Environment template
├── .env                            # Your configuration
├── API_DOCUMENTATION.md            # Complete API docs
└── README.md                       # This file
```

## APIs Used

### Primary Research
- **Perplexity API**: Real-time market research with web citations

### Market Data Sources
- **Forex**: Alpha Vantage (paid), ExchangeRate-API (free fallback)
- **Crypto**: CoinGecko (free), CoinMarketCap (paid)
- **Commodities**: Metals.live (free), EIA (free), World Bank (free)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API information.

## Core Modules

### 1. Market Research Agent
Main orchestrator for all market research operations.

```javascript
const agent = new MarketResearchAgent();

// Comprehensive market scan
const result = await agent.comprehensiveScan({
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
  crypto: ['BTC', 'ETH', 'XRP'],
  commodities: ['gold', 'oil', 'silver']
});
```

### 2. Perplexity Service
Real-time research using Perplexity API.

```javascript
const PerplexityService = require('./src/services/perplexity');
const perplexity = new PerplexityService();

const research = await perplexity.researchForex('EUR/USD');
console.log(research.content);
console.log(research.citations);
```

### 3. Market Data Service
Multi-source price data aggregator with caching.

```javascript
const MarketDataService = require('./src/services/market-data');
const marketData = new MarketDataService();

// Forex
const forexPrice = await marketData.getForexPrice('EUR/USD');

// Crypto
const cryptoPrice = await marketData.getCryptoPrice('BTC');

// Commodities
const goldPrice = await marketData.getCommodityPrice('gold');
```

### 4. Event Detector
Detects market-moving events from text.

```javascript
const EventDetector = require('./src/utils/event-detector');
const detector = new EventDetector();

const events = detector.detectEvents(newsText);
const categorized = detector.categorizeEvents(events);

console.log('Critical events:', categorized.critical);
```

### 5. Urgency Scorer
Scores events 1-10 based on market impact.

```javascript
const UrgencyScorer = require('./src/utils/urgency-scorer');
const scorer = new UrgencyScorer();

const scoredEvents = scorer.scoreEvents(events, {
  priceChange: -5.2,
  hoursSinceEvent: 0.5
});

// Check if should override content
if (scoredEvents[0].shouldOverride) {
  console.log('URGENT: Override scheduled content!');
}
```

## Urgency Scoring

### Score Ranges
- **9-10**: CRITICAL - Immediate override (Fed emergency, major crash, war)
- **7-8**: HIGH - Override recommended (Fed meetings, trade wars, sanctions)
- **5-6**: MEDIUM - Monitor closely (inflation, jobs data, volatility)
- **1-4**: LOW - Background info (general commentary, technical analysis)

### Override Threshold
Default: **8+** (configurable via `URGENCY_THRESHOLD` env variable)

## Testing

Run the complete test suite:

```bash
npm test
```

Or directly:

```bash
node tests/test-research.js
```

Tests cover:
- Market data fetching (forex, crypto, commodities)
- Caching functionality
- Event detection accuracy
- Urgency scoring algorithm
- Perplexity API integration
- Error handling and retries

## Configuration

### Environment Variables

```bash
# Perplexity API (Primary Research)
PERPLEXITY_API_KEY=pplx-xxxxx
PERPLEXITY_ENDPOINT=https://api.perplexity.ai

# Optional: Market Data APIs
ALPHA_VANTAGE_API_KEY=your_key
COINGECKO_API_KEY=your_key
COINMARKETCAP_API_KEY=your_key
EIA_API_KEY=your_key

# Configuration
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
URGENCY_THRESHOLD=8
CACHE_TTL_MINUTES=5
```

### Free Tier Usage

The engine works with **zero paid APIs** using free alternatives:
- **Forex**: ExchangeRate-API (free, unlimited)
- **Crypto**: CoinGecko (free, 50 req/min)
- **Commodities**: Metals.live (free, unlimited)

However, **Perplexity API** (paid) is required for real-time research and breaking news detection.

## Production Recommendations

### Required APIs
1. **Perplexity API** - Real-time research (essential)
2. **Alpha Vantage Premium** - Professional forex data ($49.99/month)
3. **CoinGecko Pro** - Reliable crypto data ($129/month)
4. **EIA API** - Oil/energy data (free)

### Monitoring
- Track API response times
- Monitor error rates
- Log urgency score distribution
- Alert on critical events (score 9+)

### Scaling
- Implement distributed caching (Redis)
- Add request queuing for high volume
- Set up webhook notifications for critical events
- Archive historical events for trend analysis

## Error Handling

### Automatic Retry
- 3 attempts with exponential backoff
- Rate limit detection and handling
- Automatic fallback to alternative APIs

### Fallback Strategy
1. Primary API → Retry 3 times
2. Fallback API (if available)
3. Cached data
4. Error thrown

## License

ISC

## Support

- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Issues**: Contact development team
- **Updates**: Check git repository for latest changes

---

Built with ❤️ for real-time market intelligence