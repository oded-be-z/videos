#!/usr/bin/env node

/**
 * Hybrid Content Decision Logic
 * Decides between scheduled content and breaking news
 */

const fs = require('fs').promises;
const path = require('path');

const URGENCY_THRESHOLD = 8; // Breaking news must be 8/10+ to override schedule
const STATE_FILE = path.join(__dirname, '../../output/decision-state.json');

async function loadWeeklySchedule() {
  const schedule = {
    0: { // Sunday
      topic: 'trading_psychology',
      category: 'education',
      persona: 'fatima',
      priority: 'medium'
    },
    1: { // Monday
      topic: 'market_analysis',
      category: 'analysis',
      persona: 'ahmed',
      priority: 'high'
    },
    2: { // Tuesday
      topic: 'forex_basics',
      category: 'education',
      persona: 'fatima',
      priority: 'medium'
    },
    3: { // Wednesday
      topic: 'technical_analysis',
      category: 'analysis',
      persona: 'ahmed',
      priority: 'high'
    },
    4: { // Thursday
      topic: 'risk_management',
      category: 'education',
      persona: 'fatima',
      priority: 'medium'
    },
    5: { // Friday
      topic: 'weekly_outlook',
      category: 'outlook',
      persona: 'both',
      priority: 'critical'
    },
    6: { // Saturday
      topic: 'market_recap',
      category: 'recap',
      persona: 'ahmed',
      priority: 'low'
    }
  };

  return schedule;
}

async function loadBreakingNews() {
  try {
    const newsFile = path.join(__dirname, '../../output/breaking-news.json');
    const data = await fs.readFile(newsFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No breaking news detected');
    return { urgency: 0, topic: null };
  }
}

async function makeDecision() {
  const testMode = process.argv.includes('--test');
  const overrideTopic = process.env.OVERRIDE_TOPIC;

  console.log('🤔 Hybrid Content Decision Engine Starting...');
  console.log(`Test mode: ${testMode}`);
  console.log(`Override topic: ${overrideTopic || 'None'}`);

  // Manual override takes precedence
  if (overrideTopic) {
    const decision = {
      topic: overrideTopic,
      reason: 'manual_override',
      urgency: 10,
      timestamp: new Date().toISOString(),
      dayOfWeek: new Date().getDay()
    };

    await saveDecision(decision);
    console.log('✅ Decision: Manual Override');
    console.log(JSON.stringify(decision, null, 2));
    return decision;
  }

  // Load scheduled content
  const schedule = await loadWeeklySchedule();
  const dayOfWeek = new Date().getDay();
  const scheduledContent = schedule[dayOfWeek];

  console.log(`📅 Today (${getDayName(dayOfWeek)}): ${scheduledContent.topic}`);

  // Check for breaking news
  const breakingNews = await loadBreakingNews();
  console.log(`🚨 Breaking news urgency: ${breakingNews.urgency}/10`);

  let decision;

  if (breakingNews.urgency >= URGENCY_THRESHOLD) {
    // Breaking news overrides schedule
    decision = {
      topic: breakingNews.topic,
      originalTopic: scheduledContent.topic,
      reason: 'urgent_override',
      urgency: breakingNews.urgency,
      category: 'breaking_news',
      persona: breakingNews.urgency >= 9 ? 'both' : scheduledContent.persona,
      timestamp: new Date().toISOString(),
      dayOfWeek: dayOfWeek,
      metadata: breakingNews.metadata || {}
    };

    console.log('⚡ BREAKING NEWS OVERRIDE ACTIVATED!');
  } else if (breakingNews.urgency >= 5 && dayOfWeek === 6) {
    // Saturday: Lower threshold for breaking news
    decision = {
      topic: breakingNews.topic,
      originalTopic: scheduledContent.topic,
      reason: 'saturday_breaking_news',
      urgency: breakingNews.urgency,
      category: 'breaking_news',
      persona: 'ahmed',
      timestamp: new Date().toISOString(),
      dayOfWeek: dayOfWeek,
      metadata: breakingNews.metadata || {}
    };

    console.log('📰 Saturday breaking news activated (lower threshold)');
  } else {
    // Use scheduled content
    decision = {
      topic: scheduledContent.topic,
      reason: 'scheduled',
      urgency: 0,
      category: scheduledContent.category,
      persona: scheduledContent.persona,
      priority: scheduledContent.priority,
      timestamp: new Date().toISOString(),
      dayOfWeek: dayOfWeek,
      breakingNewsIgnored: breakingNews.urgency > 0 ? breakingNews : null
    };

    console.log('📋 Following scheduled content');
  }

  // Save decision
  await saveDecision(decision);

  console.log('\n✅ Final Decision:');
  console.log(JSON.stringify(decision, null, 2));

  if (testMode) {
    console.log('\n🧪 TEST MODE: Decision validated, not triggering pipeline');
    process.exit(0);
  }

  return decision;
}

async function saveDecision(decision) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(decision, null, 2));
    console.log(`💾 Decision saved to ${STATE_FILE}`);
  } catch (error) {
    console.error('Failed to save decision:', error.message);
  }
}

function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

// Main execution
if (require.main === module) {
  makeDecision()
    .then(decision => {
      console.log('\n✅ Hybrid logic complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Decision engine failed:', error);
      process.exit(1);
    });
}

module.exports = { makeDecision, loadWeeklySchedule };
