import { validateEnv, getEnvConfig } from './env-validator.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load JSON configuration files
 */
function loadJsonConfig(configPath) {
  try {
    const fullPath = path.resolve(__dirname, configPath);
    if (!fs.existsSync(fullPath)) {
      logger.warn(`Config file not found: ${configPath}`);
      return null;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Failed to load config: ${configPath}`, { error: error.message });
    return null;
  }
}

/**
 * Persona configurations for video hosts
 */
const personas = {
  maha: {
    name: 'Maha Al-Khaleeji',
    description: 'Professional female finance expert, Gulf Arabic accent',
    voice: 'confident and authoritative',
    appearance: 'professional business attire',
    language: 'Arabic (Gulf/Khaleeji dialect)',
    synthesia_avatar_id: 'anna_costume1_cameraA' // Placeholder - update with actual Synthesia avatar
  },
  omar: {
    name: 'Omar Al-Mansouri',
    description: 'Expert male analyst, Gulf Arabic accent',
    voice: 'calm and analytical',
    appearance: 'formal business suit',
    language: 'Arabic (Gulf/Khaleeji dialect)',
    synthesia_avatar_id: 'jack_costume1_cameraA' // Placeholder - update with actual Synthesia avatar
  }
};

/**
 * Content schedule configuration
 */
const schedule = {
  timezone: 'Asia/Dubai',
  publishTimes: [
    { day: 'monday', time: '09:00', persona: 'maha' },
    { day: 'monday', time: '18:00', persona: 'omar' },
    { day: 'wednesday', time: '09:00', persona: 'omar' },
    { day: 'wednesday', time: '18:00', persona: 'maha' },
    { day: 'friday', time: '09:00', persona: 'maha' },
    { day: 'friday', time: '18:00', persona: 'omar' }
  ],
  urgentPublish: {
    enabled: true,
    minIntervalHours: 2,
    maxPerDay: 3
  }
};

/**
 * Brand configuration
 */
const brand = {
  name: 'Seekapa',
  tagline: 'شريكك في عالم التداول',
  colors: {
    primary: '#1a1a2e',
    secondary: '#0f3460',
    accent: '#16213e',
    gold: '#ffd700'
  },
  logo: {
    path: '/home/odedbe/brand books/Seekapa/logo.png',
    position: 'bottom-right',
    size: '15%'
  },
  watermark: {
    text: 'Seekapa.com',
    position: 'bottom-center',
    opacity: 0.7
  },
  social: {
    website: 'https://seekapa.com',
    youtube: 'https://youtube.com/@seekapa',
    instagram: '@seekapa',
    twitter: '@seekapa'
  }
};

/**
 * Topic categories for content
 */
const topics = {
  markets: [
    'forex_analysis',
    'gold_prices',
    'oil_markets',
    'stock_indices',
    'cryptocurrency',
    'economic_indicators'
  ],
  education: [
    'trading_basics',
    'risk_management',
    'technical_analysis',
    'fundamental_analysis',
    'trading_psychology',
    'platform_tutorials'
  ],
  news: [
    'central_bank_decisions',
    'economic_reports',
    'geopolitical_events',
    'market_crashes',
    'regulatory_changes',
    'industry_news'
  ],
  seekapa: [
    'platform_features',
    'success_stories',
    'promotions',
    'educational_resources',
    'withdrawal_process',
    'compliance_regulation'
  ]
};

/**
 * Video production settings
 */
const videoSettings = {
  duration: {
    min: 45, // seconds
    max: 90, // seconds
    target: 60
  },
  format: {
    resolution: '1920x1080',
    fps: 30,
    codec: 'h264',
    bitrate: '5000k'
  },
  audio: {
    codec: 'aac',
    bitrate: '128k',
    sampleRate: 48000
  },
  thumbnail: {
    enabled: true,
    template: 'seekapa_thumbnail_template.png'
  }
};

/**
 * Load and merge all configurations
 */
export function loadConfig() {
  // Validate environment first
  validateEnv();

  // Get environment config
  const envConfig = getEnvConfig();

  // Merge all configs
  const config = {
    env: envConfig,
    personas,
    schedule,
    brand,
    topics,
    videoSettings
  };

  logger.info('Configuration loaded successfully', {
    personasCount: Object.keys(personas).length,
    scheduleCount: schedule.publishTimes.length,
    topicsCount: Object.values(topics).flat().length
  });

  return config;
}

/**
 * Get specific config section
 */
export function getConfig(section) {
  const config = loadConfig();
  return config[section] || null;
}

export default loadConfig;
