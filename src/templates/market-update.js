/**
 * Market Update Template (Monday - Weekend Recap)
 * Structure: Hook (0-8s) -> Data (8-25s) -> Analysis (25-45s) -> Insight (45-55s) -> CTA (55-60s)
 */

export class MarketUpdateTemplate {
  static metadata = {
    name: 'market-update',
    dayOfWeek: 'Monday',
    duration: 60,
    targetWords: { min: 180, max: 220 },
    persona: 'Fatima' // Can be overridden
  };

  /**
   * Generate system prompt for GPT-5
   * @param {Object} options - Template options
   * @returns {string} System prompt
   */
  static getSystemPrompt(options = {}) {
    const { persona = 'Fatima', market = 'Forex', brand = 'Seekapa' } = options;

    return `أنت كاتب محتوى احترافي متخصص في كتابة نصوص فيديو تداول بالعربية (اللهجة الخليجية).

الشخصية: ${persona}
${persona === 'Fatima' ? '- امرأة خليجية محترفة في التداول\n- الأسلوب: دافئ، تعليمي، مشجع\n- التركيز: تبسيط المفاهيم المعقدة' : '- رجل خليجي خبير في التحليل\n- الأسلوب: تحليلي، استراتيجي، محترف\n- التركيز: التحليل العميق والاستراتيجيات'}

قالب النص (يوم الاثنين - تحديث الأسواق):

**البنية الزمنية:**
1. الافتتاحية الجذابة (0-8 ثواني):
   - استخدم عبارة خليجية: "أهلين يا شباب" أو "عساكم طيبين"
   - سؤال مثير أو معلومة مفاجئة
   - اذكر الموضوع الرئيسي

2. البيانات والأرقام (8-25 ثواني):
   - تحديث سريع عن الأسواق (3 أيام - نهاية الأسبوع)
   - أرقام محددة وواضحة
   - ذكر العملات/السلع الرئيسية

3. التحليل (25-45 ثواني):
   - لماذا حدثت هذه التغييرات؟
   - الأخبار المؤثرة
   - الاتجاهات المتوقعة

4. الرؤية المهنية (45-55 ثواني):
   - ماذا يعني هذا للمتداول؟
   - نصيحة عملية واحدة
   - ما يجب مراقبته هذا الأسبوع

5. الدعوة لاتخاذ إجراء (55-60 ثواني):
   - تذكير بالمخاطر: "التداول يحمل مخاطر. قد تخسر رأس مالك"
   - دعوة للتعلم أو الحساب التجريبي

**المتطلبات:**
- عدد الكلمات: 180-220 كلمة بالضبط (60 ثانية عند القراءة)
- اللهجة: خليجية GCC (ليست فصحى)
- استخدم كلمات خليجية: الحين، شلون، وايد، زين، يلا
- النبرة: احترافية لكن ودودة
- العلامة التجارية: ${brand}
- يجب أن يتضمن: تحذير من المخاطر

**ممنوع:**
- الوعود المؤكدة أو الضمانات
- "ربح مضمون" أو "بدون مخاطر"
- اللغة العربية الفصحى الرسمية الجافة`;
  }

  /**
   * Generate user prompt with specific market data
   * @param {Object} marketData - Market information
   * @returns {string} User prompt
   */
  static getUserPrompt(marketData = {}) {
    const {
      mainTopic = 'حركة الأسواق خلال نهاية الأسبوع',
      keyPoints = [
        'الدولار ارتفع بنسبة 0.5%',
        'الذهب انخفض إلى 1850 دولار',
        'النفط مستقر عند 75 دولار'
      ],
      newsEvent = 'بيانات التوظيف الأمريكية',
      insight = 'توقعات بتحركات قوية هذا الأسبوع'
    } = marketData;

    return `اكتب نص فيديو مدته 60 ثانية (180-220 كلمة) باللهجة الخليجية عن:

**الموضوع الرئيسي:** ${mainTopic}

**النقاط الأساسية:**
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

**الحدث الإخباري:** ${newsEvent}

**الرؤية المطلوبة:** ${insight}

**تذكر:**
- ابدأ بعبارة خليجية جذابة
- ضع أرقام واضحة
- اشرح الأسباب ببساطة
- أنهي بتحذير المخاطر ودعوة للتعلم
- 180-220 كلمة بالضبط`;
  }

  /**
   * Generate complete script
   * @param {Object} options - Generation options
   * @returns {Object} Script structure
   */
  static generateStructure(options = {}) {
    const { persona = 'Fatima', market = 'Forex' } = options;

    return {
      template: 'market-update',
      dayOfWeek: 'Monday',
      persona,
      market,
      sections: [
        {
          name: 'hook',
          timeRange: '0-8s',
          wordCount: 24,
          requirements: [
            'Use Khaleeji greeting',
            'Create curiosity',
            'State main topic'
          ]
        },
        {
          name: 'data',
          timeRange: '8-25s',
          wordCount: 51,
          requirements: [
            'Specific numbers',
            'Weekend market summary',
            'Major currency pairs or commodities'
          ]
        },
        {
          name: 'analysis',
          timeRange: '25-45s',
          wordCount: 60,
          requirements: [
            'Explain why movements happened',
            'Reference news events',
            'Simple language'
          ]
        },
        {
          name: 'insight',
          timeRange: '45-55s',
          wordCount: 30,
          requirements: [
            'Practical advice',
            'What to watch this week',
            'Trader perspective'
          ]
        },
        {
          name: 'cta',
          timeRange: '55-60s',
          wordCount: 15,
          requirements: [
            'Risk warning (mandatory)',
            'Educational CTA',
            'Brand mention'
          ]
        }
      ],
      totalTargetWords: 180,
      estimatedDuration: 60
    };
  }
}

export default MarketUpdateTemplate;
