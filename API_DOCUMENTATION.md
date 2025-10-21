# Market Research Engine - API Documentation

## Overview

The Market Research Engine provides real-time market intelligence using Perplexity API and multiple market data sources. It detects breaking news, scores event urgency (1-10), and recommends content override when critical events occur (score 8+).

---

## APIs Used

### Primary Research Source

#### **Perplexity API** (Primary)
- **Endpoint**: `https://api.perplexity.ai`
- **Purpose**: Real-time market research, breaking news detection
- **Free Tier**: Limited requests
- **Cost**: Pay-as-you-go
- **Strengths**: Latest web data, citations, high accuracy
- **API Key Required**: Yes

---

### Forex Data APIs

#### **1. Alpha Vantage** (Recommended)
- **Endpoint**: `https://www.alphavantage.co/query`
- **Free Tier**: 25 requests/day, 5 requests/minute
- **Premium**: $49.99/month (unlimited)
- **Signup**: https://www.alphavantage.co/support/#api-key
- **Data**: Real-time forex, stocks, crypto
- **API Key Required**: Yes

#### **2. ExchangeRate-API** (Fallback - FREE)
- **Endpoint**: `https://api.exchangerate-api.com/v4/latest/{currency}`
- **Free Tier**: Unlimited
- **Premium**: Starting at $9/month (more features)
- **Signup**: https://www.exchangerate-api.com
- **Data**: 161 currencies, updated hourly
- **API Key Required**: No (for basic tier)

#### **3. OANDA API** (Advanced)
- **Endpoint**: `https://api-fxpractice.oanda.com`
- **Free Tier**: Practice account (free)
- **Premium**: Live trading account required
- **Signup**: https://www.oanda.com/forex-trading/
- **Data**: Real-time forex, historical data
- **API Key Required**: Yes

#### **4. Forex.com API** (Professional)
- **Endpoint**: Custom endpoint
- **Free Tier**: No
- **Premium**: Trading account required
- **Signup**: https://www.forex.com
- **Data**: Institutional-grade forex data
- **API Key Required**: Yes

---

### Crypto Data APIs

#### **1. CoinGecko** (Recommended - FREE)
- **Endpoint**: `https://api.coingecko.com/api/v3`
- **Free Tier**: 50 requests/minute
- **Premium**: Starting at $129/month
- **Signup**: https://www.coingecko.com/en/api
- **Data**: 10,000+ coins, market data, trends
- **API Key Required**: No (for basic tier)

#### **2. CoinMarketCap**
- **Endpoint**: `https://pro-api.coinmarketcap.com`
- **Free Tier**: 10,000 credits/month
- **Premium**: Starting at $29/month
- **Signup**: https://coinmarketcap.com/api/
- **Data**: 5,000+ coins, market cap, volume
- **API Key Required**: Yes

---

### Commodities APIs

#### **1. Metals.live** (Gold/Silver - FREE)
- **Endpoint**: `https://api.metals.live/v1/spot/{metal}`
- **Free Tier**: Unlimited
- **Premium**: N/A
- **Signup**: Not required
- **Data**: Gold, silver, platinum spot prices
- **API Key Required**: No

#### **2. EIA API** (Oil/Energy)
- **Endpoint**: `https://api.eia.gov`
- **Free Tier**: Yes (registration required)
- **Premium**: Free
- **Signup**: https://www.eia.gov/opendata/
- **Data**: Crude oil, natural gas, energy data
- **API Key Required**: Yes

#### **3. World Bank API** (Commodities)
- **Endpoint**: `https://api.worldbank.org/v2`
- **Free Tier**: Unlimited
- **Premium**: N/A
- **Signup**: Not required
- **Data**: Commodity prices, economic indicators
- **API Key Required**: No

---

## Usage Examples

### 1. Research Forex Market

```javascript
const MarketResearchAgent = require('./src/agents/market-research');

const agent = new MarketResearchAgent();

// Research single pair
const result = await agent.researchForex('EUR/USD');

// Research multiple pairs
const result = await agent.researchForex(['EUR/USD', 'GBP/USD', 'USD/JPY']);

console.log(result.summary);
console.log('Should override content:', result.shouldOverride);
```

### 2. Research Cryptocurrency

```javascript
// Research single crypto
const result = await agent.researchCrypto('BTC');

// Research multiple cryptos
const result = await agent.researchCrypto(['BTC', 'ETH', 'XRP']);

console.log(result.results[0].priceData);
console.log(result.results[0].analysis.scoredEvents);
```

### 3. Monitor Breaking News

```javascript
const result = await agent.monitorBreakingNews();

console.log(result.report);
console.log('Critical events:', result.criticalEvents);

if (result.shouldOverride) {
  console.log('OVERRIDE SCHEDULED CONTENT!');
}
```

### 4. Comprehensive Market Scan

```javascript
const result = await agent.comprehensiveScan({
  forex: ['EUR/USD', 'GBP/USD'],
  crypto: ['BTC', 'ETH'],
  commodities: ['gold', 'oil']
});

console.log(result.summary);
console.log('Top events:', result.topEvents.slice(0, 5));
```

