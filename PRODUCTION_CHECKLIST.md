# Seekapa YouTube Automation - Production Deployment Checklist
**Complete this checklist before enabling production automation**

---

## ✅ Pre-Deployment Checklist

### 🔧 System Requirements

- [ ] Node.js 20+ installed
  ```bash
  node --version  # Should be v20.x.x or higher
  ```

- [ ] FFmpeg installed
  ```bash
  ffmpeg -version  # Should show version info
  ```

- [ ] GitHub CLI installed and authenticated
  ```bash
  gh auth status  # Should show "Logged in to github.com"
  ```

- [ ] Git repository connected
  ```bash
  git remote -v  # Should show https://github.com/oded-be-z/videos
  ```

---

### 📦 Dependencies

- [ ] NPM packages installed
  ```bash
  cd /home/odedbe/videos
  npm install
  ls node_modules  # Should show installed packages
  ```

- [ ] Required packages verified
  ```bash
  npm list axios
  npm list @azure/openai
  npm list googleapis
  npm list fluent-ffmpeg
  ```

---

### 🔐 GitHub Secrets Configuration

Run validation:
```bash
gh secret list
```

Required secrets (7 total):

- [ ] `SYNTHESIA_API_KEY`
  - Value: Get from ~/.claude/CLAUDE.md
  - Test: https://app.synthesia.io/

- [ ] `AZURE_OPENAI_KEY`
  - Value: Get from ~/.claude/CLAUDE.md
  - Test: Azure Portal → brn-azai

- [ ] `AZURE_OPENAI_ENDPOINT`
  - Value: `https://brn-azai.openai.azure.com/`

- [ ] `PERPLEXITY_API_KEY`
  - Value: Get from ~/.claude/CLAUDE.md
  - Test: https://www.perplexity.ai/settings/api

- [ ] `YOUTUBE_CLIENT_ID`
  - Value: From Google Cloud Console
  - Generate: `node scripts/get-youtube-token.js`

- [ ] `YOUTUBE_CLIENT_SECRET`
  - Value: From Google Cloud Console
  - Generate: `node scripts/get-youtube-token.js`

- [ ] `YOUTUBE_REFRESH_TOKEN`
  - Value: From OAuth flow
  - Generate: `node scripts/get-youtube-token.js`

**Automated Setup:**
```bash
chmod +x scripts/setup-github-secrets.sh
./scripts/setup-github-secrets.sh
```

---

### 🎥 YouTube API Setup

- [ ] Google Cloud project created
  - URL: https://console.cloud.google.com/
  - Project name: "Seekapa YouTube Automation"

- [ ] YouTube Data API v3 enabled
  - URL: https://console.cloud.google.com/apis/library
  - Status: API should show "Enabled"

- [ ] OAuth 2.0 credentials created
  - Type: Desktop app
  - Name: "Seekapa Video Uploader"
  - Redirect URI: `http://localhost:3000/oauth2callback`

- [ ] OAuth consent screen configured
  - User type: External
  - App name: "Seekapa YouTube Automation"
  - Scopes: `https://www.googleapis.com/auth/youtube.upload`

- [ ] Test user added
  - Your Google account email added to test users

- [ ] Refresh token generated
  ```bash
  node scripts/get-youtube-token.js
  ```
  - Client ID entered
  - Client Secret entered
  - Browser authorization completed
  - Refresh token copied

- [ ] YouTube channel verified
  - Channel ID confirmed
  - Upload permissions tested

---

### 🎭 Synthesia Configuration

- [ ] Account verified
  - Login: https://app.synthesia.io/
  - API key confirmed active

- [ ] Avatar selected for Fatima Al-Rashid
  - Filter: Middle East, Female, 40-50 years
  - Avatar ID noted: `___________________________`
  - Voice selected: Arabic (Saudi) Female

- [ ] Avatar selected for Ahmed Al-Mansouri
  - Filter: Middle East, Male, 40-50 years
  - Avatar ID noted: `___________________________`
  - Voice selected: Arabic (UAE) Male

- [ ] Configuration updated
  ```bash
  nano src/config/personas.json
  # Update avatarId and voiceId for both personas
  ```

- [ ] Credit quota verified
  - Current balance: `___________` credits
  - Monthly limit: `___________` credits
  - Alert threshold set at 80%

---

### 📁 Configuration Files

- [ ] Personas configuration complete
  ```bash
  cat src/config/personas.json | grep avatarId
  # Should show actual avatar IDs, not placeholders
  ```

- [ ] Brand compliance verified
  ```bash
  cat src/config/brand-compliance.json | grep -A5 colors
  # Should show Seekapa brand colors
  ```

- [ ] Weekly schedule confirmed
  ```bash
  cat src/config/weekly-schedule.json | grep -A2 Monday
  # Should show Monday schedule
  ```

- [ ] GitHub workflows present
  ```bash
  ls -la .github/workflows/
  # Should show daily-video.yml, manual-override.yml, test-pipeline.yml
  ```

---

### 🧪 Local Testing

- [ ] Environment file created
  ```bash
  cp .env.example .env
  nano .env  # Add all API keys
  ```

- [ ] Market research tested
  ```bash
  npm run test:research
  # Expected: JSON with forex/crypto/commodities data
  ```

