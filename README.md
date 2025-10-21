# Seekapa YouTube Automation Pipeline

AI-powered video generation and publishing system for Seekapa's YouTube channel. Automatically creates, produces, and publishes Arabic (Khaleeji dialect) forex trading content.

## 🎯 Overview

This system orchestrates a complete 8-step pipeline:

1. **Market Research** - Gathers latest forex/market data via Perplexity API
2. **Event Detection** - Analyzes urgency and detects breaking news
3. **Topic Decision** - Chooses between breaking news or scheduled educational content
4. **Script Generation** - Creates Arabic scripts using Azure OpenAI GPT-5
5. **Script Review** - Quality checks with GPT-5 Pro
6. **Video Production** - Generates AI avatar videos via Synthesia
7. **Brand Overlay** - Adds Seekapa logo and watermark
8. **YouTube Upload** - Publishes to YouTube channel

## 🏗️ Architecture

```
videos-integration/
├── src/
│   ├── index.js                    # Main entry point
│   ├── orchestrator.js             # Pipeline coordinator
│   ├── state-manager.js            # State persistence
│   ├── config/
│   │   ├── index.js                # Configuration loader
│   │   └── env-validator.js        # Environment validation
│   ├── pipeline/
│   │   ├── 1-research.js           # Market research
│   │   ├── 2-event-detection.js    # Breaking news detection
│   │   ├── 3-topic-decision.js     # Topic selection logic
│   │   ├── 4-script-generation.js  # Arabic script generation
│   │   ├── 5-script-review.js      # Quality assurance
│   │   ├── 6-video-production.js   # Synthesia video generation
│   │   ├── 7-brand-overlay.js      # Branding with FFmpeg
│   │   └── 8-youtube-upload.js     # YouTube publishing
│   └── utils/
│       ├── logger.js               # Winston logging
│       ├── error-handler.js        # Error management
│       └── metrics.js              # Performance tracking
├── output/
│   ├── videos/                     # Generated videos
│   └── branded/                    # Branded videos
├── logs/                           # Application logs
├── package.json
├── .env                            # Environment variables
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- FFmpeg (for video processing)
- API Keys (Synthesia, Azure OpenAI, Perplexity, YouTube)

### Installation

1. **Clone and navigate to directory:**
```bash
cd /home/odedbe/videos-integration
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Install FFmpeg (if not already installed):**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Synthesia
SYNTHESIA_API_KEY=your_synthesia_api_key

# Azure OpenAI
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
GPT5_DEPLOYMENT_NAME=gpt-5
GPT5_PRO_DEPLOYMENT_NAME=gpt-5-pro

# Perplexity
PERPLEXITY_API_KEY=your_perplexity_api_key
PERPLEXITY_ENDPOINT=https://api.perplexity.ai

# YouTube
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token
YOUTUBE_CHANNEL_ID=your_youtube_channel_id

# Application Settings
NODE_ENV=production
LOG_LEVEL=info
MAX_RETRIES=3
URGENCY_THRESHOLD=7
```

## 📖 Usage

### Run the Pipeline

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev

# Run tests
npm test
```

## 📊 Monitoring

### Logs

- **Combined logs**: `logs/combined.log`
- **Error logs**: `logs/error.log`
- **Pipeline state**: `pipeline_state.json`

### Metrics

The system tracks:
- Pipeline success/failure rates
- Step-by-step execution times
- Retry attempts
- Error patterns

## 🐛 Troubleshooting

### Common Issues

**1. FFmpeg not found**
```bash
sudo apt-get install ffmpeg
```

**2. Synthesia API errors**
- Verify API key in `.env`
- Check avatar IDs are valid
- Ensure sufficient Synthesia credits

**3. YouTube upload fails**
- Refresh OAuth tokens
- Verify channel permissions
- Check video file size < 256GB

**4. Script generation timeout**
- Increase Azure OpenAI timeout
- Check API key validity
- Verify deployment names

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm start
```

## 🔒 Security

- **Never commit `.env` file**
- Store secrets in GitHub Secrets for Actions
- Rotate API keys regularly
- Use private video status for testing

## 📈 Performance

- Average pipeline duration: ~10-15 minutes
- Synthesia video generation: ~5-8 minutes
- Script generation: <30 seconds
- YouTube upload: 1-3 minutes (depends on video size)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Status**: Production Ready
