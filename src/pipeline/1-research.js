import axios from 'axios';
import logger from '../utils/logger.js';
import { ResearchError } from '../utils/error-handler.js';

/**
 * Step 1: Market Research
 * Uses Perplexity API to gather latest forex/market data
 */
export class ResearchStep {
  constructor(config) {
    this.config = config;
    this.perplexityApiKey = config.env.perplexity.apiKey;
    this.perplexityEndpoint = config.env.perplexity.endpoint;
  }

  /**
   * Execute market research
   */
  async execute() {
    try {
      logger.info('Starting market research...');

      // Define research queries
      const queries = [
        'Latest forex market trends and major currency pair movements in the past 24 hours',
        'Gold and oil price updates, key economic indicators affecting GCC markets',
        'Breaking financial news relevant to forex traders in Middle East',
        'Central bank decisions and economic reports from major economies'
      ];

      // Execute parallel research queries
      const results = await Promise.all(
        queries.map(query => this.queryPerplexity(query))
      );

      // Aggregate research data
      const marketData = {
        timestamp: new Date().toISOString(),
        forex: results[0],
        commodities: results[1],
        breakingNews: results[2],
        economicIndicators: results[3],
        summary: this.generateSummary(results)
      };

      logger.info('Market research completed successfully', {
        dataPoints: results.length
      });

      return marketData;
    } catch (error) {
      logger.error('Market research failed', { error: error.message });
      throw new ResearchError('Failed to complete market research', error);
    }
  }

  /**
   * Query Perplexity API
   */
  async queryPerplexity(query) {
    try {
      const response = await axios.post(
        `${this.perplexityEndpoint}/chat/completions`,
        {
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are a financial research assistant. Provide concise, factual market data.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const answer = response.data.choices[0].message.content;
      const citations = response.data.citations || [];

      return {
        query,
        answer,
        citations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Perplexity API query failed', {
        query,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate summary from all research results
   */
  generateSummary(results) {
    const allAnswers = results.map(r => r.answer).join('\n\n');

    return {
      keyPoints: this.extractKeyPoints(allAnswers),
      trendingTopics: this.identifyTrendingTopics(allAnswers),
      urgentEvents: this.identifyUrgentEvents(allAnswers)
    };
  }

  /**
   * Extract key points from research
   */
  extractKeyPoints(text) {
    // Simple extraction - look for percentage changes, major events
    const keyPointPatterns = [
      /(\w+\s*\/?\w*)\s+(rose|fell|increased|decreased|dropped|surged)\s+(\d+\.?\d*%?)/gi,
      /(central bank|fed|ecb|boe)\s+(\w+\s+){0,5}(raised|cut|maintained)\s+rates/gi,
      /(gold|oil|crude)\s+prices?\s+(\w+\s+){0,3}(\$\d+)/gi
    ];

    const keyPoints = [];
    keyPointPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        keyPoints.push(...matches.slice(0, 3)); // Top 3 per pattern
      }
    });

    return keyPoints.slice(0, 10); // Return top 10 key points
  }

  /**
   * Identify trending topics
   */
  identifyTrendingTopics(text) {
    const topics = {
      forex: (text.match(/forex|currency|exchange rate/gi) || []).length,
      gold: (text.match(/gold|precious metals/gi) || []).length,
      oil: (text.match(/oil|crude|energy/gi) || []).length,
      stocks: (text.match(/stocks|equity|shares/gi) || []).length,
      crypto: (text.match(/crypto|bitcoin|ethereum/gi) || []).length
    };

    // Sort by frequency
    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, mentions: count }));
  }

  /**
   * Identify urgent/breaking events
   */
  identifyUrgentEvents(text) {
    const urgentKeywords = [
      'breaking', 'urgent', 'just announced', 'sudden', 'unexpected',
      'emergency', 'crisis', 'crash', 'surge', 'record high', 'record low'
    ];

    const urgentEvents = [];
    const sentences = text.split(/[.!?]+/);

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      const hasUrgentKeyword = urgentKeywords.some(keyword =>
        lowerSentence.includes(keyword)
      );

      if (hasUrgentKeyword) {
        urgentEvents.push(sentence.trim());
      }
    });

    return urgentEvents.slice(0, 5); // Top 5 urgent events
  }
}

export default ResearchStep;
