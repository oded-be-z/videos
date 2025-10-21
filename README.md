# Seekapa YouTube AI Influencer Automation
**Complete Video Production Pipeline - From Market Research to YouTube Upload**

[![Status](https://img.shields.io/badge/status-production--ready-success)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![AI Agents](https://img.shields.io/badge/agents-7-orange)]()

---

## 🎯 Project Overview

Fully automated AI influencer video production system for Seekapa YouTube channel featuring two GCC Arabic AI personas (Fatima Al-Rashid & Ahmed Al-Mansouri) delivering daily 1-minute forex/crypto/commodities market insights.

**Complete Pipeline**: Market Research → Script Generation (Arabic GCC) → AI Avatar Videos (Synthesia) → YouTube Upload → Social Media Distribution

---

## 🤖 AI Influencer Personas

### Fatima Al-Rashid (فاطمة الراشد)
- **Title**: Senior Market Analyst & Trading Educator
- **Focus**: Educational content, risk management
- **Personality**: Professional, warm, patient
- **Schedule**: Monday (Education), Wednesday (Tips), Friday (Risk Management)

### Ahmed Al-Mansouri (أحمد المنصوري)
- **Title**: Chief Trading Strategist & Market Commentator
- **Focus**: Technical analysis, market strategies
- **Personality**: Authoritative, analytical, data-driven
- **Schedule**: Sunday (Outlook), Tuesday (Analysis), Thursday (Strategy)

---

## 📁 Repository Structure

```
videos/
├── src/
│   ├── agents/                  # 7 specialized AI agents
│   │   ├── market-research.js   # Perplexity + market data
│   │   ├── script-writer.js     # Arabic GCC script generation
│   │   └── video-producer.js    # Synthesia integration
│   ├── services/                # API integrations
│   │   ├── perplexity.js        # Research API
│   │   ├── synthesia.js         # Video generation
│   │   ├── youtube.js           # Upload automation
│   │   └── market-data.js       # Forex/crypto/commodities
│   ├── pipeline/                # 8-step automation
│   │   ├── 1-research.js
│   │   ├── 2-event-detection.js
│   │   ├── 3-topic-decision.js
│   │   ├── 4-script-generation.js
│   │   ├── 5-script-review.js
│   │   ├── 6-video-production.js
│   │   ├── 7-brand-overlay.js
│   │   └── 8-youtube-upload.js
│   ├── config/                  # Configuration
│   │   ├── personas.json        # Fatima & Ahmed profiles
│   │   ├── brand-compliance.json # Seekapa brand rules
│   │   └── weekly-schedule.json  # Content calendar
│   └── utils/                   # Utilities
│       ├── arabic-validator.js
│       ├── brand-overlay.js
│       └── logger.js
├── .github/workflows/           # GitHub Actions automation
│   ├── daily-video.yml          # Main daily automation
│   ├── manual-override.yml      # Breaking news trigger
│   └── test-pipeline.yml        # Testing workflow
├── docs/                        # Documentation
│   ├── PERSONAS.md
│   ├── BRAND_GUIDELINES.md
│   └── WORKFLOWS.md
└── tests/                       # Test suites
```

---

## ⚡ Quick Start

### Installation

```bash
cd /home/odedbe/videos
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Add API keys to `.env`:
```bash
# Synthesia (Video Generation)
SYNTHESIA_API_KEY=your_synthesia_api_key_here

# Azure OpenAI (Scripts & Analysis)
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Perplexity (Market Research)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# YouTube (Upload)
YOUTUBE_CLIENT_ID=your_google_client_id_here
YOUTUBE_CLIENT_SECRET=your_google_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_oauth_refresh_token_here
```

### Run Pipeline

```bash
# Full pipeline (test mode)
npm start

# Test individual components
npm run test:research
npm run test:script
npm run test:video
npm run test:upload
```

---

## 🔄 Automation Workflow

### Daily Video Production (6:00 AM UTC = 9:00 AM UAE)

1. **Market Research** (5 min) - Perplexity API
   - Fetch forex/crypto/commodities prices
   - Analyze breaking news
   - Detect major market events

2. **Event Detection** (3 min) - GPT-5 Pro
   - Score urgency 1-10
   - Decide: Breaking news vs scheduled content
   - Select persona (Fatima/Ahmed/Both)

3. **Script Generation** (10 min) - GPT-5
   - Generate 180-220 word Arabic (GCC dialect) script
   - Ensure 60-second duration
   - Include mandatory risk disclaimers

4. **Quality Review** (5 min) - GPT-5 Pro
   - Validate Arabic grammar
   - Check brand compliance
   - Verify regulatory requirements

5. **Video Production** (20-30 min) - Synthesia
   - Create AI avatar video with Arabic voice
   - Select appropriate background
   - Generate 1080p MP4

6. **Brand Overlay** (2 min) - FFmpeg
   - Add Seekapa logo watermark
   - Apply brand styling
   - Validate output quality

7. **YouTube Upload** (5 min) - YouTube API
   - Upload with SEO metadata
   - Arabic title + English description
   - Auto-categorize to playlists

8. **Distribution** (3 min)
   - Cross-post to Instagram Reels
   - Share on X (Twitter)
   - Update LinkedIn

**Total Time**: ~50-60 minutes per video

---

## 🎬 Features

### 1. AI Persona System
- **2 Professional Personas**: Fatima (educator) & Ahmed (analyst)
- **Authentic Arabic**: GCC Khaleeji dialect (not MSA)
- **Synthesia AI Avatars**: Middle Eastern representation
- **Voice Synthesis**: Saudi/UAE Arabic voices

### 2. Hybrid Content Strategy
- **Scheduled Content**: Weekly calendar (Mon-Sun)
- **Breaking News**: Auto-override for urgent events (urgency ≥8/10)
- **Smart Scheduling**: Persona selection based on topic type

### 3. Market Intelligence
- **Real-time Data**: Forex, crypto, commodities
- **Breaking News Detection**: Fed decisions, market crashes, geopolitical events
- **Multi-source Aggregation**: Perplexity + multiple market APIs

### 4. Brand Compliance
- **Seekapa Guidelines**: Colors, fonts, logos
- **Mandatory Disclaimers**: Risk warnings in Arabic/English
- **Regulatory Compliance**: GCC financial regulations
- **Quality Standards**: 1080p, professional audio, subtitles

### 5. SEO Optimization
- **Bilingual Metadata**: Arabic titles, English descriptions
- **50+ Tags**: Arabic + English keywords
- **Playlist Management**: Auto-categorization
- **Thumbnail Generation**: YouTube-optimized (1280x720)

### 6. Complete Automation
- **GitHub Actions**: Daily cron (6 AM UTC)
- **Retry Logic**: 3 attempts with exponential backoff
- **Error Handling**: Automatic fallback and notifications
- **State Persistence**: Recovery from failures

---

## 📊 Weekly Content Schedule

| Day | Topic | Persona | Type | Duration |
|-----|-------|---------|------|----------|
| Sunday | Trading Psychology | Fatima | Educational | 60s |
| Monday | Market Analysis | Ahmed | Market Update | 60s |
| Tuesday | Forex Basics | Fatima | Tutorial | 60s |
| Wednesday | Technical Analysis | Ahmed | Strategy | 60s |
| Thursday | Risk Management | Fatima | Educational | 60s |
| Friday | Weekly Outlook | **Both** | Forecast | 60s |
| Saturday | Market Recap | Ahmed | Review | 60s |

**Override Rule**: If breaking news urgency ≥8, replace scheduled content.

---

## 🔧 Configuration

### Personas (`src/config/personas.json`)
- Complete profiles (demographics, expertise, voice)
- Synthesia avatar IDs
- Weekly responsibilities
- Signature phrases (Arabic/English)

### Brand Compliance (`src/config/brand-compliance.json`)
- Seekapa visual identity (colors, fonts, logos)
- Video branding requirements
- Mandatory disclaimers
- Content guidelines

### Weekly Schedule (`src/config/weekly-schedule.json`)
- 7-day content calendar
- Topic metadata
- Persona assignments
- Production timelines

---

## 🧪 Testing

```bash
# Full test suite
npm test

# Individual tests
npm run test:research      # Market research
npm run test:script        # Script generation
npm run test:video         # Synthesia video
npm run test:upload        # YouTube upload
npm run test:pipeline      # End-to-end

# Manual testing
npm run test:manual        # Test with override topic
```

---

## 🚀 Deployment

### GitHub Secrets Configuration

```bash
gh secret set SYNTHESIA_API_KEY --body "your_key_here"
gh secret set AZURE_OPENAI_KEY --body "your_key_here"
gh secret set PERPLEXITY_API_KEY --body "your_key_here"
gh secret set YOUTUBE_CLIENT_ID --body "your_client_id"
gh secret set YOUTUBE_CLIENT_SECRET --body "your_client_secret"
gh secret set YOUTUBE_REFRESH_TOKEN --body "your_refresh_token"
```

### Enable Daily Automation

GitHub Actions workflow runs automatically at 6:00 AM UTC (9:00 AM UAE) daily.

To trigger manually:
```bash
gh workflow run daily-video.yml
```

---

## 📈 Performance Metrics

### Success Criteria (6-Month Goals)
- ✅ Daily upload consistency: 95%+
- ✅ Average watch time: 45+ seconds (75% completion)
- ✅ Subscriber growth: 1,000+ subscribers
- ✅ Engagement rate: 5%+ (likes/comments/shares)
- ✅ Arabic quality score: 8+/10
- ✅ Lead generation: 50+ Seekapa sign-ups

---

## 🎨 Brand Guidelines

### Colors
- **Seekapa Green**: #1D880D (positive indicators)
- **Seekapa Purple**: #490250 (premium accents)
- **Coral Red**: #EF513C (warnings, sell signals)
- **Soft Yellow**: #FDDF8A (highlights)

### Typography
- **Font**: Gilroy (Light, Regular, Medium, Semibold, Bold)
- **Location**: `/home/odedbe/brand books/Seekapa/gilroy/`

### Logos
- **White Logo**: `/home/odedbe/brand books/Seekapa/LOGOS/Seekapa White Logo.png`
- **Black Logo**: `/home/odedbe/brand books/Seekapa/LOGOS/Seekapa Black Logo.png`

---

## 📚 Documentation

- **[PERSONAS.md](docs/PERSONAS.md)** - Complete persona profiles
- **[BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md)** - Seekapa brand book
- **[WORKFLOWS.md](docs/WORKFLOWS.md)** - GitHub Actions guide
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API references

---

## 🛠️ Technology Stack

### AI & APIs
- **Azure OpenAI**: GPT-5, GPT-5 Pro (scripts, analysis)
- **Synthesia**: AI avatar video generation
- **Perplexity**: Real-time market research
- **YouTube Data API v3**: Upload automation
- **CoinGecko**: Crypto prices
- **ExchangeRate-API**: Forex rates

### Infrastructure
- **GitHub Actions**: Daily automation
- **FFmpeg**: Video processing
- **Node.js**: Runtime environment
- **Winston**: Logging

### Languages
- **Arabic (GCC Khaleeji dialect)**: 70% of content
- **English**: 30% of content

---

## 📞 Support

- **Issues**: Contact Seekapa development team
- **Brand Assets**: `/home/odedbe/brand books/Seekapa/`
- **Legal Docs**: `/home/odedbe/axia and seekapa documenation/`

---

## ⚖️ License & Compliance

**Confidential**: Proprietary Seekapa brand assets and strategic content.

**Regulatory**: Complies with GCC financial regulations and Seekapa licensing.

---

**Status**: ✅ Production-Ready - All 7 agents deployed

Built with modern AI orchestration for automated video content at scale.
