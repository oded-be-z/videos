# Synthesia Video Producer Agent

AI-powered video production system using Synthesia API for creating Arabic avatar videos with Seekapa branding.

## Features

- **Synthesia API Integration**: Create AI avatar videos with professional Arabic voices
- **Brand Overlay System**: Automatically add Seekapa logo watermark to videos
- **Multiple Arabic Dialects**: Support for Saudi (ar-SA), UAE (ar-AE), and Egyptian (ar-EG) voices
- **Flexible Personas**: Professional, friendly, expert, and consultant avatars
- **Batch Production**: Create multiple videos sequentially or in parallel
- **Automatic Retry Logic**: Handles transient failures with exponential backoff
- **Video Validation**: Ensures videos meet duration and quality requirements
- **FFmpeg Processing**: Professional video post-processing and branding

## Architecture

```
src/
├── agents/
│   └── video-producer.js       # Main orchestrator
├── services/
│   ├── synthesia.js            # Synthesia API client
│   └── video-processor.js      # FFmpeg wrapper
├── utils/
│   ├── brand-overlay.js        # Logo watermark system
│   └── polling.js              # Polling and retry utilities
└── config/
    └── synthesia-config.json   # Avatars, voices, personas
```

## Installation

```bash
cd /home/odedbe/videos-synthesia-agent
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Synthesia API key:
```bash
SYNTHESIA_API_KEY=your_api_key_here
```

## Usage

### Basic Video Creation

```javascript
const VideoProducerAgent = require('./src/agents/video-producer');

const producer = new VideoProducerAgent();

const result = await producer.produceVideo({
  title: 'Seekapa Introduction',
  script: 'مرحباً بكم في سيكابا، منصة التداول الموثوقة',
  persona: 'professional',
  language: 'ar-SA',
  gender: 'female',
  test: false,
  addBranding: true
});

console.log('Video created:', result.finalVideoPath);
```

### Batch Production

```javascript
const batch = await producer.produceBatch([
  {
    title: 'Video 1',
    script: 'Script 1...',
    persona: 'professional',
    language: 'ar-SA',
    gender: 'female'
  },
  {
    title: 'Video 2',
    script: 'Script 2...',
    persona: 'expert',
    language: 'ar-AE',
    gender: 'male'
  }
], {
  sequential: true
});

console.log('Batch stats:', batch.stats);
```

### Using Predefined Personas

```javascript
// Seekapa trader persona (male, Saudi, expert avatar)
await producer.produceVideo({
  title: 'Trading Tips',
  script: 'نصائح التداول...',
  persona: 'seekapa_trader',
  addBranding: true
});

// Seekapa support persona (female, Saudi, friendly avatar)
await producer.produceVideo({
  title: 'Customer Support',
  script: 'كيف نساعدك...',
  persona: 'seekapa_support',
  addBranding: true
});
```

## Available Personas

### Seekapa Personas
- `seekapa_trader`: Professional male trader (Saudi Arabic)
- `seekapa_support`: Friendly female support (Saudi Arabic)
- `seekapa_educator`: Professional female educator (Saudi Arabic)

### Axia Personas
- `axia_trader`: Professional male trader (UAE Arabic)
- `axia_support`: Friendly female support (UAE Arabic)
- `axia_educator`: Professional female educator (UAE Arabic)

## Testing

Run the test suite:

```bash
npm test
```

Run specific tests:

```javascript
const tests = require('./tests/test-synthesia');

// Test basic video creation
await tests.testBasicVideoCreation();

// Test video with branding
await tests.testVideoWithBranding();

// Test batch production
await tests.testBatchProduction();
```

## API Reference

### VideoProducerAgent

#### `produceVideo(options)`

Create a single video with branding.

**Options:**
- `script` (string, required): Arabic script text
- `title` (string, required): Video title
- `persona` (string): Avatar persona (default: 'professional')
- `language` (string): Language dialect (default: 'ar-SA')
- `gender` (string): Voice gender (default: 'female')
- `background` (string): Background type (default: 'off_white')
- `test` (boolean): Test mode (default: false)
- `addBranding` (boolean): Add watermark (default: true)
- `maxRetries` (number): Max retry attempts (default: 3)

**Returns:** Promise<Object>
```javascript
{
  success: true,
  videoId: "abc123",
  title: "Video Title",
  rawVideoPath: "/path/to/raw.mp4",
  finalVideoPath: "/path/to/branded.mp4",
  branded: true,
  metadata: {
    duration: 45.2,
    status: "complete",
    persona: "professional",
    language: "ar-SA",
    gender: "female",
    avatar: "Anna - Professional",
    voice: "Saudi Arabic Female - Natural"
  },
  timestamp: "2025-10-21T10:00:00.000Z"
}
```

#### `produceBatch(videoRequests, options)`

Create multiple videos in batch.

**Parameters:**
- `videoRequests` (Array<Object>): Array of video options
- `options.sequential` (boolean): Process sequentially (default: true)
- `options.concurrency` (number): Max concurrent if parallel (default: 3)

**Returns:** Promise<Object>
```javascript
{
  results: [...],  // Array of successful results
  errors: [...],   // Array of errors
  stats: {
    total: 10,
    successful: 9,
    failed: 1,
    successRate: "90.00%"
  }
}
```

## Credits

- **Synthesia API**: https://www.synthesia.io/
- **FFmpeg**: https://ffmpeg.org/
- **Agent**: Video Producer Agent (Agent 4)

## License

Internal use only - Seekapa/Axia brands