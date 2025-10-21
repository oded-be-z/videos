const axios = require('axios');
require('dotenv').config();

/**
 * Perplexity API Service
 * Primary research engine for real-time market data and breaking news
 */
class PerplexityService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.endpoint = process.env.PERPLEXITY_ENDPOINT || 'https://api.perplexity.ai';
    this.retryAttempts = parseInt(process.env.RETRY_ATTEMPTS) || 3;
    this.retryDelay = parseInt(process.env.RETRY_DELAY_MS) || 1000;
  }

  /**
   * Query Perplexity API with retry logic
   * @param {string} query - Search query
   * @param {object} options - Additional options
   * @returns {Promise<object>} - API response
   */
  async query(query, options = {}) {
    const {
      model = 'llama-3.1-sonar-small-128k-online',
      temperature = 0.2,
      max_tokens = 1000,
      return_citations = true,
      return_images = false
    } = options;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios.post(
          `${this.endpoint}/chat/completions`,
          {
            model,
            messages: [
              {
                role: 'system',
                content: 'You are a financial market research assistant. Provide accurate, up-to-date information about forex, crypto, and commodities markets.'
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature,
            max_tokens,
            return_citations,
            return_images
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        return this.parseResponse(response.data);
      } catch (error) {
        console.error(`[Perplexity] Attempt ${attempt}/${this.retryAttempts} failed:`, error.message);

        if (attempt === this.retryAttempts) {
          throw new Error(`Perplexity API failed after ${this.retryAttempts} attempts: ${error.message}`);
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const waitTime = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[Perplexity] Rate limited. Waiting ${waitTime}ms...`);
          await this.sleep(waitTime);
        } else {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
  }

  /**
   * Parse Perplexity API response
   * @param {object} data - Raw API response
   * @returns {object} - Parsed response
   */
  parseResponse(data) {
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('Invalid response from Perplexity API');
    }

    return {
      content: choice.message?.content || '',
      citations: data.citations || [],
      model: data.model,
      usage: data.usage,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Research forex market trends
   * @param {string} pair - Currency pair (e.g., "EUR/USD")
   * @returns {Promise<object>}
   */
  async researchForex(pair) {
    const query = `What are the latest trends and breaking news affecting ${pair} forex pair? Include price movements, central bank decisions, and geopolitical factors in the last 24 hours.`;
    return this.query(query);
  }

  /**
   * Research cryptocurrency trends
   * @param {string} symbol - Crypto symbol (e.g., "BTC", "ETH")
   * @returns {Promise<object>}
   */
  async researchCrypto(symbol) {
    const query = `What are the latest developments and price movements for ${symbol}? Include regulatory news, whale activity, and market sentiment in the last 24 hours.`;
    return this.query(query);
  }

  /**
   * Research commodities market
   * @param {string} commodity - Commodity name (e.g., "gold", "oil", "natural gas")
   * @returns {Promise<object>}
   */
  async researchCommodity(commodity) {
    const query = `What are the latest trends affecting ${commodity} prices? Include supply/demand dynamics, geopolitical events, and production data in the last 24 hours.`;
    return this.query(query);
  }

  /**
   * Detect breaking financial news
   * @returns {Promise<object>}
   */
  async detectBreakingNews() {
    const query = `What are the most important breaking news events in the last 2 hours affecting forex, crypto, and commodities markets? Focus on Fed decisions, geopolitical crises, major market crashes, or significant regulatory changes.`;
    return this.query(query, { max_tokens: 1500 });
  }

  /**
   * Research specific market event
   * @param {string} event - Event description
   * @returns {Promise<object>}
   */
  async researchEvent(event) {
    const query = `Analyze the market impact of: ${event}. How does this affect forex, crypto, and commodities? What are the short-term and medium-term implications?`;
    return this.query(query, { max_tokens: 1500 });
  }

  /**
   * Sleep utility for retry logic
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = PerplexityService;
