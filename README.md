# YouTube Upload System - Agent 5

Complete YouTube Data API v3 integration for automated Seekapa video uploads with OAuth2 authentication, SEO-optimized metadata generation, thumbnail extraction, and playlist management.

## Features

- **OAuth2 Authentication** - Secure YouTube API access with automatic token refresh
- **Video Upload** - Upload videos with full metadata (title, description, tags)
- **SEO Optimization** - Auto-generate optimized titles, descriptions, and tags in Arabic/English
- **Thumbnail Generation** - Extract and customize video thumbnails
- **Playlist Management** - Automatically organize videos into categorized playlists
- **Batch Upload** - Upload multiple videos with quota management
- **Persona Support** - Organize content by AI persona (Fatima Al-Rashid, Ahmed Al-Mansouri)
- **Video Type Categorization** - Market updates, educational, trading tips, analysis

## Architecture

```
videos-youtube-agent/
├── src/
│   ├── services/
│   │   ├── youtube.js          # YouTube API client
│   │   └── oauth.js            # OAuth2 authentication
│   ├── utils/
│   │   ├── youtube-metadata.js # Metadata & SEO generation
│   │   ├── thumbnail-generator.js # Video thumbnail extraction
│   │   └── playlist-manager.js # Playlist categorization
│   ├── config/
│   │   └── youtube-config.json # Configuration settings
│   └── index.js                # Main orchestrator
├── tests/
│   └── test-youtube.js         # Test suite
└── docs/
    └── YOUTUBE_SETUP.md        # Complete setup guide
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure YouTube API

Follow the detailed guide in [docs/YOUTUBE_SETUP.md](./docs/YOUTUBE_SETUP.md) to:
1. Create Google Cloud project
2. Enable YouTube Data API v3
3. Set up OAuth2 credentials
4. Download credentials file

### 3. Add Credentials

```bash
# Place your credentials file
mv ~/Downloads/client_secret_*.json ./src/config/youtube-credentials.json
```

### 4. Authorize the Application

```bash
npm run auth
```

This will:
- Display authorization URL
- Prompt you to sign in with Google
- Save access token for future use

### 5. Test the Setup

```bash
npm test
```

## Usage

### Upload a Single Video

```javascript
const YouTubeUploadSystem = require('./src/index');

async function uploadVideo() {
  const system = new YouTubeUploadSystem();

  const videoData = {
    topic: 'Daily Forex Update',
    topicArabic: 'التحديث اليومي لسوق الفوركس',
    summary: 'تحليل شامل لأسواق الفوركس اليوم مع نظرة على أهم الأزواج.',
    tradingPairs: [
      { pair: 'EUR/USD', price: '1.0850' },
      { pair: 'GBP/USD', price: '1.2650' }
    ],
    keyInsight: 'الدولار الأمريكي يواصل قوته مقابل العملات الرئيسية',
    persona: {
      name: 'فاطمة الراشد',
      bio: 'محللة أسواق مالية معتمدة مع خبرة 10 سنوات',
      specialty: 'التحليل الفني والأساسي',
      tag: 'فاطمة_الراشد'
    },
    videoType: 'market_update',
    language: 'ar'
  };

  const result = await system.uploadVideo({
    videoPath: './output/video.mp4',
    videoData: videoData,
    generateThumbnail: true,
    addToPlaylists: true
  });

  console.log('Video uploaded:', result.videoUrl);
}

uploadVideo();
```

### Batch Upload

```javascript
const videos = [
  { videoPath: './video1.mp4', videoData: { /* ... */ } },
  { videoPath: './video2.mp4', videoData: { /* ... */ } }
];

const { results, errors } = await system.uploadBatch(videos, 10000);
console.log(`Uploaded: ${results.length}, Failed: ${errors.length}`);
```

### Setup Standard Playlists

```bash
npm run setup
```

This creates:
- Seekapa - كل الفيديوهات (All Videos)
- تحديثات السوق اليومية (Daily Market Updates)
- تعليم التداول (Trading Education)
- نصائح التداول (Trading Tips)
- تحليل السوق (Market Analysis)
- فاطمة الراشد - كل الفيديوهات (Fatima - All Videos)
- أحمد المنصوري - كل الفيديوهات (Ahmed - All Videos)

## Metadata Generation

### Title Format

**Arabic:** `{topic} | {persona} | Seekapa - {date}`

**Example:** `تحديث سوق الفوركس | فاطمة الراشد | Seekapa - ٢١ أكتوبر`

### Description Template

```
[Topic summary in Arabic - 2-3 sentences]

