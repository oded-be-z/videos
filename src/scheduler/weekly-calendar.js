#!/usr/bin/env node

/**
 * Weekly Content Calendar
 * Defines the default weekly schedule for automated content
 */

const WEEKLY_SCHEDULE = {
  // Sunday - Trading Psychology
  0: {
    topic: 'trading_psychology',
    title_template: 'علم نفس التداول | Psychology of Trading',
    category: 'education',
    persona: 'fatima',
    priority: 'medium',
    keywords: ['psychology', 'mindset', 'emotions', 'discipline'],
    target_audience: 'beginner-intermediate',
    video_length: '3-5 minutes',
    cta: 'Start trading with confidence'
  },

  // Monday - Market Analysis
  1: {
    topic: 'market_analysis',
    title_template: 'تحليل السوق اليومي | Daily Market Analysis',
    category: 'analysis',
    persona: 'ahmed',
    priority: 'high',
    keywords: ['market', 'analysis', 'forex', 'trading'],
    target_audience: 'all-levels',
    video_length: '4-6 minutes',
    cta: 'Open your Seekapa account'
  },

  // Tuesday - Forex Basics
  2: {
    topic: 'forex_basics',
    title_template: 'أساسيات الفوركس | Forex Fundamentals',
    category: 'education',
    persona: 'fatima',
    priority: 'medium',
    keywords: ['forex', 'basics', 'beginner', 'learn'],
    target_audience: 'beginner',
    video_length: '3-5 minutes',
    cta: 'Learn more about forex'
  },

  // Wednesday - Technical Analysis
  3: {
    topic: 'technical_analysis',
    title_template: 'التحليل الفني | Technical Analysis',
    category: 'analysis',
    persona: 'ahmed',
    priority: 'high',
    keywords: ['technical', 'charts', 'indicators', 'patterns'],
    target_audience: 'intermediate-advanced',
    video_length: '5-7 minutes',
    cta: 'Master technical analysis'
  },

  // Thursday - Risk Management
  4: {
    topic: 'risk_management',
    title_template: 'إدارة المخاطر | Risk Management',
    category: 'education',
    persona: 'fatima',
    priority: 'medium',
    keywords: ['risk', 'management', 'safety', 'protection'],
    target_audience: 'all-levels',
    video_length: '4-5 minutes',
    cta: 'Protect your capital'
  },

  // Friday - Weekly Outlook (CRITICAL)
  5: {
    topic: 'weekly_outlook',
    title_template: 'النظرة الأسبوعية | Weekly Market Outlook',
    category: 'outlook',
    persona: 'both',
    priority: 'critical',
    keywords: ['weekly', 'outlook', 'forecast', 'next week'],
    target_audience: 'all-levels',
    video_length: '6-8 minutes',
    cta: 'Plan your trading week',
    special_format: 'dialogue_between_fatima_and_ahmed'
  },

  // Saturday - Market Recap
  6: {
    topic: 'market_recap',
    title_template: 'ملخص الأسبوع | Weekly Market Recap',
    category: 'recap',
    persona: 'ahmed',
    priority: 'low',
    keywords: ['recap', 'summary', 'review', 'week'],
    target_audience: 'all-levels',
    video_length: '3-4 minutes',
    cta: 'Review this week\'s trades'
  }
};

const SEASONAL_VARIATIONS = {
  ramadan: {
    adjustments: {
      video_length: '2-3 minutes', // Shorter during Ramadan
      posting_time: '20:00 UAE', // After Iftar
      tone: 'respectful, spiritual references'
    }
  },
  eid: {
    adjustments: {
      pause_schedule: true,
      special_message: 'Eid greetings video'
    }
  },
  year_end: {
    adjustments: {
      topic: 'year_review_and_outlook',
      persona: 'both',
      video_length: '8-10 minutes'
    }
  }
};

const BREAKING_NEWS_CATEGORIES = {
  market_crash: {
    urgency_threshold: 9,
    persona: 'both',
    immediate_publish: true
  },
  major_central_bank: {
    urgency_threshold: 8,
    persona: 'ahmed',
    immediate_publish: true
  },
  geopolitical_crisis: {
    urgency_threshold: 8,
    persona: 'both',
    immediate_publish: true
  },
  regulatory_change: {
    urgency_threshold: 7,
    persona: 'ahmed',
    immediate_publish: false
  }
};

function getScheduleForDay(dayOfWeek) {
  return WEEKLY_SCHEDULE[dayOfWeek];
}

function getTodaySchedule() {
  const today = new Date().getDay();
  return getScheduleForDay(today);
}

function getWeekSchedule() {
  return WEEKLY_SCHEDULE;
}

function shouldApplySeasonalAdjustment() {
  // TODO: Implement Hijri calendar check for Ramadan
  // For now, return false
  return {
    active: false,
    type: null,
    adjustments: null
  };
}

// Export for use in other modules
if (require.main === module) {
  console.log('📅 Weekly Content Calendar');
  console.log('=========================\n');

  Object.entries(WEEKLY_SCHEDULE).forEach(([day, schedule]) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`${dayNames[day]}:`);
    console.log(`  Topic: ${schedule.topic}`);
    console.log(`  Persona: ${schedule.persona}`);
    console.log(`  Priority: ${schedule.priority}`);
    console.log(`  Length: ${schedule.video_length}`);
    console.log('');
  });

  console.log('Today\'s Schedule:');
  console.log(JSON.stringify(getTodaySchedule(), null, 2));
}

module.exports = {
  WEEKLY_SCHEDULE,
  SEASONAL_VARIATIONS,
  BREAKING_NEWS_CATEGORIES,
  getScheduleForDay,
  getTodaySchedule,
  getWeekSchedule,
  shouldApplySeasonalAdjustment
};
