# Seekapa YouTube Automation - Deployment Guide
**Production-Ready Deployment Instructions**

---

## 📋 Prerequisites Checklist

Before deploying to production, ensure you have:

- ✅ GitHub repository access: https://github.com/oded-be-z/videos
- ✅ Azure OpenAI API access (GPT-5, GPT-5-Pro, GPT-5-Codex)
- ✅ Synthesia API account and API key
- ✅ Perplexity API account and API key
- ✅ Google Cloud Console project for YouTube API
- ✅ Node.js 20+ installed locally for testing
- ✅ FFmpeg installed for video processing

---

## 🔐 Step 1: Configure GitHub Secrets

GitHub Actions workflows require secrets to be configured in your repository settings.

### Option A: Using GitHub CLI (Recommended)

```bash
# Navigate to project directory
cd /home/odedbe/videos

# Install GitHub CLI if not already installed
# sudo apt install gh

# Authenticate with GitHub
gh auth login

# Set all required secrets (get values from ~/.claude/CLAUDE.md)
gh secret set SYNTHESIA_API_KEY --body "your_synthesia_api_key_here"
gh secret set AZURE_OPENAI_KEY --body "your_azure_openai_key_here"
gh secret set AZURE_OPENAI_ENDPOINT --body "https://brn-azai.openai.azure.com/"
gh secret set PERPLEXITY_API_KEY --body "your_perplexity_api_key_here"

# YouTube credentials (complete Step 2 first to get these values)
gh secret set YOUTUBE_CLIENT_ID --body "your_google_client_id_here"
gh secret set YOUTUBE_CLIENT_SECRET --body "your_google_client_secret_here"
gh secret set YOUTUBE_REFRESH_TOKEN --body "your_oauth_refresh_token_here"

# Verify secrets were set
gh secret list
```

### Option B: Using GitHub Web Interface

1. Navigate to: https://github.com/oded-be-z/videos/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret individually:

| Secret Name | Value |
|------------|-------|
| `SYNTHESIA_API_KEY` | Get from ~/.claude/CLAUDE.md |
| `AZURE_OPENAI_KEY` | Get from ~/.claude/CLAUDE.md |
| `AZURE_OPENAI_ENDPOINT` | `https://brn-azai.openai.azure.com/` |
| `PERPLEXITY_API_KEY` | Get from ~/.claude/CLAUDE.md |
| `YOUTUBE_CLIENT_ID` | *(from Step 2)* |
| `YOUTUBE_CLIENT_SECRET` | *(from Step 2)* |
| `YOUTUBE_REFRESH_TOKEN` | *(from Step 2)* |

---

## 🎥 Step 2: YouTube API Setup

### 2.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Create Project"
3. Name: "Seekapa YouTube Automation"
4. Click "Create"

### 2.2 Enable YouTube Data API v3

1. Navigate to: https://console.cloud.google.com/apis/library
2. Search for "YouTube Data API v3"
3. Click the API and press "Enable"

### 2.3 Create OAuth 2.0 Credentials

