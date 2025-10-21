import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Environment variable validation schema
 */
const envSchema = Joi.object({
  // Synthesia
  SYNTHESIA_API_KEY: Joi.string().required().description('Synthesia API key for video generation'),

  // Azure OpenAI
  AZURE_OPENAI_KEY: Joi.string().required().description('Azure OpenAI API key'),
  AZURE_OPENAI_ENDPOINT: Joi.string().uri().required().description('Azure OpenAI endpoint URL'),
  GPT5_DEPLOYMENT_NAME: Joi.string().default('gpt-5').description('GPT-5 deployment name'),
  GPT5_PRO_DEPLOYMENT_NAME: Joi.string().default('gpt-5-pro').description('GPT-5 Pro deployment name'),
  GPT5_CODEX_DEPLOYMENT_NAME: Joi.string().default('gpt-5-codex').description('GPT-5 Codex deployment name'),

  // Perplexity
  PERPLEXITY_API_KEY: Joi.string().required().description('Perplexity API key for research'),
  PERPLEXITY_ENDPOINT: Joi.string().uri().default('https://api.perplexity.ai').description('Perplexity endpoint'),

  // YouTube
  YOUTUBE_CLIENT_ID: Joi.string().required().description('YouTube OAuth client ID'),
  YOUTUBE_CLIENT_SECRET: Joi.string().required().description('YouTube OAuth client secret'),
  YOUTUBE_REFRESH_TOKEN: Joi.string().required().description('YouTube OAuth refresh token'),
  YOUTUBE_CHANNEL_ID: Joi.string().required().description('Target YouTube channel ID'),

  // ElevenLabs (Optional)
  ELEVENLABS_API_KEY: Joi.string().optional().description('ElevenLabs API key for voice synthesis'),

  // Application Settings
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  STATE_FILE_PATH: Joi.string().default('./pipeline_state.json'),

  // Pipeline Settings
  MAX_RETRIES: Joi.number().integer().min(0).max(10).default(3),
  RETRY_DELAY_MS: Joi.number().integer().min(0).default(5000),
  URGENCY_THRESHOLD: Joi.number().min(0).max(10).default(7)
}).unknown(true); // Allow other env vars

/**
 * Validate environment variables
 */
export function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      key: detail.path.join('.'),
      message: detail.message
    }));

    logger.error('Environment validation failed', { errors: errorDetails });

    throw new Error(
      `Environment validation failed:\n${errorDetails.map(e => `  - ${e.key}: ${e.message}`).join('\n')}`
    );
  }

  logger.info('Environment variables validated successfully');
  return value;
}

/**
 * Get validated environment config
 */
export function getEnvConfig() {
  return {
    synthesia: {
      apiKey: process.env.SYNTHESIA_API_KEY,
      endpoint: 'https://api.synthesia.io/v2'
    },
    azureOpenAI: {
      key: process.env.AZURE_OPENAI_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployments: {
        gpt5: process.env.GPT5_DEPLOYMENT_NAME,
        gpt5Pro: process.env.GPT5_PRO_DEPLOYMENT_NAME,
        gpt5Codex: process.env.GPT5_CODEX_DEPLOYMENT_NAME
      }
    },
    perplexity: {
      apiKey: process.env.PERPLEXITY_API_KEY,
      endpoint: process.env.PERPLEXITY_ENDPOINT
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
      channelId: process.env.YOUTUBE_CHANNEL_ID
    },
    elevenLabs: {
      apiKey: process.env.ELEVENLABS_API_KEY || null
    },
    app: {
      nodeEnv: process.env.NODE_ENV,
      logLevel: process.env.LOG_LEVEL,
      stateFilePath: process.env.STATE_FILE_PATH
    },
    pipeline: {
      maxRetries: parseInt(process.env.MAX_RETRIES),
      retryDelayMs: parseInt(process.env.RETRY_DELAY_MS),
      urgencyThreshold: parseFloat(process.env.URGENCY_THRESHOLD)
    }
  };
}

export default validateEnv;