- [ ] Script generation tested
  ```bash
  npm run test:script
  # Expected: Arabic GCC script (180-220 words)
  ```

- [ ] Video production tested
  ```bash
  npm run test:video
  # Expected: Synthesia video ID returned
  ```

- [ ] YouTube upload tested
  ```bash
  npm run test:upload
  # Expected: YouTube video URL
  ```

- [ ] Full pipeline tested
  ```bash
  npm start
  # Expected: Complete 8-step pipeline success
  ```

- [ ] Output verified
  - [ ] Video downloaded and reviewed
  - [ ] Arabic audio clear and correct
  - [ ] Seekapa logo visible (bottom-right, 30% opacity)
  - [ ] Video duration ~60 seconds
  - [ ] Risk disclaimer included in description

---

### ✅ Validation

- [ ] Comprehensive validation passed
  ```bash
  node scripts/validate-setup.js
  # Expected: "All validation checks passed!"
  ```

- [ ] Directory structure verified
  ```bash
  tree -L 2 src/
  # Should show all agents, services, config, utils
  ```

- [ ] Git status clean
  ```bash
  git status
  # Should show "working tree clean"
  ```

- [ ] All branches merged
  ```bash
  git branch -a
  # main should be up to date
  ```

---

## 🚀 Production Deployment

### GitHub Actions Workflow

- [ ] All secrets verified
  ```bash
  gh secret list | wc -l
  # Should show 7 secrets
  ```

- [ ] Workflow syntax validated
  ```bash
  gh workflow view daily-video.yml
  # Should show workflow details without errors
  ```

- [ ] Manual trigger tested
  ```bash
  gh workflow run daily-video.yml
  gh run watch
  # Monitor execution to completion
  ```

- [ ] Workflow logs reviewed
  ```bash
  gh run view --log
  # Check for any warnings or errors
  ```

- [ ] First production run verified
  - [ ] Workflow completed successfully
  - [ ] Video uploaded to YouTube
  - [ ] Quality meets standards
  - [ ] No errors in logs

---

### Production Monitoring Setup

- [ ] GitHub Actions notifications enabled
  - Settings → Notifications → Actions enabled
  - Email delivery configured

- [ ] API monitoring configured
  - [ ] Synthesia usage dashboard bookmarked
  - [ ] Azure OpenAI metrics accessible
  - [ ] Perplexity API dashboard bookmarked
  - [ ] YouTube quota monitoring setup

- [ ] Alert thresholds set
  - [ ] Synthesia: Alert at 80% of credits
  - [ ] Azure OpenAI: Alert at 80% of TPM
  - [ ] Perplexity: Alert at 80% of requests
  - [ ] YouTube: Alert at 80% of quota

- [ ] Monitoring schedule established
  - [ ] Daily: Check workflow execution status
  - [ ] Daily: Verify video uploaded successfully
  - [ ] Weekly: Review API usage and costs
  - [ ] Monthly: Quality audit of generated content

---

## 📊 Post-Deployment Verification

### First Week Checks

**Day 1:**
- [ ] 6:00 AM UTC workflow triggered
- [ ] Video uploaded successfully
- [ ] Quality meets standards
- [ ] No errors in logs
- [ ] API usage within limits

**Day 2-7:**
- [ ] Daily workflow success rate: `_____` %
- [ ] Videos uploaded: `_____` / 7
- [ ] Average processing time: `_____` minutes
- [ ] API errors: `_____` count
- [ ] User reported issues: `_____` count

### Content Quality Metrics

- [ ] Script quality (1-10): `_____`
- [ ] Arabic grammar accuracy: `_____` %
- [ ] Video production quality: `_____` / 10
- [ ] Seekapa branding consistency: `_____` / 10
- [ ] Risk disclaimer presence: 100%

### Performance Metrics

- [ ] Average watch time: `_____` seconds
- [ ] Viewer retention: `_____` %
- [ ] Engagement rate: `_____` %
- [ ] Subscriber growth: `+_____` subscribers
- [ ] Video views: `_____` total

---

## 🔧 Troubleshooting Reference

### Quick Fixes

**Workflow fails:**
```bash
gh run view --log-failed
gh run rerun --failed
```

**API errors:**
```bash
# Test individual APIs
curl -H "Authorization: $SYNTHESIA_API_KEY" https://api.synthesia.io/v2/videos
node scripts/test-youtube-auth.js
```

**Configuration issues:**
```bash
node scripts/validate-setup.js
npm run test:script
```

**Git sync issues:**
```bash
git fetch origin
git reset --hard origin/main
npm install
```

---

## 📝 Sign-Off

Once all items are checked:

**Deployed by:** `_____________________________`
**Date:** `_____________________________`
**First video URL:** `_____________________________`
**Status:** ✅ Production Ready

---

## 📚 Reference Documents

- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [QUICKSTART.md](QUICKSTART.md) - 30-minute setup guide
- [docs/PERSONAS.md](docs/PERSONAS.md) - Persona profiles
- [docs/BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md) - Brand compliance

---

**Checklist Version:** 1.0
**Last Updated:** October 21, 2025
**Repository:** https://github.com/oded-be-z/videos
