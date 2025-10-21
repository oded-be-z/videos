/**
 * Market Terms Template (Wednesday - Terminology Explained)
 * Focus: Technical analysis terms, leverage, margin, etc.
 */

export class TermsTemplate {
  static metadata = {
    name: 'terms',
    dayOfWeek: 'Wednesday',
    duration: 60,
    targetWords: { min: 180, max: 220 },
    persona: 'Ahmed' // Analytical persona
  };

  static getSystemPrompt(options = {}) {
    const { persona = 'Ahmed', term = 'الرافعة المالية', brand = 'Seekapa' } = options;

    return `أنت مدرب تداول متخصص في شرح المصطلحات التقنية باللهجة الخليجية البسيطة.

الشخصية: ${persona} - خبير تحليل خليجي
الأسلوب: تحليلي، واضح، يبسط المعقد

قالب النص (يوم الأربعاء - شرح المصطلحات):

**البنية:**
1. المقدمة والسؤال (0-8 ثواني):
   - "أهلين يا شباب، كثير يسألون..."
   - اطرح السؤال: "شنو يعني [المصطلح]؟"
   - لماذا المتداولون بحاجة لفهم هذا

2. التعريف البسيط (8-20 ثواني):
   - تعريف المصطلح بلغة بسيطة
   - تشبيه من الحياة اليومية
   - "يعني ببساطة..."

3. كيف يعمل (20-40 ثواني):
   - شرح الآلية
   - مثال رقمي واضح
   - متى يستخدمه المتداول

4. المزايا والمخاطر (40-52 ثواني):
   - الفائدة الرئيسية
   - الخطر الأساسي
   - تحذير مهم

5. الخاتمة (52-60 ثواني):
   - "الحين فهمتوا [المصطلح]؟"
   - تحذير المخاطر
   - دعوة للتعلم المزيد

**المتطلبات:**
- 180-220 كلمة (60 ثانية)
- شرح المصطلح التقني بلغة الشارع الخليجي
- مثال رقمي واحد على الأقل
- توازن بين المزايا والمخاطر
- تحذير واضح من سوء الاستخدام

**أمثلة لمصطلحات:**
- الرافعة المالية (Leverage)
- الهامش (Margin)
- وقف الخسارة (Stop Loss)
- جني الأرباح (Take Profit)
- التحليل الفني (Technical Analysis)
- الشموع اليابانية (Candlesticks)
- المؤشرات (Indicators)

**العلامة التجارية:** ${brand}`;
  }

  static getUserPrompt(termData = {}) {
    const {
      term = 'الرافعة المالية',
      termEnglish = 'Leverage',
      simpleDefinition = 'استخدام أموال مقترضة لزيادة قوة التداول',
      analogy = 'مثل شراء سيارة بدفعة أولى صغيرة',
      example = 'برافعة 1:100، كل دولار يساوي 100 دولار قوة شرائية',
      benefit = 'تكبير الأرباح من رأس مال صغير',
      risk = 'تكبير الخسائر أيضاً - قد تخسر أكثر من رأس مالك'
    } = termData;

    return `اكتب نص شرح مصطلح تداول مدته 60 ثانية (180-220 كلمة) باللهجة الخليجية:

**المصطلح:** ${term} (${termEnglish})

**التعريف البسيط:** ${simpleDefinition}

**التشبيه:** ${analogy}

**مثال رقمي:** ${example}

**الفائدة:** ${benefit}

**الخطر:** ${risk}

**أسلوب الشرح:**
- ابدأ بسؤال شائع من المتداولين
- اشرح المصطلح وكأنك تشرح لصديقك في المقهى
- استخدم تشبيه من الحياة اليومية
- أعط مثال بأرقام واضحة
- وازن بين الفائدة والخطر
- أنهي بتحذير واضح من المخاطر

**لهجة:** خليجية طبيعية (الحين، شلون، وايد، يعني)`;
  }

  static generateStructure(options = {}) {
    return {
      template: 'terms',
      dayOfWeek: 'Wednesday',
      persona: options.persona || 'Ahmed',
      sections: [
        {
          name: 'question',
          timeRange: '0-8s',
          wordCount: 24,
          requirements: [
            'Start with common question',
            'State the term clearly',
            'Why traders ask about it'
          ]
        },
        {
          name: 'definition',
          timeRange: '8-20s',
          wordCount: 36,
          requirements: [
            'Simple definition',
            'Real-life analogy',
            'Avoid technical jargon'
          ]
        },
        {
          name: 'how-it-works',
          timeRange: '20-40s',
          wordCount: 60,
          requirements: [
            'Explain mechanism',
            'Numerical example',
            'When traders use it'
          ]
        },
        {
          name: 'pros-cons',
          timeRange: '40-52s',
          wordCount: 36,
          requirements: [
            'Main benefit',
            'Primary risk',
            'Important warning'
          ]
        },
        {
          name: 'conclusion',
          timeRange: '52-60s',
          wordCount: 24,
          requirements: [
            'Recap question',
            'Risk warning',
            'Learn more CTA'
          ]
        }
      ],
      totalTargetWords: 180,
      estimatedDuration: 60
    };
  }
}

export default TermsTemplate;
