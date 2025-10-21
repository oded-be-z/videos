# YouTube Upload System - Setup Guide

Complete guide for setting up YouTube Data API v3 integration for automated video uploads.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [OAuth2 Credentials](#oauth2-credentials)
4. [Local Configuration](#local-configuration)
5. [Authorization Flow](#authorization-flow)
6. [Testing](#testing)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ A YouTube channel (logged in with Google account)
- ✅ Node.js installed (v14+ recommended)
- ✅ Access to Google Cloud Console
- ✅ Video files ready for upload

---

## Google Cloud Console Setup

### Step 1: Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `Seekapa YouTube Automation`
4. Click **Create**

### Step 2: Enable YouTube Data API v3

1. In your new project, go to **APIs & Services** → **Library**
2. Search for `YouTube Data API v3`
3. Click on it, then click **Enable**
4. Wait for the API to be enabled (this may take a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Click **Create**

**Fill in the required information:**

- **App name:** `Seekapa YouTube Uploader`
- **User support email:** Your email
- **Developer contact email:** Your email
- **App logo:** (Optional) Upload Seekapa logo
- Click **Save and Continue**

**Scopes:**

1. Click **Add or Remove Scopes**
2. Add these scopes:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/youtube.force-ssl`
3. Click **Update** → **Save and Continue**

**Test users:**

1. Click **Add Users**
2. Add the Google account email that owns your YouTube channel
3. Click **Save and Continue**

### Step 4: Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app** (or **Web application** if deploying to server)
4. Name: `Seekapa YouTube Desktop Client`
5. Click **Create**

**IMPORTANT:** Download the JSON file!

6. Click **Download JSON** button
7. Save this file as `youtube-credentials.json`

---

## Local Configuration

### Step 1: Install Dependencies

```bash
cd /home/odedbe/videos-youtube-agent
npm install
```

### Step 2: Add Credentials File

1. Move your downloaded credentials file to the config directory:

```bash
mv ~/Downloads/client_secret_*.json ./src/config/youtube-credentials.json
```

2. Verify the file is in place:

```bash
ls -la ./src/config/youtube-credentials.json
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

Edit `.env` if needed (most settings are auto-detected from credentials file).

---

## Authorization Flow

### Step 1: Run Authorization Script

```bash
node src/services/oauth.js
```

This will:
1. Display an authorization URL
2. Open this URL in your browser
3. Prompt you to sign in with Google
4. Ask for permission to access your YouTube channel

### Step 2: Authorize the Application

1. Copy the URL from the terminal
2. Open it in your browser
3. Sign in with the Google account that owns your YouTube channel
4. Review the permissions:
   - Upload videos
   - Manage your YouTube account
   - Manage your YouTube videos
5. Click **Allow**

### Step 3: Enter Authorization Code

1. Google will show you an authorization code
2. Copy the code
3. Paste it in the terminal when prompted
4. Press Enter

**Success!** You should see:
```
Authorization successful!
Token saved to: /path/to/config/youtube-token.json
```

---

## Testing

### Test 1: Verify Setup

```bash
npm test
```

This will:
- ✅ Initialize the YouTube API client
- ✅ Get your channel information
- ✅ Create standard playlists
- ✅ Test metadata generation

### Test 2: Get Channel Info

```javascript
const YouTubeUploadSystem = require('./src/index');

async function test() {
  const system = new YouTubeUploadSystem();
  await system.initialize();

  const info = await system.getChannelInfo();
  console.log('Channel:', info.title);
  console.log('Subscribers:', info.subscriberCount);
}

test();
```

### Test 3: Create Playlists

```bash
node -e "
const YouTubeUploadSystem = require('./src/index');
(async () => {
  const system = new YouTubeUploadSystem();
  await system.setupPlaylists();
})();
"
```

---

## Usage Examples

### Example 1: Upload a Single Video

```javascript
const YouTubeUploadSystem = require('./src/index');

async function uploadVideo() {
  const system = new YouTubeUploadSystem();

  const videoData = {
    topic: 'Daily Market Update',
    topicArabic: 'التحديث اليومي للسوق',
    summary: 'تحليل شامل لأسواق الفوركس اليوم',
    tradingPairs: [
      { pair: 'EUR/USD', price: '1.0850' },
      { pair: 'GBP/USD', price: '1.2650' }
    ],
    keyInsight: 'الدولار يواصل قوته',
    persona: {
      name: 'فاطمة الراشد',
      bio: 'محللة أسواق مالية معتمدة',
      specialty: 'التحليل الفني',
      tag: 'فاطمة_الراشد'
    },
    videoType: 'market_update',
    language: 'ar'
  };

  const result = await system.uploadVideo({
    videoPath: '/path/to/video.mp4',
    videoData: videoData,
    generateThumbnail: true,
    addToPlaylists: true
  });

  console.log('Video uploaded:', result.videoUrl);
}

uploadVideo();
```

### Example 2: Batch Upload

```javascript
const YouTubeUploadSystem = require('./src/index');

async function batchUpload() {
  const system = new YouTubeUploadSystem();

  const videos = [
    {
      videoPath: './output/video1.mp4',
      videoData: { /* video 1 data */ }
    },
    {
      videoPath: './output/video2.mp4',
      videoData: { /* video 2 data */ }
    }
  ];

  const { results, errors } = await system.uploadBatch(videos, 10000);
  console.log(`Uploaded: ${results.length}, Failed: ${errors.length}`);
}

batchUpload();
```

### Example 3: Custom Metadata

```javascript
const MetadataGenerator = require('./src/utils/youtube-metadata');

const metadata = MetadataGenerator.generateByType('educational', {
  topicArabic: 'كيفية قراءة الشموع اليابانية',
  summary: 'شرح مفصل لأنماط الشموع اليابانية',
  persona: {
    name: 'أحمد المنصوري',
    bio: 'خبير تحليل فني'
  },
  customTags: ['تعليم', 'شموع_يابانية']
});

console.log(metadata.title);
console.log(metadata.description);
```

---

## Troubleshooting

### Error: "No credentials file found"

**Solution:**
```bash
# Make sure credentials file exists
ls -la src/config/youtube-credentials.json

# If not, download from Google Cloud Console and move it
mv ~/Downloads/client_secret_*.json src/config/youtube-credentials.json
```

### Error: "Invalid credentials format"

**Cause:** Wrong credential type downloaded

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Make sure you created **Desktop app** credentials (not Web app or other type)
3. Download the correct JSON file
4. Replace the existing file

### Error: "The OAuth client was not found"

**Solution:**
1. Go to Google Cloud Console
2. Check that OAuth consent screen is properly configured
3. Verify that YouTube Data API v3 is enabled
4. Re-create OAuth credentials if needed

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not properly configured

**Solution:**
1. Go to **OAuth consent screen**
2. Make sure all required fields are filled
3. Add necessary scopes
4. Add your email as a test user
5. Try authorization flow again

### Error: "Quota exceeded"

**Cause:** YouTube API has daily quota limits

**Details:**
- Default quota: 10,000 units/day
- Video upload cost: ~1,600 units
- Max uploads/day: ~6 videos

**Solution:**
1. Wait until quota resets (midnight Pacific Time)
2. Request quota increase from Google Cloud Console
3. Space out uploads throughout the day

### Error: "Invalid video file"

**Solution:**
1. Check video file format (MP4, MOV, AVI supported)
2. Verify file isn't corrupted
3. Check file size (max 256GB or 12 hours)
4. Ensure file path is correct

### Authorization Token Expired

**Solution:**
```bash
# Re-run authorization flow
node src/services/oauth.js
```

The system automatically refreshes tokens, but if you encounter auth errors:
1. Delete the old token: `rm src/config/youtube-token.json`
2. Run authorization again

---

## API Quota Information

### Daily Quota: 10,000 units

**Upload costs:**
- Video upload: ~1,600 units
- Thumbnail upload: 50 units
- Add to playlist: 50 units
- Create playlist: 50 units

**Example calculation:**
- Upload video + thumbnail + 3 playlists = 1,600 + 50 + (50 × 3) = 1,800 units
- Daily capacity: ~5 full uploads

### Request Quota Increase

If you need higher quota:

1. Go to Google Cloud Console → IAM & Admin → Quotas
2. Find "YouTube Data API v3"
3. Click "Edit Quotas"
4. Explain your use case
5. Request increase (typically approved within 24-48 hours)

---

## Security Best Practices

1. **Never commit credentials:**
   ```bash
   # Already in .gitignore
   config/youtube-credentials.json
   config/youtube-token.json
   .env
   ```

2. **Restrict API key (if using):**
   - Go to Google Cloud Console → Credentials
   - Click on your API key
   - Set application restrictions
   - Set API restrictions to YouTube Data API v3 only

3. **Use environment-specific credentials:**
   - Development: Desktop app credentials
   - Production: Service account or web app credentials

4. **Rotate tokens regularly:**
   - Tokens expire after 7 days of inactivity
   - Re-authorize if needed

---

## Next Steps

1. ✅ Complete setup and authorization
2. ✅ Test with sample video
3. ✅ Integrate with video generation pipeline
4. ✅ Set up automated uploads
5. ✅ Monitor quota usage
6. ✅ Optimize upload schedule

---

## Support & Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [YouTube API Quota Calculator](https://developers.google.com/youtube/v3/determine_quota_cost)

---

**Setup Complete!** 🎉

Your YouTube upload system is ready to automate video publishing to your Seekapa channel.