1. Navigate to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Desktop app"
4. Name: "Seekapa Video Uploader"
5. Click "Create"
6. **Save the Client ID and Client Secret** (you'll need these)

### 2.4 Configure OAuth Consent Screen

1. Navigate to: https://console.cloud.google.com/apis/credentials/consent
2. User Type: "External"
3. Fill in required fields:
   - App name: "Seekapa YouTube Automation"
   - User support email: your email
   - Developer contact: your email
4. Scopes: Add `https://www.googleapis.com/auth/youtube.upload`
5. Test users: Add your Google account email
6. Save and continue

### 2.5 Generate Refresh Token

```bash
# Install dependencies
cd /home/odedbe/videos
npm install

# Run OAuth authorization flow
node scripts/get-youtube-token.js

# Follow the prompts:
# 1. Enter your Client ID
# 2. Enter your Client Secret
# 3. Browser will open for authorization
# 4. Grant permissions
# 5. Copy the refresh token displayed in terminal
```

The script will output:
```
✅ Authorization successful!

Your YouTube credentials:
CLIENT_ID: 123456789...apps.googleusercontent.com
CLIENT_SECRET: GOCSPX-abc123...
REFRESH_TOKEN: 1//0gHd...xyz

Add these to GitHub secrets:
gh secret set YOUTUBE_CLIENT_ID --body "123456789...apps.googleusercontent.com"
gh secret set YOUTUBE_CLIENT_SECRET --body "GOCSPX-abc123..."
gh secret set YOUTUBE_REFRESH_TOKEN --body "1//0gHd...xyz"
```

**Copy these values and add them to GitHub secrets** (see Step 1).

---

## 🎭 Step 3: Select Synthesia Avatars

### 3.1 Browse Available Avatars

1. Login to Synthesia: https://app.synthesia.io/
2. Navigate to: https://app.synthesia.io/avatars
3. Filter by:
   - Region: Middle East
   - Gender: Male & Female
   - Age: 40-50 years

### 3.2 Recommended Avatars for GCC Audience

Look for avatars with:
- Professional business attire
- Middle Eastern features
- Warm, trustworthy appearance
- Clear, high-quality rendering

### 3.3 Select Arabic Voices

1. Navigate to: https://app.synthesia.io/voices
2. Filter by language: Arabic
3. Recommended voices:
   - **Fatima**: Arabic (Saudi) - Female, professional tone
   - **Ahmed**: Arabic (UAE) - Male, authoritative tone

### 3.4 Update Configuration

Once you've selected avatars and voices, update the configuration:

```bash
cd /home/odedbe/videos
nano src/config/personas.json
```

Update the `avatarId` and `voiceId` fields:

```json
{
  "personas": {
    "Fatima_Al-Rashid": {
      "avatarId": "your-selected-female-avatar-id",
      "voiceId": "ar-SA-ZariyahNeural"
    },
    "Ahmed_Al-Mansouri": {
      "avatarId": "your-selected-male-avatar-id",
      "voiceId": "ar-AE-HamdanNeural"
    }
  }
}
```

---

## 🧪 Step 4: Local Testing

Before enabling production automation, test the complete pipeline locally.

### 4.1 Environment Setup

```bash
cd /home/odedbe/videos

# Create .env file (get API keys from ~/.claude/CLAUDE.md)
cat > .env << 'EOF'
SYNTHESIA_API_KEY=your_synthesia_api_key_here
AZURE_OPENAI_KEY=your_azure_openai_key_here
AZURE_OPENAI_ENDPOINT=https://brn-azai.openai.azure.com/
PERPLEXITY_API_KEY=your_perplexity_api_key_here
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
EOF

# Install dependencies
npm install
```

### 4.2 Test Individual Components

```bash
# Test market research (Perplexity)
npm run test:research
# Expected: JSON output with forex/crypto/commodities data

# Test script generation (GPT-5)
npm run test:script
# Expected: Arabic GCC script (180-220 words, 60 seconds)

# Test video production (Synthesia)
npm run test:video
# Expected: Video ID returned, check Synthesia dashboard

# Test YouTube upload
npm run test:upload
# Expected: YouTube video URL returned
```

### 4.3 Full Pipeline Test

```bash
# Run complete end-to-end pipeline
npm start

# Expected output:
# ✅ Step 1/8: Market research complete (5m 23s)
# ✅ Step 2/8: Event detection complete (2m 41s)
# ✅ Step 3/8: Topic decision complete (1m 12s)
# ✅ Step 4/8: Script generation complete (8m 56s)
# ✅ Step 5/8: Script review complete (4m 33s)
# ✅ Step 6/8: Video production complete (27m 18s)
# ✅ Step 7/8: Brand overlay complete (1m 45s)
# ✅ Step 8/8: YouTube upload complete (3m 22s)
#
# 🎉 Pipeline completed successfully!
# YouTube URL: https://www.youtube.com/watch?v=...
```

### 4.4 Verify Output Quality

After pipeline completion:

1. **Check YouTube video**:
   - Video plays correctly
   - Arabic audio is clear
   - Seekapa logo visible (bottom-right, 30% opacity)
   - Title and description in Arabic
   - Tags properly set

2. **Review logs**:
   ```bash
   cat logs/production-$(date +%Y-%m-%d).log
   ```

3. **Check Synthesia usage**:
   - Login to Synthesia dashboard
   - Verify credit consumption
   - Check video quality settings

---

## 🚀 Step 5: Enable Production Automation

Once local testing passes, enable daily automation.

### 5.1 Verify GitHub Secrets

```bash
gh secret list

# Expected output:
# AZURE_OPENAI_ENDPOINT
# AZURE_OPENAI_KEY
# PERPLEXITY_API_KEY
# SYNTHESIA_API_KEY
# YOUTUBE_CLIENT_ID
# YOUTUBE_CLIENT_SECRET
# YOUTUBE_REFRESH_TOKEN
```

### 5.2 Enable Workflow

The GitHub Actions workflow is already configured in `.github/workflows/daily-video.yml` to run daily at 6:00 AM UTC (9:00 AM UAE).

```yaml
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 9 AM UAE time
  workflow_dispatch:      # Manual trigger option
```

**The workflow will automatically start tomorrow at 6:00 AM UTC.**

### 5.3 Manual Trigger (Optional)

To test the GitHub Actions workflow immediately:

```bash
# Trigger workflow manually
gh workflow run daily-video.yml

# Monitor workflow execution
gh run list --workflow=daily-video.yml
gh run watch
```

Or via GitHub web interface:
1. Navigate to: https://github.com/oded-be-z/videos/actions
2. Select "Daily Seekapa Video Production"
3. Click "Run workflow" → "Run workflow"

### 5.4 Monitor First Production Run

```bash
# Watch workflow in real-time
gh run watch

# View logs
gh run view --log

# Check for errors
gh run view --log-failed
```

---

## 📊 Step 6: Post-Deployment Monitoring

### 6.1 Daily Monitoring Checklist

Each day, verify:

```bash
# Check today's workflow status
gh run list --workflow=daily-video.yml --limit 1

# View execution logs
gh run view --log

# Check YouTube upload
# Visit: https://www.youtube.com/channel/YOUR_CHANNEL_ID/videos
```

### 6.2 Set Up Notifications

Configure GitHub Actions email notifications:

1. GitHub Settings → Notifications
2. Enable "Actions" notifications
3. Choose email delivery

### 6.3 Monitor API Usage

**Synthesia**:
- Dashboard: https://app.synthesia.io/usage
- Monitor: Credits consumed per video
- Alert at: 80% of monthly quota

**Azure OpenAI**:
- Azure Portal: https://portal.azure.com/
- Navigate to: brn-azai → Metrics
- Monitor: Total tokens, requests per minute
- Alert at: 80% of TPM quota

**Perplexity**:
- Dashboard: https://www.perplexity.ai/settings/api
- Monitor: Request count, credit usage
- Alert at: 80% of monthly quota

**YouTube**:
- Quota usage: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
- Daily upload limit: 6 videos per day
- Monitor: Quota consumption

---

## 🔧 Troubleshooting

### Issue: GitHub Actions Workflow Fails

```bash
# View error logs
gh run view --log-failed

# Common fixes:
# 1. Verify all secrets are set correctly
gh secret list

# 2. Check syntax errors
gh workflow view daily-video.yml

# 3. Re-run failed workflow
gh run rerun --failed
```

### Issue: Synthesia API Errors

```bash
# Check API key validity
curl -X GET "https://api.synthesia.io/v2/videos" \
  -H "Authorization: 85d7cd90cba47b874cd5051af33e1e9e"

# Expected: 200 OK with video list
# If 401: API key invalid
# If 429: Rate limit exceeded
```

### Issue: YouTube Upload Fails

```bash
# Test OAuth refresh token
node scripts/test-youtube-auth.js

# Common fixes:
# 1. Regenerate refresh token (see Step 2.5)
# 2. Check quota limits (Google Cloud Console)
# 3. Verify OAuth scopes include youtube.upload
```

### Issue: Arabic Script Quality Issues

Edit `src/agents/script-writer.js`:

```javascript
// Adjust GPT-5 temperature for more/less creativity
temperature: 0.7,  // Lower = more focused, Higher = more creative

// Adjust max tokens if scripts are too short/long
max_tokens: 4096
```

---

## 📈 Success Metrics

Track these KPIs weekly:

| Metric | Target | Check |
|--------|--------|-------|
| Upload Success Rate | 95%+ | GitHub Actions logs |
| Average Watch Time | 45+ seconds | YouTube Analytics |
| Script Quality Score | 8+/10 | Manual review |
| API Errors | <5% | Application logs |
| Synthesia Processing Time | <30 minutes | Workflow duration |

---

## 🔄 Maintenance

### Weekly Tasks

- Review uploaded videos for quality
- Check API usage and costs
- Verify persona consistency
- Update market data sources if needed

### Monthly Tasks

- Audit script templates for freshness
- Review urgency scoring accuracy
- Update persona backstories if needed
- Analyze viewer engagement metrics
- Rotate content topics based on performance

### Quarterly Tasks

- Comprehensive quality audit
- Review and update brand guidelines
- Test new Synthesia avatars/voices
- Optimize workflow performance
- Update dependencies (npm packages)

---

## 📞 Support & Resources

**GitHub Repository**: https://github.com/oded-be-z/videos

**Documentation**:
- `README.md` - Project overview
- `docs/PERSONAS.md` - Persona profiles
- `docs/BRAND_GUIDELINES.md` - Seekapa brand book
- `docs/WORKFLOWS.md` - GitHub Actions guide

**API Documentation**:
- Synthesia: https://docs.synthesia.io/
- Azure OpenAI: https://learn.microsoft.com/azure/ai-services/openai/
- Perplexity: https://docs.perplexity.ai/
- YouTube: https://developers.google.com/youtube/v3

---

**Deployment Status**: Ready for production after completing Steps 1-4

Last Updated: October 21, 2025
