# Seekapa AI Persona Development

**Branch:** `feature/persona-creation`
**Version:** 1.0.0
**Status:** Complete - Ready for Integration
**Agent:** Agent 1 - Persona Architect

---

## Project Overview

This repository contains the AI influencer persona development for **Seekapa Trading Academy YouTube Channel**. Two professional personas have been created to deliver educational forex and CFD trading content to the GCC market:

- **Fatima Al-Rashid (فاطمة الراشد)** - Senior Market Analyst & Trading Educator
- **Ahmed Al-Mansouri (أحمد المنصوري)** - Chief Trading Strategist & Market Commentator

---

## Repository Structure

```
/home/odedbe/videos-persona-dev/
├── README.md                          # This file
├── src/
│   └── config/
│       ├── personas.json              # Complete persona definitions
│       ├── brand-compliance.json      # Seekapa brand guidelines & compliance rules
│       └── weekly-schedule.json       # Content calendar and production workflow
└── docs/
    ├── PERSONAS.md                    # Detailed persona profiles (English & Arabic)
    └── BRAND_GUIDELINES.md            # Extracted Seekapa brand book guidelines
```

---

## Key Deliverables

### 1. Persona Profiles (`src/config/personas.json`)

Complete JSON configuration for two AI personas:

- **Demographics & Background:** Age, location, experience, professional history
- **Expertise Areas:** Trading knowledge and specializations
- **Voice Characteristics:** Tone, pace, accent, formality
- **Content Focus:** Topics, audience, style
- **Synthesia Configuration:** Avatar and voice IDs (placeholders for now)
- **ElevenLabs Voice Settings:** Arabic voice synthesis parameters
- **Weekly Schedule:** Content distribution by day
- **Signature Phrases:** Authentic language in English and Arabic
- **Compliance Role:** How each persona addresses regulatory requirements

### 2. Brand Compliance (`src/config/brand-compliance.json`)

Comprehensive brand and regulatory guidelines:

- **Visual Identity:** Color palette, typography (Gilroy), logo usage
- **Video Branding Requirements:** Intro/outro, lower thirds, backgrounds
- **Regulatory Compliance:** Mandatory disclaimers, prohibited content
- **Content Guidelines:** Tone of voice, messaging principles, approved CTAs
- **AEO Strategy:** Combating "scam" perception through transparency
- **Quality Standards:** Video production specifications
- **Platform-Specific:** YouTube optimization guidelines

### 3. Weekly Content Calendar (`src/config/weekly-schedule.json`)

Production-ready content schedule:

- **5-7 Videos Per Week:** Detailed schedule by day and persona
- **Content Types:** Educational, market analysis, strategy, tips, debates
- **Video Structure Templates:** Timestamps and section breakdowns
- **Language Mix:** 70% Arabic (Khaleeji), 30% English
- **Production Workflow:** Timeline from concept to publish
- **Performance Metrics:** KPIs and optimization triggers

### 4. Documentation

**`docs/PERSONAS.md`** - 27-page comprehensive guide:
- Detailed persona profiles (Fatima & Ahmed)
- Professional backgrounds and expertise
- Voice characteristics and signature phrases
- Weekly content responsibilities
- Visual presentation specifications
- Collaborative content formats
- Success metrics and optimization

**`docs/BRAND_GUIDELINES.md`** - Complete brand book extraction:
- Seekapa visual identity (colors, typography, logos)
- Video branding requirements
- Regulatory compliance mandates
- Content guidelines and tone of voice
- AEO strategy for trust-building
- YouTube-specific best practices

---

## Persona Summary

### Fatima Al-Rashid (فاطمة الراشد)

**Role:** Senior Market Analyst & Trading Educator
**Focus:** Educational content, risk management, beginner-friendly tutorials
**Personality:** Professional, warm, patient educator
**Weekly Content:** Monday (Educational), Wednesday (Tips), Friday (Risk Management)
**Target Audience:** Aspiring traders, beginners, risk-conscious investors

**Key Themes:**
- Forex fundamentals
- Risk management strategies
- Trading psychology
- Step-by-step tutorials
- Market sentiment analysis

---

### Ahmed Al-Mansouri (أحمد المنصوري)

**Role:** Chief Trading Strategist & Market Commentator
**Focus:** Technical analysis, market commentary, trading strategies
**Personality:** Authoritative, analytical, data-driven
**Weekly Content:** Sunday (Market Outlook), Tuesday (Technical Analysis), Thursday (Strategy)
**Target Audience:** Intermediate-advanced traders, strategy-focused investors

**Key Themes:**
- Technical chart analysis
- Trading strategies
- Market trend forecasting
- Economic indicators
- Advanced trading techniques

---

## Brand Integration

### Seekapa Brand Colors

**Primary:**
- Seekapa Green: `#1D880D` (Buy signals, positive indicators)
- Seekapa Purple: `#490250` (Premium features, accents)

**Light Variants:**
- Green Light: `#B2FBA5` (Backgrounds)
- Purple Light: `#FAE3FF` (Backgrounds)

**Accents:**
- Black: `#000000` (Text)
- Coral Red: `#EF513C` (Sell signals, warnings)
- Soft Yellow: `#FDDF8A` (Highlights)
- Gray Blue: `#D5D9E5` (Neutral backgrounds)

### Typography

