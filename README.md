# Arabic GCC Script Generator for Trading Videos

**AI-powered script writer for 60-second trading videos in Khaleeji (GCC) Arabic dialect**

Built for **Seekapa** and **Axia** forex trading platforms to create compliant, educational, and engaging video content for GCC markets.

---

## Features

### 7 Weekly Templates
- **Monday**: Weekend Market Recap (3-day review)
- **Tuesday**: Trading Education (how-to, strategies)
- **Wednesday**: Market Terms Explained (technical analysis, leverage, etc.)
- **Thursday**: Crypto & Commodities Update
- **Friday**: Weekly Outlook (predictions)
- **Saturday**: Community Q&A
- **Sunday**: Trading Psychology

### Dual Avatar Support
- **Fatima**: Warm, educational, risk-focused female trader
- **Ahmed**: Analytical, strategic, opportunity-focused male analyst
- **Dialogue Mode**: Both personas together in conversational format

### Intelligent Validation
- **GCC Dialect Checker**: Ensures Khaleeji Arabic (not MSA)
- **Word Counter**: Targets 180-220 words (60 seconds spoken)
- **Compliance Checker**: Verifies mandatory risk disclosures
- **Quality Scoring**: 0-100 rating with automatic retry

### Azure OpenAI Integration
- **GPT-5** deployment for high-quality Arabic generation
- Configurable temperature, top_p, and frequency penalty
- Automatic retry logic for optimal results

---

## Installation

```bash
cd /home/odedbe/videos-script-agent
npm install
```

---

## Configuration

Environment variables in `.env`:

```env
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://brn-azai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5
AZURE_OPENAI_API_VERSION=2025-01-01-preview

DEFAULT_PERSONA=Fatima
TARGET_WORD_COUNT_MIN=180
TARGET_WORD_COUNT_MAX=220
TARGET_DURATION_SECONDS=60
```

**Note**: Copy the actual Azure OpenAI API key from the `.env` file (already configured).

---

## Usage

### Generate Single Script

```javascript
import { ScriptWriter } from './src/agents/script-writer.js';

const writer = new ScriptWriter();

const script = await writer.generateScript({
  day: 'monday',
  persona: 'Fatima',
  brand: 'Seekapa',
  topic: 'تحليل الأسواق بعد نهاية الأسبوع',
  keyPoints: [
    'الدولار ارتفع 0.5%',
    'الذهب عند 1850',
    'النفط انخفض إلى 75'
  ],
  newsEvent: 'بيانات التوظيف الأمريكية',
  insight: 'توقعات بقوة الدولار'
});

console.log(script.script_ar);
```

### Generate Weekly Batch (7 Scripts)

```javascript
const scripts = await writer.generateWeeklyBatch({
  persona: 'Fatima',
  brand: 'Seekapa'
});

scripts.forEach(script => {
  console.log(`${script.dayOfWeek}: ${script.word_count} words, ${script.score}/100`);
});
```

### Run from CLI

```bash
npm start
# or
node src/agents/script-writer.js
```

---

## Testing

```bash
npm test
# or
node tests/test-script-generation.js
```

**Test Coverage:**
1. Word counter validation
2. GCC dialect detection
3. Compliance checking
4. Live script generation with Azure OpenAI
5. Quality scoring

---

## Script Output Format

```json
{
  "script_ar": "أهلين يا شباب، عساكم طيبين! اليوم بنتكلم عن...",
  "persona": "Fatima",
  "template": "market-update",
  "dayOfWeek": "monday",
  "duration_seconds": 60,
  "word_count": 195,
  "compliance_verified": true,
  "score": 87,
  "validation": {
    "wordCount": { "isValid": true, "wordCount": 195 },
    "arabic": { "dialect": { "score": 65, "gccMatches": 4 } },
    "compliance": { "isCompliant": true }
  }
}
```

---

## Templates

### Market Update (Monday/Thursday/Friday)

**Structure:** Hook (0-8s) → Data (8-25s) → Analysis (25-45s) → Insight (45-55s) → CTA (55-60s)

**Example:**
```
أهلين يا شباب! شفتوا شلون تحرك السوق نهاية الأسبوع؟
[Data: الدولار ارتفع 0.5%، الذهب عند 1850...]
[Analysis: السبب هو بيانات التوظيف القوية...]
[Insight: الحين الفرصة في مراقبة اليورو دولار...]
[CTA: التداول يحمل مخاطر. ابدأوا بالحساب التجريبي...]
```

### Education (Tuesday/Saturday/Sunday)

**Structure:** Introduction (0-10s) → Steps (10-40s) → Tips (40-50s) → Conclusion (50-60s)

**Example:**
```
يا شباب، اليوم بنتعلم كيف نستخدم وقف الخسارة...
[Step 1: حدد مستوى الدخول...]
[Step 2: احسب نسبة المخاطرة...]
[Step 3: ضع الوقف عند مستوى منطقي...]
[Tip: خطأ شائع هو وضع الوقف قريب جداً...]
```

