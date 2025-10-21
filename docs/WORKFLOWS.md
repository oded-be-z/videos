# GitHub Actions Workflows Documentation

## Overview

This repository contains three main GitHub Actions workflows for automated daily video production:

1. **Daily Video Production** - Automated daily content at 6 AM UTC
2. **Manual Override** - Emergency breaking news trigger
3. **Test Pipeline** - Testing without publishing

---

## 1. Daily Video Production (`daily-video.yml`)

### Trigger Schedule

```yaml
Cron: 0 6 * * *  # 6:00 AM UTC = 9:00 AM UAE
```

### Workflow Steps

1. **Environment Setup**
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Install FFmpeg

2. **Content Decision**
   - Run market research (Perplexity API)
   - Detect breaking news (GPT-5)
   - Hybrid logic decision (schedule vs breaking news)
   - Persona selection (Fatima/Ahmed/Both)

3. **Script Generation**
   - Generate Arabic script (GPT-5 Pro)
   - Quality review and validation

4. **Video Production**
   - Create video via Synthesia API
   - Add Seekapa brand overlay (FFmpeg)

5. **Publishing**
   - Upload to YouTube
   - Save artifacts (30-day retention)
   - Create issue on failure

### Manual Trigger Options

```bash
# Manual trigger with options
Inputs:
  - override_topic: Force specific topic
  - persona: fatima | ahmed | both | auto
  - skip_upload: Test without publishing
```

### Environment Variables Required

```bash
PERPLEXITY_API_KEY          # Research
AZURE_OPENAI_KEY            # Script generation
AZURE_OPENAI_ENDPOINT       # Azure endpoint
GPT5_PRO_DEPLOYMENT         # Model deployment
SYNTHESIA_API_KEY           # Video production
YOUTUBE_CLIENT_ID           # Upload
YOUTUBE_CLIENT_SECRET       # Upload
YOUTUBE_REFRESH_TOKEN       # Upload
```

---

## 2. Manual Override (`manual-override.yml`)

### Purpose

Immediate breaking news video production that overrides the daily schedule.

### When to Use

- Market crash (urgency 9-10)
- Major central bank announcement (urgency 8)
- Geopolitical crisis affecting markets (urgency 8)
- Regulatory changes (urgency 7)

### Trigger

```bash
# Manual workflow dispatch only
Inputs:
  - topic: Breaking news description (REQUIRED)
  - urgency: 5-10 urgency level (REQUIRED)
  - persona: fatima | ahmed | both (REQUIRED)
  - publish_immediately: true/false
  - notify_team: true/false
```

### Workflow Steps

1. **Fast Research** (5 min timeout)
   - Focused breaking news research
   - Real-time data gathering

2. **Express Script** (8 min timeout)
   - Urgent script generation
   - Abbreviated review process

3. **Priority Production**
   - Video creation with breaking news template
   - Special overlay: "BREAKING NEWS" badge

4. **Immediate Publishing** (if enabled)
   - Upload to YouTube
   - Add "URGENT" tag

5. **Team Notification**
   - Create GitHub issue with URGENT label
   - Assign to triggering user
   - TODO: Add Slack/Discord integration

### Example Usage

```yaml
Topic: "Federal Reserve Emergency Rate Cut - 0.75%"
Urgency: 10
Persona: both
Publish: true
Notify: true
```

---

## 3. Test Pipeline (`test-pipeline.yml`)

### Purpose

Test video production pipeline without publishing to YouTube.

### Trigger Scenarios

```yaml
Test Scenarios:
  - full-pipeline      # Complete end-to-end test
  - research-only      # Test research module only
  - script-generation  # Test script generation
  - video-production   # Test Synthesia integration
  - overlay-effects    # Test FFmpeg overlays
```

### Features

- **Test Mode Flag**: All modules run in test mode
- **Dry Run**: YouTube upload simulated only
- **7-Day Artifacts**: Test outputs retained for review
- **Code Quality Checks**: Parallel linting and security audit
- **PR Trigger**: Automatically runs on pull requests

### Manual Test Run

```bash
# Trigger test pipeline
Inputs:
  - test_scenario: Choose scenario
  - persona: Test with specific persona
  - topic: Optional test topic
```

### Code Quality Checks

Runs in parallel:
- ESLint/Prettier formatting
- npm security audit
- Secret scanning
- YAML validation

---

## Hybrid Content Logic

### Decision Tree

```
START
  |
  ├─ Manual Override? → YES → Use Override Topic
  |                    ↓ NO
  |
  ├─ Breaking News Urgency ≥8? → YES → Override Schedule
  |                              ↓ NO
  |
  ├─ Saturday + Urgency ≥5? → YES → Breaking News (lower threshold)
  |                          ↓ NO
  |
  └─ Use Weekly Schedule
```

### Weekly Schedule

| Day       | Topic              | Persona | Priority |
|-----------|-------------------|---------|----------|
| Sunday    | Trading Psychology | Fatima  | Medium   |
| Monday    | Market Analysis    | Ahmed   | High     |
| Tuesday   | Forex Basics       | Fatima  | Medium   |
| Wednesday | Technical Analysis | Ahmed   | High     |
| Thursday  | Risk Management    | Fatima  | Medium   |
| Friday    | Weekly Outlook     | Both    | Critical |
| Saturday  | Market Recap       | Ahmed   | Low      |

### Breaking News Urgency Scale

```
10 = Market crash, black swan event
9  = Major central bank emergency action
8  = Geopolitical crisis affecting markets
7  = Significant regulatory change
6  = Large currency devaluation
5  = Notable economic data surprise
<5 = Not urgent enough to override
```

