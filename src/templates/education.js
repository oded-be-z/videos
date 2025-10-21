/**
 * Education Template (Tuesday - Trading Education)
 * Focus: How-to guides, strategies, step-by-step tutorials
 */

export class EducationTemplate {
  static metadata = {
    name: 'education',
    dayOfWeek: 'Tuesday',
    duration: 60,
    targetWords: { min: 180, max: 220 },
    persona: 'Fatima' // Educational persona
  };

  static getSystemPrompt(options = {}) {
    const { persona = 'Fatima', topic = 'استراتيجية تداول', brand = 'Seekapa' } = options;

    return `أنت معلم تداول محترف متخصص في إنشاء محتوى تعليمي باللهجة الخليجية.

الشخصية: ${persona} - معلمة تداول خليجية
الأسلوب: تعليمي، واضح، خطوة بخطوة، مشجع

قالب النص (يوم الثلاثاء - التعليم):

**البنية:**
1. المقدمة (0-10 ثواني):
   - "يا شباب، اليوم بنتعلم..."
   - اذكر المهارة أو الاستراتيجية
   - لماذا هذا مهم للمتداول

2. الشرح التدريجي (10-40 ثواني):
   - خطوة 1: ابدأ بالأساسيات
   - خطوة 2: الخطوة الثانية
   - خطوة 3: النقطة المتقدمة
   - استخدم أمثلة بسيطة

3. النصائح العملية (40-50 ثواني):
   - نصيحة مهمة واحدة
   - خطأ شائع يجب تجنبه
   - كيف تطبق هذا

4. الخاتمة (50-60 ثواني):
   - ملخص سريع
   - تحذير المخاطر
   - تشجيع على التعلم في الحساب التجريبي

**المتطلبات:**
- 180-220 كلمة (60 ثانية)
- لهجة خليجية طبيعية
- أسلوب المعلم الصبور
- أمثلة واقعية بسيطة
- تجنب المصطلحات المعقدة بدون شرح

**كلمات خليجية مطلوبة:**
- الحين (الآن)
- شلون (كيف)
- وايد (كثير)
- خل/خلنا (دعنا)
- زين (حسناً، جيد)

**العلامة التجارية:** ${brand}`;
  }

  static getUserPrompt(educationalContent = {}) {
    const {
      topic = 'كيف تقرأ الشموع اليابانية',
      steps = [
        'فهم الشمعة الخضراء والحمراء',
        'التعرف على الذيل العلوي والسفلي',
        'قراءة إشارات الانعكاس'
      ],
      commonMistake = 'الاعتماد على الشموع فقط دون مؤشرات أخرى',
      practicalTip = 'ابدأ بالتمرن على الحساب التجريبي'
    } = educationalContent;

    return `اكتب نص تعليمي مدته 60 ثانية (180-220 كلمة) باللهجة الخليجية:

**الموضوع:** ${topic}

**الخطوات التعليمية:**
${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**خطأ شائع:** ${commonMistake}

**نصيحة عملية:** ${practicalTip}

**أسلوب الشرح:**
- ابدأ بترحيب خليجي دافئ
- اشرح كل خطوة ببساطة وبالتدريج
- استخدم تشبيهات من الحياة اليومية
- شجع المتداول المبتدئ
- أنهي بتحذير المخاطر والحساب التجريبي`;
  }

  static generateStructure(options = {}) {
    return {
      template: 'education',
      dayOfWeek: 'Tuesday',
      persona: options.persona || 'Fatima',
      sections: [
        {
          name: 'introduction',
          timeRange: '0-10s',
          wordCount: 30,
          requirements: [
            'Warm Khaleeji greeting',
            'State the skill/strategy',
            'Why it matters'
          ]
        },
        {
          name: 'step-by-step',
          timeRange: '10-40s',
          wordCount: 90,
          requirements: [
            'Break into 3 clear steps',
            'Use simple examples',
            'Avoid jargon or explain it'
          ]
        },
        {
          name: 'tips',
          timeRange: '40-50s',
          wordCount: 30,
          requirements: [
            'One key tip',
            'Common mistake to avoid',
            'How to practice'
          ]
        },
        {
          name: 'conclusion',
          timeRange: '50-60s',
          wordCount: 30,
          requirements: [
            'Quick recap',
            'Risk warning',
            'Encourage demo account practice'
          ]
        }
      ],
      totalTargetWords: 180,
      estimatedDuration: 60
    };
  }
}

export default EducationTemplate;
