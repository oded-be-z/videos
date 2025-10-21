#!/usr/bin/env node

/**
 * Persona Selector
 * Chooses Fatima, Ahmed, or both based on topic and day
 */

const fs = require('fs').promises;
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../output/persona-selection.json');
const DECISION_FILE = path.join(__dirname, '../../output/decision-state.json');

const PERSONA_PROFILES = {
  fatima: {
    name: 'Fatima Al-Mansouri',
    strengths: ['psychology', 'risk_management', 'education', 'beginner_friendly'],
    tone: 'warm, supportive, educational',
    avatar_id: 'fatima_professional_gulf', // Synthesia avatar ID
    voice_style: 'conversational',
    languages: ['ar-AE', 'en-US']
  },
  ahmed: {
    name: 'Ahmed Al-Rashid',
    strengths: ['technical_analysis', 'market_analysis', 'advanced_strategies', 'data_driven'],
    tone: 'analytical, professional, confident',
    avatar_id: 'ahmed_expert_gulf', // Synthesia avatar ID
    voice_style: 'authoritative',
    languages: ['ar-AE', 'en-US']
  }
};

const TOPIC_PERSONA_MAP = {
  // Educational topics - Fatima
  'trading_psychology': 'fatima',
  'risk_management': 'fatima',
  'forex_basics': 'fatima',
  'beginner_guide': 'fatima',
  'emotional_trading': 'fatima',

  // Analytical topics - Ahmed
  'market_analysis': 'ahmed',
  'technical_analysis': 'ahmed',
  'chart_patterns': 'ahmed',
  'market_recap': 'ahmed',
  'trend_analysis': 'ahmed',

  // Joint topics - Both
  'weekly_outlook': 'both',
  'major_events': 'both',
  'market_crash': 'both',
  'breaking_news': 'both',
  'year_outlook': 'both'
};

async function loadDecision() {
  try {
    const data = await fs.readFile(DECISION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No decision file found, using defaults');
    return {
      topic: 'market_analysis',
      dayOfWeek: new Date().getDay(),
      persona: 'auto'
    };
  }
}

async function selectPersona() {
  const testMode = process.argv.includes('--test');
  const overridePersona = process.env.PERSONA_OVERRIDE;

  console.log('👤 Persona Selection Engine Starting...');
  console.log(`Test mode: ${testMode}`);
  console.log(`Override: ${overridePersona || 'None'}`);

  const decision = await loadDecision();
  const { topic, dayOfWeek, urgency = 0 } = decision;

  let selectedPersona;

  // Manual override
  if (overridePersona && overridePersona !== 'auto') {
    selectedPersona = overridePersona;
    console.log(`✋ Manual override: ${selectedPersona}`);
  }
  // Friday always uses both
  else if (dayOfWeek === 5) {
    selectedPersona = 'both';
    console.log('📅 Friday: Using both personas for weekly outlook');
  }
  // High urgency breaking news
  else if (urgency >= 9) {
    selectedPersona = 'both';
    console.log('🚨 Critical breaking news: Using both personas');
  }
  // Topic-based selection
  else if (TOPIC_PERSONA_MAP[topic]) {
    selectedPersona = TOPIC_PERSONA_MAP[topic];
    console.log(`📋 Topic-based: ${topic} → ${selectedPersona}`);
  }
  // Day-based alternating
  else {
    selectedPersona = dayOfWeek % 2 === 0 ? 'fatima' : 'ahmed';
    console.log(`📆 Day-based alternating: ${selectedPersona}`);
  }

  const selection = {
    persona: selectedPersona,
    topic: topic,
    dayOfWeek: dayOfWeek,
    urgency: urgency,
    timestamp: new Date().toISOString(),
    profiles: selectedPersona === 'both'
      ? [PERSONA_PROFILES.fatima, PERSONA_PROFILES.ahmed]
      : [PERSONA_PROFILES[selectedPersona]]
  };

  // Add rotation info
  if (selectedPersona === 'both') {
    selection.script_format = 'dialogue';
    selection.video_format = 'split_screen_or_alternating';
    selection.intro = 'fatima'; // Fatima always introduces
    selection.conclusion = 'ahmed'; // Ahmed concludes
  } else {
    selection.script_format = 'monologue';
    selection.video_format = 'single_avatar';
  }

  await saveSelection(selection);

  console.log('\n✅ Persona Selection:');
  console.log(JSON.stringify(selection, null, 2));

  if (testMode) {
    console.log('\n🧪 TEST MODE: Selection validated');
    process.exit(0);
  }

  return selection;
}

async function saveSelection(selection) {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(selection, null, 2));
    console.log(`💾 Selection saved to ${STATE_FILE}`);
  } catch (error) {
    console.error('Failed to save selection:', error.message);
  }
}

function getPersonaProfile(personaName) {
  return PERSONA_PROFILES[personaName];
}

// Main execution
if (require.main === module) {
  selectPersona()
    .then(selection => {
      console.log('\n✅ Persona selector complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Persona selection failed:', error);
      process.exit(1);
    });
}

module.exports = { selectPersona, getPersonaProfile, PERSONA_PROFILES };