---

## Persona Selection Logic

### Fatima Al-Mansouri

**Strengths**: Psychology, risk management, education, beginner-friendly

**Topics**:
- Trading psychology
- Risk management
- Forex basics
- Beginner guides
- Emotional trading

**Tone**: Warm, supportive, educational

### Ahmed Al-Rashid

**Strengths**: Technical analysis, market analysis, advanced strategies

**Topics**:
- Market analysis
- Technical analysis
- Chart patterns
- Market recap
- Trend analysis

**Tone**: Analytical, professional, confident

### Both (Dialogue Format)

**Used For**:
- Friday weekly outlook
- Breaking news (urgency ≥9)
- Major events
- Year-end outlook

**Format**:
- Fatima: Introduction + educational context
- Ahmed: Technical analysis + data
- Both: Discussion/debate format
- Ahmed: Conclusion + CTA

---

## Error Handling

### Retry Logic

Each step retries 3 times on failure:
```javascript
retry({
  max: 3,
  backoff: 'exponential',
  timeout: 'step-specific'
})
```

### Failure Actions

1. **Save State**: Artifacts saved even on failure
2. **Create Issue**: Auto-assign to workflow owner
3. **Fallback**: Use previous day's template if available

### Timeout Configuration

```yaml
Overall workflow: 60 minutes
Individual steps:
  - Research: 5 min
  - Event detection: 3 min
  - Script generation: 10 min
  - Script review: 5 min
  - Video production: 20 min
  - Brand overlay: 5 min
  - YouTube upload: 10 min
```

---

## Artifact Management

### Daily Production

```
Retention: 30 days
Contents:
  - Final video (MP4)
  - Script JSON
  - Decision state
  - Logs
```

### Breaking News

```
Retention: 90 days (longer for audit)
Contents:
  - Breaking news video
  - Research data
  - Urgency metadata
  - Full logs
```

### Test Runs

```
Retention: 7 days
Contents:
  - Test videos
  - Validation results
  - Error logs
```

---

## Monitoring & Notifications

### Success

```
✅ Video published successfully!
Run: #123
Timestamp: 2025-10-21 09:00 UTC
Topic: Market Analysis
Persona: Ahmed
```

### Failure

```
❌ Pipeline failed
GitHub Issue Created: #456
Assignee: @workflow-owner
Labels: automation, video-production, bug
```

### Future Integrations

- [ ] Slack webhook notification
- [ ] Discord bot alerts
- [ ] Email summary (SES)
- [ ] Grafana dashboard
- [ ] Datadog metrics

---

## Secrets Configuration

### GitHub Secrets Required

```bash
# Research
PERPLEXITY_API_KEY

# AI/Script Generation
AZURE_OPENAI_KEY
AZURE_OPENAI_ENDPOINT
GPT5_PRO_DEPLOYMENT

# Video Production
SYNTHESIA_API_KEY

# Publishing
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
YOUTUBE_REFRESH_TOKEN
```

### Adding Secrets

```bash
# Via GitHub UI
Settings → Secrets and variables → Actions → New repository secret

# Via GitHub CLI
gh secret set PERPLEXITY_API_KEY
gh secret set AZURE_OPENAI_KEY
gh secret set SYNTHESIA_API_KEY
```

---

## Local Testing

### Test Hybrid Logic

```bash
cd /home/odedbe/videos-workflow-agent
node src/scheduler/hybrid-logic.js --test
```

### Test Persona Selector

```bash
export PERSONA_OVERRIDE=fatima
node src/scheduler/persona-selector.js --test
```

### Test Full Pipeline (Dry Run)

```bash
# Set test mode
export TEST_MODE=true

# Run individual steps
node src/pipeline/1-research.js --test
node src/pipeline/4-script-generation.js --test
node src/pipeline/6-video-production.js --test
```

---

## Maintenance

### Weekly Schedule Updates

Edit: `src/scheduler/weekly-calendar.js`

```javascript
WEEKLY_SCHEDULE[1] = {
  topic: 'new_topic',
  persona: 'ahmed',
  priority: 'high'
};
```

### Persona Configuration

Edit: `src/scheduler/persona-selector.js`

```javascript
PERSONA_PROFILES.fatima.avatar_id = 'new_avatar_id';
```

### Workflow Adjustments

Edit: `.github/workflows/daily-video.yml`

```yaml
# Change schedule
schedule:
  - cron: '0 8 * * *'  # 8 AM instead of 6 AM
```

---

## Troubleshooting

### Common Issues

**Issue**: Workflow not triggering at scheduled time

```bash
Solution:
- Check GitHub Actions status
- Verify cron syntax
- Check repository activity (inactive repos may delay)
```

**Issue**: Synthesia video timeout

```bash
Solution:
- Increase timeout in workflow
- Check Synthesia API status
- Verify avatar availability
```

**Issue**: YouTube upload fails

```bash
Solution:
- Refresh OAuth token
- Check video file size (<128 GB)
- Verify quota limits
```

---

## Performance Optimization

### Current Timings

```
Average successful run: 35-40 minutes
  Research: 3 min
  Script: 8 min
  Video: 15-20 min
  Upload: 5 min
  Overhead: 4 min
```

### Future Optimizations

- [ ] Parallel script generation for both personas
- [ ] Cache dependencies (already enabled)
- [ ] Pre-warm Synthesia API
- [ ] Compress artifacts before upload

---

## Support

**Issues**: Create GitHub issue with label `video-automation`

**Contact**: Check repository CODEOWNERS

**Documentation**: This file + inline code comments