📊 الأزواج المتداولة:
- EUR/USD: 1.0850
- GBP/USD: 1.2650

💡 النصيحة:
[Key insight from video]

⚠️ تنويه المخاطر:
[Risk disclaimer - required for trading content]

🔗 ابدأ التداول مع Seekapa:
https://seekapa.com

👤 عن [Persona]:
[Brief bio and specialty]

📱 تابعنا:
Instagram | Twitter | LinkedIn

#فوركس #تداول #Seekapa #forex #trading
```

### Tags

Mix of Arabic and English for broader reach:
- Brand: `Seekapa`, `سيكابا`
- Trading: `فوركس`, `تداول`, `forex`, `trading`
- Educational: `تعليم التداول`, `forex education`
- Persona-specific tags
- Trading pair tags: `EURUSD`, `GBPUSD`, etc.

## Playlist Management

Videos are automatically added to playlists based on:

1. **Persona** - All videos from specific persona
2. **Video Type** - Market updates, educational, tips, analysis
3. **Trading Pairs** - Videos about specific currency pairs
4. **Master Playlist** - All Seekapa videos

## API Quota Management

**YouTube API Daily Quota:** 10,000 units

**Upload Costs:**
- Video upload: ~1,600 units
- Thumbnail upload: 50 units
- Add to playlist: 50 units each
- Create playlist: 50 units

**Daily Capacity:** ~5-6 full video uploads

The system automatically:
- Tracks quota usage
- Warns when approaching limit
- Handles quota exceeded errors

## Video Types

### Market Update
- Daily market analysis
- Trading pair prices
- Market trends

### Educational
- Trading tutorials
- Strategy explanations
- Beginner guides

### Trading Tips
- Quick trading insights
- Best practices
- Risk management

### Market Analysis
- Technical analysis
- Chart patterns
- Fundamental analysis

## Thumbnail Generation

Automatically extracts high-quality thumbnails:
- Resolution: 1280x720 (YouTube recommended)
- Format: JPG
- Quality: High (2 MB max)
- Timestamp: Middle of video (configurable)
- Custom overlays: Optional text with title/persona

## Configuration

Edit `src/config/youtube-config.json` for:
- Default privacy status
- Video category
- Thumbnail settings
- Playlist configuration
- Metadata templates
- API quota limits

## Testing

```bash
# Run full test suite
npm test

# Test specific upload (update path in test file)
npm test -- --upload

# Test batch upload
npm test -- --batch
```

## Environment Variables

Create `.env` file (copy from `.env.example`):

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob
DEFAULT_PRIVACY_STATUS=public
DEFAULT_CATEGORY_ID=22
NODE_ENV=production
```

## Security

- ✅ OAuth2 credentials stored securely
- ✅ Tokens auto-refresh
- ✅ Credentials excluded from git
- ✅ API key restrictions enabled
- ✅ Environment-based configuration

## Integration

This agent integrates with:
- **Agent 1:** Market Research - Provides trading data
- **Agent 2:** Script Writer - Generates video content
- **Agent 3:** Synthesia - Creates videos
- **Agent 4:** Workflow Orchestrator - Coordinates pipeline
- **Agent 6:** Final Integration - End-to-end automation

## Troubleshooting

See [docs/YOUTUBE_SETUP.md](./docs/YOUTUBE_SETUP.md) for:
- OAuth errors
- Quota exceeded issues
- Invalid credentials
- Upload failures
- Token refresh problems

## API References

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [OAuth2 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2)
- [Quota Management](https://developers.google.com/youtube/v3/determine_quota_cost)

## NPM Scripts

```bash
npm test          # Run tests
npm run auth      # Authorize with YouTube
npm run setup     # Create standard playlists
npm start         # Run main application
```

## License

MIT

## Support

For issues or questions:
1. Check [docs/YOUTUBE_SETUP.md](./docs/YOUTUBE_SETUP.md)
2. Review error messages
3. Verify API quota
4. Check credentials configuration

---

**Agent 5: YouTube Upload System** - Built for Seekapa's automated video content pipeline