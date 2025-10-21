const axios = require('axios');
require('dotenv').config();

/**
 * Market Data Service
 * Aggregates data from multiple free and paid APIs
 */
class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = (parseInt(process.env.CACHE_TTL_MINUTES) || 5) * 60 * 1000;
  }

  /**
   * Get forex price data
   * @param {string} pair - Currency pair (e.g., "EUR/USD")
   * @returns {Promise<object>}
   */
  async getForexPrice(pair) {
    const cacheKey = `forex_${pair}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try Alpha Vantage (free tier: 25 requests/day)
      if (process.env.ALPHA_VANTAGE_API_KEY) {
        const data = await this.fetchAlphaVantageForex(pair);
        this.setCache(cacheKey, data);
        return data;
      }

      // Fallback to free API (no key required)
      const data = await this.fetchFreeForex(pair);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`[MarketData] Failed to fetch forex data for ${pair}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch forex data from Alpha Vantage
   * @param {string} pair - Currency pair
   * @returns {Promise<object>}
   */
  async fetchAlphaVantageForex(pair) {
    const [from, to] = pair.replace('/', '').match(/.{1,3}/g);
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data['Realtime Currency Exchange Rate'];

    if (!data) {
      throw new Error('Invalid response from Alpha Vantage');
    }

    return {
      pair,
      price: parseFloat(data['5. Exchange Rate']),
      bid: parseFloat(data['8. Bid Price']),
      ask: parseFloat(data['9. Ask Price']),
      timestamp: data['6. Last Refreshed'],
      source: 'Alpha Vantage'
    };
  }

  /**
   * Fetch forex data from free API (exchangerate-api.com)
   * @param {string} pair - Currency pair
   * @returns {Promise<object>}
   */
  async fetchFreeForex(pair) {
    const [from, to] = pair.replace('/', '').match(/.{1,3}/g);
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;

    const response = await axios.get(url, { timeout: 10000 });
    const rate = response.data.rates[to];

    if (!rate) {
      throw new Error(`Currency ${to} not found`);
    }

    return {
      pair,
      price: rate,
      bid: rate * 0.9999, // Approximate bid
      ask: rate * 1.0001, // Approximate ask
      timestamp: new Date(response.data.time_last_updated * 1000).toISOString(),
      source: 'ExchangeRate-API (Free)'
    };
  }

  /**
   * Get crypto price data
   * @param {string} symbol - Crypto symbol (e.g., "BTC")
   * @returns {Promise<object>}
   */
  async getCryptoPrice(symbol) {
    const cacheKey = `crypto_${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try CoinGecko (free tier: 50 requests/minute)
      const data = await this.fetchCoinGecko(symbol);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`[MarketData] Failed to fetch crypto data for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch crypto data from CoinGecko (free API)
   * @param {string} symbol - Crypto symbol
   * @returns {Promise<object>}
   */
  async fetchCoinGecko(symbol) {
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'SOL': 'solana'
    };

    const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data[coinId];

    if (!data) {
      throw new Error(`Crypto ${symbol} not found`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: data.usd,
      change24h: data.usd_24h_change,
      volume24h: data.usd_24h_vol,
      marketCap: data.usd_market_cap,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko (Free)'
    };
  }

  /**
   * Get commodity price data
   * @param {string} commodity - Commodity name (e.g., "gold", "oil")
   * @returns {Promise<object>}
   */
  async getCommodityPrice(commodity) {
    const cacheKey = `commodity_${commodity}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use free API for commodities
      const data = await this.fetchCommodityAPI(commodity);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`[MarketData] Failed to fetch commodity data for ${commodity}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch commodity data from free API
   * @param {string} commodity - Commodity name
   * @returns {Promise<object>}
   */
  async fetchCommodityAPI(commodity) {
    // Using metals-api.com for gold/silver (free tier: 50 requests/month)
    // For oil, we'll use a placeholder as EIA requires API key

    if (commodity.toLowerCase() === 'gold' || commodity.toLowerCase() === 'silver') {
      const url = `https://api.metals.live/v1/spot/${commodity.toLowerCase()}`;
      const response = await axios.get(url, { timeout: 10000 });

      return {
        commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
        price: response.data[0]?.price || 0,
        unit: 'USD/oz',
        timestamp: new Date().toISOString(),
        source: 'Metals.live (Free)'
      };
    }

    // For oil and other commodities, return placeholder
    return {
      commodity: commodity.charAt(0).toUpperCase() + commodity.slice(1),
      price: 0,
      unit: 'USD/barrel',
      timestamp: new Date().toISOString(),
      source: 'Placeholder (API key required)',
      note: 'Install EIA or other commodity API key for real data'
    };
  }

  /**
   * Get multiple forex pairs at once
   * @param {string[]} pairs - Array of currency pairs
   * @returns {Promise<object[]>}
   */
  async getMultipleForex(pairs) {
    return Promise.all(pairs.map(pair => this.getForexPrice(pair)));
  }

  /**
   * Get multiple crypto symbols at once
   * @param {string[]} symbols - Array of crypto symbols
   * @returns {Promise<object[]>}
   */
  async getMultipleCrypto(symbols) {
    return Promise.all(symbols.map(symbol => this.getCryptoPrice(symbol)));
  }

  /**
   * Get from cache
   * @param {string} key - Cache key
   * @returns {object|null}
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp } = cached;
    if (Date.now() - timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[MarketData] Cache hit for ${key}`);
    return data;
  }

  /**
   * Set cache
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[MarketData] Cache cleared');
  }
}

module.exports = MarketDataService;