**Font Family:** Gilroy (all weights: Light, Regular, Medium, Semibold, Bold)
**Font Location:** `/home/odedbe/brand books/Seekapa/gilroy/`

### Logo Files

- **Light Logo:** `/home/odedbe/brand books/Seekapa/logo-light.svg` (dark backgrounds)
- **Dark Logo:** `/home/odedbe/brand books/Seekapa/logo-dark.svg` (light backgrounds)

---

## Regulatory Compliance

### Mandatory Risk Disclaimers

**Every video must include:**

1. **Intro (2 seconds):** Brief text overlay - "Educational Content - Not Financial Advice"
2. **Outro (5 seconds):** Full-screen risk disclaimer (English/Arabic)
3. **Video Description:** Full disclaimer in first 3 lines
4. **Pinned Comment:** Comprehensive disclaimer with regulatory links

### Prohibited Content

- ❌ Guaranteed profit claims
- ❌ Get rich quick schemes
- ❌ Unrealistic return promises
- ❌ Pressure tactics
- ❌ Misleading success rates

### Required Elements

- ✅ Risk warnings (intro and outro)
- ✅ Educational framing
- ✅ Balanced view (acknowledge losses)
- ✅ Capital preservation emphasis
- ✅ Demo account encouragement

---

## Next Steps for Production

### 1. Synthesia Setup
- [ ] Obtain Synthesia API key from user
- [ ] Select Arabic-speaking avatars for Fatima and Ahmed
- [ ] Configure Gulf Arabic (Khaleeji) voice options
- [ ] Test avatar quality and voice accuracy

### 2. Script Development
- [ ] Write first 2 weeks of content (10 scripts)
- [ ] Review with Seekapa compliance team
- [ ] Translate to Arabic (Khaleeji dialect)
- [ ] Cultural appropriateness check

### 3. Video Production Pipeline
- [ ] Generate videos via Synthesia API
- [ ] Add Seekapa branding (intro/outro/watermark)
- [ ] Embed lower thirds with persona names
- [ ] Add subtitles (Arabic and English)
- [ ] Create thumbnails following brand guidelines

### 4. YouTube Channel Setup
- [ ] Optimize channel name and description
- [ ] Create playlists (Fatima's Series, Ahmed's Series, Debates)
- [ ] Set up upload schedule
- [ ] Configure analytics tracking

### 5. Launch & Monitoring
- [ ] Publish first batch (5 videos)
- [ ] Monitor engagement metrics
- [ ] Gather audience feedback
- [ ] Iterate based on performance data

---

## Integration with Main Project

**When merging to `main`:**

1. Integrate persona configs with video generation pipeline
2. Ensure Synthesia API integration reads `personas.json`
3. Apply brand compliance rules to all video outputs
4. Implement weekly schedule automation
5. Set up performance tracking for persona effectiveness

---

## Technical Specifications

### Video Production Standards

- **Resolution:** 1080p minimum (4K preferred)
- **Aspect Ratio:** 16:9 (YouTube standard)
- **Frame Rate:** 24fps or 30fps
- **Audio:** Clear, professional (-18 to -20 LUFS)
- **Subtitles:** Dual language (Arabic + English)
- **Format:** MP4 (H.264 codec)

### Content Cadence

- **Weekly Videos:** 5-7 videos
- **Fatima:** 40% of content
- **Ahmed:** 40% of content
- **Collaborative:** 20% of content
- **Language:** 70% Arabic (Khaleeji), 30% English

---

## Performance Metrics

### KPIs to Track

- View count per video
- Average watch time
- Audience retention rate
- Subscriber growth
- Engagement rate (likes, comments, shares)
- Click-through rate to seekapa.com
- Language preference analytics
- Persona popularity comparison

### Optimization Triggers

- Retention < 40% → Shorten video length
- Low engagement → Adjust CTA clarity
- Arabic outperforms → Increase to 80% Arabic
- Persona imbalance → Adjust content distribution

---

## Project Context

### Business Objectives

1. **Combat "Scam" Perception:** Through transparent, educational content
2. **Establish Thought Leadership:** Position Seekapa as GCC trading education authority
3. **Drive Platform Engagement:** Convert viewers to Seekapa users
4. **Build Trust:** Demonstrate regulatory compliance and expertise
5. **GCC Market Dominance:** Culturally authentic content for UAE, Saudi, Kuwait audiences

### Target Markets

- **Primary:** GCC (UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman)
- **Languages:** Arabic (Khaleeji dialect - 70%), English (30%)
- **Audience:** Aspiring traders, investors, financially curious individuals

---

## Contact & Ownership

**Project Owner:** Seekapa Brand Team
**Development Agent:** Agent 1 - Persona Architect
**Branch:** `feature/persona-creation`
**Repository:** `/home/odedbe/videos-persona-dev/`

**Related Projects:**
- Main video generation pipeline: `/home/odedbe/videos/`
- Seekapa brand assets: `/home/odedbe/brand books/Seekapa/`
- Seekapa legal documentation: `/home/odedbe/axia and seekapa documenation/Seekapa Legal Documents New Version 26.05.2025/`

---

## License & Compliance

**Confidential:** This repository contains proprietary Seekapa brand assets and strategic content plans. Not for public distribution.

**Regulatory Compliance:** All content must adhere to GCC financial regulations and Seekapa's licensing requirements.

---

**Status:** ✅ Complete - Ready for integration and production