### 5. Research Specific Event

```javascript
const result = await agent.researchEvent(
  'Federal Reserve announces emergency rate cut'
);

console.log(result.analysis.maxScore);
console.log(result.shouldOverride);
```

---

## Response Structure

### Forex Research Response

```javascript
{
  type: 'forex',
  results: [
    {
      pair: 'EUR/USD',
      priceData: {
        pair: 'EUR/USD',
        price: 1.0850,
        bid: 1.0849,
        ask: 1.0851,
        timestamp: '2025-10-21T10:00:00.000Z',
        source: 'Alpha Vantage'
      },
      research: 'EUR/USD trading at 1.0850...',
      citations: ['https://source1.com', 'https://source2.com'],
      analysis: {
        hasBreakingNews: true,
        events: [...],
        scoredEvents: [
          {
            text: 'Federal Reserve hints at rate cut',
            score: 8,
            shouldOverride: true,
            category: 'high',
            keywords: ['fed decision', 'rate cut']
          }
        ],
        maxScore: 8,
        shouldOverride: true
      },
      timestamp: '2025-10-21T10:00:00.000Z'
    }
  ],
  summary: 'Found 5 event(s) including 1 critical event(s) across 1 market(s)',
  shouldOverride: true
}
```

### Breaking News Response

```javascript
{
  type: 'breaking_news',
  content: 'Breaking news content...',
  citations: [...],
  analysis: {
    hasBreakingNews: true,
    events: [...],
    criticalEvents: [...],
    maxUrgency: 9,
    scoredEvents: [...]
  },
  shouldOverride: true,
  criticalEvents: [...],
  report: '=== URGENCY REPORT ===...',
  timestamp: '2025-10-21T10:00:00.000Z'
}
```

---

## Urgency Scoring System

### Score Ranges

- **9-10**: CRITICAL - Immediate override recommended
  - Fed emergency decisions
  - Major market crashes (10%+)
  - War/geopolitical crises
  - Major defaults/bankruptcies

- **7-8**: HIGH - Override recommended if scheduled content is not time-sensitive
  - Fed regular meetings
  - Trade wars/sanctions
  - Major earnings surprises
  - Significant regulatory changes

- **5-6**: MEDIUM - Monitor, may affect content strategy
  - Inflation reports
  - Jobs data
  - Market volatility
  - Analyst upgrades/downgrades

- **1-4**: LOW - Background information
  - General market commentary
  - Technical analysis
  - Historical comparisons

### Override Threshold

Default threshold: **8+**

Can be configured via environment variable:
```bash
URGENCY_THRESHOLD=8
```

---

## Error Handling

### Retry Logic

All API calls include automatic retry with exponential backoff:

- **Attempts**: 3 (configurable)
- **Delay**: 1000ms base, exponential increase
- **Rate Limiting**: Automatic detection and backoff

Configure via environment:
```bash
RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
```

### Fallback Strategy

1. Primary API fails → Retry 3 times
2. Still failing → Try fallback API (if available)
3. All APIs fail → Return cached data
4. No cache → Throw error

---

## Caching

### Cache Configuration

- **TTL**: 5 minutes (configurable)
- **Storage**: In-memory Map
- **Scope**: Per-instance

Configure via environment:
```bash
CACHE_TTL_MINUTES=5
```

### Cache Methods

```javascript
// Clear cache
agent.marketData.clearCache();

// Get cache status
const status = agent.getStatus();
console.log(status.cacheStatus);
```

---

## Rate Limits

### Free Tier Limits

| Service | Free Tier | Limit |
|---------|-----------|-------|
| Perplexity | Limited | Pay-as-you-go |
| Alpha Vantage | 25/day | 5/minute |
| ExchangeRate-API | Unlimited | None |
| CoinGecko | 50/minute | None |
| Metals.live | Unlimited | None |
| World Bank | Unlimited | None |

### Recommendations

- Use caching to minimize API calls
- Implement request queuing for high-volume scenarios
- Consider upgrading to paid tiers for production use

---

## Testing

Run the test suite:

```bash
cd /home/odedbe/videos-research-agent
node tests/test-research.js
```

Tests include:
- Market data fetching (forex, crypto, commodities)
- Caching functionality
- Event detection
- Urgency scoring
- Perplexity integration (if API key available)
- Error handling

---

## Production Recommendations

### Essential APIs

1. **Perplexity API** - Primary research (paid)
2. **Alpha Vantage** - Forex data ($49.99/month)
3. **CoinGecko Pro** - Crypto data ($129/month)
4. **EIA API** - Oil/energy (free)

### Optional APIs

- OANDA - Professional forex trading data
- CoinMarketCap - Alternative crypto data
- World Bank - Commodity price trends

### Monitoring

Implement monitoring for:
- API response times
- Error rates
- Cache hit rates
- Urgency score distribution

---

## Support

For API-specific issues:
- Perplexity: https://docs.perplexity.ai
- Alpha Vantage: https://www.alphavantage.co/support/
- CoinGecko: https://www.coingecko.com/en/api/documentation

For engine issues: Contact development team
