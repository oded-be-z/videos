# Seekapa Video Workflow Automation

**Agent 6: GitHub Actions Workflow Engineer**

Automated daily video production system for Seekapa forex education content.

## Overview

This repository contains GitHub Actions workflows that automatically produce, review, and publish daily forex education videos featuring AI avatars Fatima Al-Mansouri and Ahmed Al-Rashid.

### Key Features

- **Daily Automation**: Runs at 6 AM UTC (9 AM UAE) every day
- **Hybrid Content Logic**: Balances scheduled content with breaking news
- **Dual Personas**: Fatima (educational) and Ahmed (analytical)
- **Quality Control**: Multi-stage script review and validation
- **Error Recovery**: Automatic retries and fallback mechanisms
- **Breaking News Override**: Manual trigger for urgent market events

## Workflows

### 1. Daily Video Production

```yaml
Schedule: 6:00 AM UTC daily
Duration: ~35-40 minutes
Output: 1 video per day
```

**Process**:
1. Market research (Perplexity API)
2. Breaking news detection (GPT-5)
3. Content decision (hybrid logic)
4. Persona selection
5. Arabic script generation (GPT-5 Pro)
6. Script quality review
7. Video production (Synthesia)
8. Brand overlay (FFmpeg)
9. YouTube upload

### 2. Manual Override (Breaking News)

```yaml
Trigger: Manual workflow dispatch
Duration: ~25-30 minutes (expedited)
Output: Urgent breaking news video
```

**Use Cases**:
- Market crashes
- Central bank emergencies
- Geopolitical crises
- Major regulatory changes

### 3. Test Pipeline

```yaml
Trigger: Manual or PR
Duration: Variable
Output: Test artifacts (no publishing)
```

**Scenarios**:
- Full pipeline test
- Research module only
- Script generation
- Video production
- Overlay effects

## Weekly Schedule

| Day       | Topic              | Persona | Priority |
|-----------|-------------------|---------|----------|
| Sunday    | Trading Psychology | Fatima  | Medium   |
| Monday    | Market Analysis    | Ahmed   | High     |
| Tuesday   | Forex Basics       | Fatima  | Medium   |
| Wednesday | Technical Analysis | Ahmed   | High     |
| Thursday  | Risk Management    | Fatima  | Medium   |
| Friday    | Weekly Outlook     | Both    | Critical |
| Saturday  | Market Recap       | Ahmed   | Low      |

## Directory Structure

```
.github/workflows/
  ├── daily-video.yml          # Main daily automation
  ├── manual-override.yml      # Breaking news trigger
  └── test-pipeline.yml        # Testing workflow

src/scheduler/
  ├── hybrid-logic.js          # Schedule vs breaking news decision
  ├── persona-selector.js      # Choose Fatima/Ahmed/Both
  └── weekly-calendar.js       # Weekly content schedule

docs/
  └── WORKFLOWS.md             # Detailed workflow documentation

output/                        # Generated files (gitignored)
logs/                          # Execution logs (gitignored)
```

## Setup

### Prerequisites

- Node.js 20+
- GitHub repository with Actions enabled
- Required API keys (see below)

### GitHub Secrets

Configure these secrets in repository settings:

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

### Installation

```bash
cd /home/odedbe/videos-workflow-agent
npm install
```

## Usage

### View Weekly Schedule

```bash
npm run show:schedule
```

### Test Hybrid Logic

```bash
npm run test:hybrid
```

### Test Persona Selector

```bash
npm run test:persona
```

### Trigger Manual Override

1. Go to GitHub Actions
2. Select "Manual Override - Breaking News Video"
3. Click "Run workflow"
4. Fill in:
   - Topic: "Federal Reserve Emergency Rate Cut"
   - Urgency: 10
   - Persona: both
   - Publish: true

## Hybrid Content Logic

### Decision Flow

```
1. Manual override? → Use override topic
2. Breaking news urgency ≥8? → Override schedule
3. Saturday + urgency ≥5? → Breaking news (lower threshold)
4. Default → Use weekly schedule
```

### Breaking News Urgency Scale

```
10 = Market crash, black swan
9  = Central bank emergency
8  = Geopolitical crisis
7  = Regulatory change
6  = Currency devaluation
5  = Economic surprise
<5 = Not urgent (ignore)
```

## Persona Selection

### Fatima Al-Mansouri

**Style**: Warm, supportive, educational

**Topics**:
- Trading psychology
- Risk management
- Forex basics
- Beginner education

### Ahmed Al-Rashid

**Style**: Analytical, professional, data-driven

**Topics**:
- Market analysis
- Technical analysis
- Advanced strategies
- Market recap

### Both (Dialogue)

**Format**: Split-screen or alternating

**Used For**:
- Friday weekly outlook
- Breaking news (urgency ≥9)
- Major market events

## Error Handling

### Retry Logic

- Each step retries 3x on failure
- Exponential backoff
- State saved between steps

### Failure Actions

1. Save artifacts (30-day retention)
2. Create GitHub issue
3. Assign to workflow owner
4. Label: `automation`, `bug`

## Monitoring

### Success Output

```
✅ Video published successfully!
Run: #123
Topic: Market Analysis
Persona: Ahmed
URL: youtube.com/watch?v=...
```

### Failure Output

```
❌ Pipeline failed
Step: Script generation
Error: API timeout
Issue: #456 created
```

## Documentation

- **Workflows**: See [docs/WORKFLOWS.md](docs/WORKFLOWS.md)
- **Inline Comments**: All scripts heavily commented
- **Error Messages**: Descriptive logging throughout

## Development

### Adding New Topics

Edit `src/scheduler/weekly-calendar.js`:

```javascript
WEEKLY_SCHEDULE[1] = {
  topic: 'new_topic',
  persona: 'ahmed',
  priority: 'high'
};
```

### Changing Personas

Edit `src/scheduler/persona-selector.js`:

```javascript
PERSONA_PROFILES.fatima.avatar_id = 'new_avatar';
```

### Modifying Schedule

Edit `.github/workflows/daily-video.yml`:

```yaml
schedule:
  - cron: '0 8 * * *'  # Change time
```

## Troubleshooting

### Workflow Not Triggering

- Check GitHub Actions status
- Verify cron syntax
- Ensure repository is active

### Video Timeout

- Increase timeout in workflow
- Check Synthesia API status
- Verify avatar availability

### Upload Fails

- Refresh YouTube OAuth token
- Check video size (<128 GB)
- Verify quota limits

## Support

- **Issues**: Create GitHub issue with `video-automation` label
- **Documentation**: [docs/WORKFLOWS.md](docs/WORKFLOWS.md)
- **Code Comments**: Check inline documentation

## License

Private - Seekapa Team Only

---

**Built by Agent 6: GitHub Actions Workflow Engineer**

**Mission**: Automate daily forex education video production with zero manual intervention.