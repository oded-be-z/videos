/**
 * Dual Avatar Template (Special Episodes)
 * Both Fatima and Ahmed appear together - dialogue format
 */

export class DualAvatarTemplate {
  static metadata = {
    name: 'dual-avatar',
    dayOfWeek: 'Variable',
    duration: 60,
    targetWords: { min: 180, max: 220 },
    personas: ['Fatima', 'Ahmed']
  };

  static getSystemPrompt(options = {}) {
    const { topic = 'نقاش حول الأسواق', brand = 'Seekapa' } = options;

    return `أنت كاتب سيناريو محادثات تداول باللهجة الخليجية بين شخصيتين:

**الشخصيات:**
1. فاطمة - خبيرة تداول خليجية
   - الأسلوب: دافئ، تعليمي، يركز على إدارة المخاطر
   - تبسط المفاهيم للمبتدئين

2. أحمد - محلل أسواق خليجي
   - الأسلوب: تحليلي، استراتيجي، يركز على الفرص
   - يشارك التحليل الفني العميق

**البنية (60 ثانية):**
1. المقدمة (0-8 ثواني):
   - فاطمة تفتح الحوار: "أهلين يا شباب، معاي اليوم أحمد"
   - أحمد: "أهلين، عساكم طيبين"
   - ذكر الموضوع

2. الحوار الرئيسي (8-45 ثواني):
   - تبادل سلس بين الشخصيتين
   - كل منهما يضيف منظور مختلف
   - 4-6 مداخلات (سؤال/جواب أو نقطة/تعليق)
   - التوازن: فاطمة تسأل/تبسط، أحمد يحلل/يشرح

3. التوافق والتحذير (45-55 ثواني):
   - يتفقان على نقطة مهمة
   - تحذير مشترك من المخاطر
   - نصيحة عملية واحدة

4. الخاتمة (55-60 ثواني):
   - فاطمة: تلخيص سريع
   - أحمد: دعوة لاتخاذ إجراء
   - معاً: "التداول يحمل مخاطر"

**متطلبات الحوار:**
- 180-220 كلمة إجمالي
- توزيع متوازن (50% فاطمة، 50% أحمد تقريباً)
- لهجة خليجية طبيعية
- تجنب الحوار المصطنع
- اجعله كأنه نقاش بين أصدقاء محترفين
- كل شخصية لها صوتها الخاص

**تنسيق الإخراج:**
فاطمة: [نصها]
أحمد: [نصه]
فاطمة: [نصها]
...

**العلامة التجارية:** ${brand}`;
  }

  static getUserPrompt(dialogueContent = {}) {
    const {
      topic = 'تحليل الذهب هذا الأسبوع',
      fatimaFocus = 'كيف يتداول المبتدئ الذهب بأمان',
      ahmedFocus = 'التحليل الفني لحركة الذهب',
      keyPoints = [
        'الذهب وصل 1850 دولار',
        'مستويات الدعم والمقاومة',
        'إدارة المخاطر مع التقلبات'
      ],
      agreement = 'انتظار إشارة واضحة قبل الدخول'
    } = dialogueContent;

    return `اكتب حوار مدته 60 ثانية (180-220 كلمة) باللهجة الخليجية بين فاطمة وأحمد:

**الموضوع:** ${topic}

**تركيز فاطمة:** ${fatimaFocus}

**تركيز أحمد:** ${ahmedFocus}

**النقاط الرئيسية:**
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

**نقطة الاتفاق:** ${agreement}

**متطلبات الحوار:**
- ابدأ بفاطمة تفتح الموضوع وترحب بأحمد
- 4-6 مداخلات متبادلة
- فاطمة تطرح أسئلة المبتدئين أو تبسط
- أحمد يعطي التحليل والأرقام
- يتفقان على نصيحة عملية
- يختمان معاً بتحذير المخاطر

**النسق:**
فاطمة: [نص المداخلة]
أحمد: [نص المداخلة]
...`;
  }

  static generateStructure(options = {}) {
    return {
      template: 'dual-avatar',
      dayOfWeek: options.dayOfWeek || 'Variable',
      personas: ['Fatima', 'Ahmed'],
      format: 'dialogue',
      sections: [
        {
          name: 'introduction',
          timeRange: '0-8s',
          wordCount: 24,
          speakers: ['Fatima', 'Ahmed'],
          requirements: [
            'Fatima opens and introduces Ahmed',
            'Ahmed greets viewers',
            'State topic together'
          ]
        },
        {
          name: 'dialogue',
          timeRange: '8-45s',
          wordCount: 111,
          exchanges: '4-6',
          requirements: [
            'Balanced turn-taking',
            'Fatima asks/simplifies',
            'Ahmed analyzes/explains',
            'Natural conversation flow'
          ]
        },
        {
          name: 'agreement',
          timeRange: '45-55s',
          wordCount: 30,
          speakers: ['Both'],
          requirements: [
            'Agree on key insight',
            'Joint risk warning',
            'Practical advice'
          ]
        },
        {
          name: 'conclusion',
          timeRange: '55-60s',
          wordCount: 15,
          speakers: ['Fatima', 'Ahmed'],
          requirements: [
            'Fatima summarizes',
            'Ahmed adds CTA',
            'Joint: "Trading carries risks"'
          ]
        }
      ],
      totalTargetWords: 180,
      estimatedDuration: 60
    };
  }

  /**
   * Parse dialogue script into separate speaker segments
   * @param {string} script - Full dialogue script
   * @returns {Array} Array of { speaker, text } objects
   */
  static parseDialogue(script) {
    const lines = script.split('\n').filter(line => line.trim());
    const dialogue = [];

    for (const line of lines) {
      const match = line.match(/^(فاطمة|أحمد|Fatima|Ahmed):\s*(.+)$/);
      if (match) {
        dialogue.push({
          speaker: match[1],
          text: match[2].trim()
        });
      }
    }

    return dialogue;
  }

  /**
   * Validate dialogue balance
   * @param {Array} dialogue - Parsed dialogue array
   * @returns {Object} Balance validation result
   */
  static validateBalance(dialogue) {
    const fatimaLines = dialogue.filter(d =>
      d.speaker === 'فاطمة' || d.speaker === 'Fatima'
    );
    const ahmedLines = dialogue.filter(d =>
      d.speaker === 'أحمد' || d.speaker === 'Ahmed'
    );

    const fatimaWords = fatimaLines.reduce((sum, line) =>
      sum + line.text.split(/\s+/).length, 0
    );
    const ahmedWords = ahmedLines.reduce((sum, line) =>
      sum + line.text.split(/\s+/).length, 0
    );

    const totalWords = fatimaWords + ahmedWords;
    const fatimaPercent = (fatimaWords / totalWords * 100).toFixed(1);
    const ahmedPercent = (ahmedWords / totalWords * 100).toFixed(1);

    const isBalanced = Math.abs(fatimaWords - ahmedWords) <= totalWords * 0.2; // Within 20%

    return {
      isBalanced,
      fatima: {
        lines: fatimaLines.length,
        words: fatimaWords,
        percentage: fatimaPercent
      },
      ahmed: {
        lines: ahmedLines.length,
        words: ahmedWords,
        percentage: ahmedPercent
      },
      totalWords,
      message: isBalanced
        ? 'Dialogue is well-balanced between speakers'
        : 'Dialogue is imbalanced - one speaker dominates'
    };
  }
}

export default DualAvatarTemplate;