### Terms (Wednesday)

**Structure:** Question (0-8s) → Definition (8-20s) → How It Works (20-40s) → Pros/Cons (40-52s) → Conclusion (52-60s)

**Example:**
```
كثير يسألون، شنو يعني "الرافعة المالية"؟
[Definition: ببساطة، استخدام أموال مقترضة...]
[How: مثلاً، برافعة 1:100، كل دولار يساوي 100...]
[Pros/Cons: الفائدة تكبير الأرباح، لكن المخاطر أيضاً...]
```

---

## Validation Rules

### GCC Dialect (40 points)
- Must include Khaleeji words: يا شباب، أهلين، عساكم، الحين، شلون، وايد، زين
- Avoid MSA markers: أيها، كيف حالكم، ينبغي
- Natural conversational tone

### Word Count (30 points)
- Target: 180-220 words
- Average speaking rate: 3 words/second
- Must fit 60 seconds when spoken

### Compliance (30 points)
- **Mandatory**: Risk warning "التداول يحمل مخاطر. قد تخسر رأس مالك"
- **Prohibited**: Guaranteed returns, "ربح مضمون", "بدون مخاطر"
- **Balance**: Educational content ≥ promotional content

---

## Personas

### Fatima (فاطمة)
- **Role**: Educator, risk manager
- **Tone**: Warm, encouraging, patient
- **Focus**: Simplifying concepts, beginner-friendly
- **Use for**: Education, Q&A, psychology topics

### Ahmed (أحمد)
- **Role**: Analyst, strategist
- **Tone**: Analytical, professional, strategic
- **Focus**: Technical analysis, market insights
- **Use for**: Market updates, terms, advanced strategies

---

## Compliance & Risk Disclosure

All scripts MUST include risk warnings. The compliance checker automatically validates:

- ✅ Risk warning present
- ✅ No guaranteed return promises
- ✅ Balanced educational/promotional content
- ✅ Appropriate CTA (demo account, learning resources)

**Mandatory Phrase (Arabic):**
```
التداول يحمل مخاطر. قد تخسر رأس مالك.
```

---

## Project Structure

```
videos-script-agent/
├── src/
│   ├── agents/
│   │   └── script-writer.js        # Main script generator
│   ├── templates/
│   │   ├── market-update.js        # Monday/Thursday/Friday
│   │   ├── education.js            # Tuesday/Saturday/Sunday
│   │   ├── terms.js                # Wednesday
│   │   └── dual-avatar.js          # Dialogue format
│   ├── utils/
│   │   ├── arabic-validator.js     # GCC dialect checker
│   │   ├── compliance-checker.js   # Risk disclosure validator
│   │   └── word-counter.js         # Word count & duration
│   └── config/
│       └── disclaimers.json        # Risk warnings & CTAs
├── tests/
│   └── test-script-generation.js   # Comprehensive tests
├── .env                            # Azure OpenAI credentials
├── package.json
└── README.md
```

---

## Integration with Video Pipeline

This script generator is **Agent 3** in the complete video production pipeline:

1. **Agent 1**: News Aggregator → Collects market data
2. **Agent 2**: Content Planner → Schedules topics
3. **Agent 3**: **Script Writer** (THIS) → Generates Arabic scripts
4. **Agent 4**: Text-to-Speech → Synthesia/ElevenLabs
5. **Agent 5**: Video Assembly → Combines audio + visuals
6. **Agent 6**: Publishing → YouTube/LinkedIn/Instagram

---

## Examples

### Example 1: Monday Market Update

```javascript
const mondayScript = await writer.generateScript({
  day: 'monday',
  persona: 'Fatima',
  keyPoints: [
    'الدولار ارتفع 0.5% مقابل اليورو',
    'الذهب استقر عند 1850 دولار',
    'النفط انخفض إلى 75 دولار'
  ],
  newsEvent: 'بيانات التوظيف الأمريكية القوية'
});
```

### Example 2: Wednesday Terms Explanation

```javascript
const wednesdayScript = await writer.generateScript({
  day: 'wednesday',
  persona: 'Ahmed',
  term: 'الرافعة المالية',
  termEnglish: 'Leverage',
  simpleDefinition: 'استخدام أموال مقترضة لزيادة قوة التداول'
});
```

### Example 3: Dual Avatar Dialogue

```javascript
const dialogueScript = await writer.generateScript({
  day: 'dual',
  topic: 'تحليل الذهب هذا الأسبوع',
  fatimaFocus: 'كيف يتداول المبتدئ الذهب بأمان',
  ahmedFocus: 'التحليل الفني لحركة الذهب'
});
```

---

## License

Proprietary - Seekapa/Axia Internal Use Only

---

## Support

For issues or questions:
- Check `/tests/test-script-generation.js` for examples
- Review template files in `/src/templates/`
- Validate Azure OpenAI credentials in `.env`

---

**Built with Azure OpenAI GPT-5 for GCC Markets** 🇸🇦 🇦🇪 🇰🇼 🇶🇦 🇧🇭 🇴🇲