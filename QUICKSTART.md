# Seekapa YouTube Automation - Quick Start
**Get Up and Running in 30 Minutes**

---

## ⚡ Express Setup (Production Deploy)

### 1. Install Dependencies (2 minutes)

```bash
cd /home/odedbe/videos
npm install
```

### 2. Configure GitHub Secrets (5 minutes)

```bash
# Make setup script executable
chmod +x scripts/setup-github-secrets.sh

# Run automated setup
./scripts/setup-github-secrets.sh
```

This will set:
- ✅ SYNTHESIA_API_KEY
- ✅ AZURE_OPENAI_KEY
- ✅ AZURE_OPENAI_ENDPOINT
- ✅ PERPLEXITY_API_KEY

### 3. Setup YouTube OAuth (10 minutes)

```bash
# Run interactive YouTube setup
node scripts/get-youtube-token.js

# Follow the prompts to:
# 1. Enter Google Cloud OAuth credentials
# 2. Authorize in browser
# 3. Copy the generated tokens

# Then add to GitHub secrets:
gh secret set YOUTUBE_CLIENT_ID --body "your_client_id"
gh secret set YOUTUBE_CLIENT_SECRET --body "your_client_secret"
gh secret set YOUTUBE_REFRESH_TOKEN --body "your_refresh_token"
```

**Don't have OAuth credentials?** See [DEPLOYMENT.md Step 2](DEPLOYMENT.md#-step-2-youtube-api-setup) for Google Cloud Console setup.

### 4. Select Synthesia Avatars (5 minutes)

1. Login: https://app.synthesia.io/
2. Browse avatars: https://app.synthesia.io/avatars
3. Filter: Middle East, 40-50 years, Professional
4. Note the avatar IDs for:
   - **Fatima** (Female, professional)
   - **Ahmed** (Male, authoritative)

5. Update configuration:
```bash
nano src/config/personas.json
# Update avatarId and voiceId fields
```

### 5. Validate Setup (2 minutes)

```bash
# Run comprehensive validation
node scripts/validate-setup.js

# Expected output:
# ✅ All validation checks passed!
# ✅ System is ready for production deployment
```

### 6. Test Locally (5 minutes)

```bash
# Create .env for local testing
cp .env.example .env
nano .env  # Add your API keys

# Run test pipeline
npm start

# Expected: Complete 8-step pipeline with video URL
```

### 7. Deploy to Production (1 minute)

```bash
# Push to GitHub
git push origin main

# Trigger first production run
gh workflow run daily-video.yml

# Monitor execution
gh run watch
```

**That's it!** 🎉 Daily automation starts tomorrow at 6:00 AM UTC (9:00 AM UAE).

---

## 🚨 Troubleshooting

### Issue: npm install fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: GitHub secrets setup fails

```bash
# Check authentication
gh auth status

# If not authenticated:
gh auth login

# Verify repository access
gh repo view oded-be-z/videos
```

### Issue: YouTube OAuth fails

**Common causes:**
- OAuth consent screen not configured
- Wrong redirect URI (must be `http://localhost:3000/oauth2callback`)
- Missing YouTube Data API v3 enablement

**Fix:** Follow detailed setup in [DEPLOYMENT.md Step 2](DEPLOYMENT.md#-step-2-youtube-api-setup)

### Issue: Validation fails

```bash
# See what's missing
node scripts/validate-setup.js

# Install missing dependencies
sudo apt install ffmpeg gh

# Reinstall node modules
npm install
```

---

## 📁 Configuration Files

### Personas (`src/config/personas.json`)

Update after selecting Synthesia avatars:

```json
{
  "Fatima_Al-Rashid": {
    "avatarId": "your-female-avatar-id-here",
    "voiceId": "ar-SA-ZariyahNeural"
  },
  "Ahmed_Al-Mansouri": {
    "avatarId": "your-male-avatar-id-here",
    "voiceId": "ar-AE-HamdanNeural"
  }
}
```

### Brand Compliance (`src/config/brand-compliance.json`)

Already configured with Seekapa brand guidelines. No changes needed unless brand book updates.

### Weekly Schedule (`src/config/weekly-schedule.json`)

Default schedule configured:
- Sunday: Ahmed - Market Outlook
- Monday: Fatima - Trading Psychology
- Tuesday: Ahmed - Technical Analysis
- Wednesday: Fatima - Risk Management
- Thursday: Ahmed - Trading Strategy
- Friday: Both - Weekly Forecast
- Saturday: Ahmed - Market Recap

Edit to customize topics and assignments.

---

## 🎬 Manual Video Production

Test individual components:

```bash
# Research only (Perplexity + market data)
npm run test:research

# Script generation (Arabic GCC)
npm run test:script

# Video production (Synthesia)
npm run test:video

# YouTube upload
npm run test:upload

# Complete pipeline
npm start
```

---

## 📊 Monitoring Production

### Daily Checks

```bash
# Check today's workflow
gh run list --workflow=daily-video.yml --limit 1

# View execution logs
gh run view --log

# Watch in real-time
gh run watch
```

### YouTube Channel

Visit: https://www.youtube.com/channel/YOUR_CHANNEL_ID/videos

Verify:
- ✅ Video uploaded successfully
- ✅ Title in Arabic with Seekapa branding
- ✅ Description includes risk disclaimer
- ✅ Seekapa logo visible (bottom-right)
- ✅ Audio quality clear

### API Usage

**Synthesia**: https://app.synthesia.io/usage
- Monitor credit consumption
- Alert at 80% of monthly quota

**Azure OpenAI**: https://portal.azure.com/ → brn-azai → Metrics
- Monitor token usage (TPM/RPM)
- Watch for rate limit errors

**Perplexity**: https://www.perplexity.ai/settings/api
- Check request count
- Monitor credit balance

---

## 🔄 Manual Workflow Triggers

### Breaking News Override

```bash
# Trigger manual workflow with custom topic
gh workflow run manual-override.yml \
  -f topic="Fed announces emergency rate cut" \
  -f urgency="9"
```

### Test Workflow

```bash
# Run test pipeline without YouTube upload
gh workflow run test-pipeline.yml
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview and architecture |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Comprehensive deployment guide |
| **QUICKSTART.md** (this file) | Express setup instructions |
| [docs/PERSONAS.md](docs/PERSONAS.md) | Fatima & Ahmed profiles |
| [docs/BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md) | Seekapa brand compliance |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md) | GitHub Actions workflows |

---

## ⏱️ Timeline Summary

| Task | Time |
|------|------|
| Install dependencies | 2 min |
| GitHub secrets setup | 5 min |
| YouTube OAuth setup | 10 min |
| Avatar selection | 5 min |
| Validation | 2 min |
| Local testing | 5 min |
| Production deploy | 1 min |
| **TOTAL** | **30 min** |

---

## 🎯 Success Checklist

After completing quick start, you should have:

- ✅ All npm dependencies installed
- ✅ GitHub secrets configured (7 total)
- ✅ YouTube OAuth working
- ✅ Synthesia avatars selected
- ✅ Local test pipeline successful
- ✅ Production deployment active
- ✅ First video scheduled for tomorrow 6 AM UTC

---

## 💡 Tips

**Local Development:**
- Always test changes with `npm start` before pushing
- Use `.env` file for local testing (never commit)
- Check logs in `logs/` directory after each run

**Production:**
- Monitor first 3 days closely for issues
- Review video quality daily
- Check API usage weekly to avoid overages
- Update personas monthly based on engagement

**Optimization:**
- Adjust urgency threshold in `src/utils/urgency-scorer.js`
- Customize script templates in `src/templates/`
- Fine-tune GPT-5 temperature for script creativity
- Update weekly schedule based on performance

---

**Status**: Ready for production deployment

Last Updated: October 21, 2025
