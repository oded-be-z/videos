/**
 * Script Writer Agent
 * Main engine for generating Arabic (GCC dialect) video scripts
 */

import { AzureOpenAI } from '@azure/openai';
import dotenv from 'dotenv';
import { MarketUpdateTemplate } from '../templates/market-update.js';
import { EducationTemplate } from '../templates/education.js';
import { TermsTemplate } from '../templates/terms.js';
import { DualAvatarTemplate } from '../templates/dual-avatar.js';
import { ArabicValidator } from '../utils/arabic-validator.js';
import { WordCounter } from '../utils/word-counter.js';
import { ComplianceChecker } from '../utils/compliance-checker.js';

dotenv.config();

export class ScriptWriter {
  constructor() {
    this.client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview'
    });

    this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5';

    this.templates = {
      'monday': MarketUpdateTemplate,
      'tuesday': EducationTemplate,
      'wednesday': TermsTemplate,
      'thursday': MarketUpdateTemplate, // Crypto & Commodities variant
      'friday': MarketUpdateTemplate, // Weekly Outlook variant
      'saturday': EducationTemplate, // Community Q&A variant
      'sunday': EducationTemplate, // Trading Psychology variant
      'dual': DualAvatarTemplate
    };
  }

  /**
   * Get template for day of week
   * @param {string} day - Day of week or template name
   * @returns {Object} Template class
   */
  getTemplate(day) {
    const dayLower = day.toLowerCase();
    return this.templates[dayLower] || MarketUpdateTemplate;
  }

  /**
   * Generate script using Azure OpenAI GPT-5
   * @param {Object} options - Script generation options
   * @returns {Object} Generated script with metadata
   */
  async generateScript(options = {}) {
    const {
      day = 'monday',
      persona = 'Fatima',
      topic = null,
      customPrompt = null,
      maxRetries = 3
    } = options;

    console.log(`\n🎬 Generating script for ${day}...`);
    console.log(`📝 Persona: ${persona}`);

    const TemplateClass = this.getTemplate(day);
    const systemPrompt = TemplateClass.getSystemPrompt({ persona, ...options });
    const userPrompt = customPrompt || TemplateClass.getUserPrompt(options);

    let attempt = 0;
    let bestScript = null;
    let bestScore = 0;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`\n🔄 Attempt ${attempt}/${maxRetries}...`);

      try {
        const response = await this.client.chat.completions.create({
          model: this.deployment,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        });

        const scriptText = response.choices[0].message.content.trim();

        // Validate the generated script
        const validation = await this.validateScript(scriptText);

        console.log(`\n📊 Validation Results:`);
        console.log(`   Word Count: ${validation.wordCount.wordCount} (target: 180-220)`);
        console.log(`   GCC Dialect Score: ${validation.arabic.dialect.score}/100`);
        console.log(`   Compliance: ${validation.compliance.isCompliant ? '✅' : '❌'}`);

        // Calculate overall score
        const score = this.calculateScore(validation);
        console.log(`   Overall Score: ${score}/100`);

        if (score > bestScore) {
          bestScore = score;
          bestScript = {
            script_ar: scriptText,
            persona,
            template: TemplateClass.metadata.name,
            dayOfWeek: day,
            validation,
            score,
            attempt
          };
        }

        // If score is good enough, stop retrying
        if (score >= 80) {
          console.log(`\n✅ Excellent script generated (score: ${score}/100)`);
          break;
        }

      } catch (error) {
        console.error(`❌ Error in attempt ${attempt}:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    if (!bestScript) {
      throw new Error('Failed to generate valid script after all retries');
    }

    // Add compliance fixes if needed
    if (!bestScript.validation.compliance.isCompliant) {
      console.log(`\n🔧 Applying compliance fixes...`);
      bestScript.script_ar = ComplianceChecker.addRiskWarning(bestScript.script_ar);
      bestScript.validation.compliance = ComplianceChecker.checkCompliance(bestScript.script_ar);
    }

    // Add metadata
    const stats = WordCounter.getStatistics(bestScript.script_ar);
    bestScript.duration_seconds = stats.estimatedDuration;
    bestScript.word_count = stats.wordCount;
    bestScript.compliance_verified = bestScript.validation.compliance.isCompliant;

    console.log(`\n🎉 Final script ready!`);
    console.log(`   Duration: ${bestScript.duration_seconds}s`);
    console.log(`   Words: ${bestScript.word_count}`);
    console.log(`   Compliance: ${bestScript.compliance_verified ? '✅' : '❌'}`);

    return bestScript;
  }

  /**
   * Validate generated script
   * @param {string} scriptText - Script text to validate
   * @returns {Object} Validation results
   */
  async validateScript(scriptText) {
    const wordCount = WordCounter.validateWordCount(scriptText);
    const arabic = ArabicValidator.validate(scriptText);
    const compliance = ComplianceChecker.checkCompliance(scriptText);

    return {
      wordCount,
      arabic,
      compliance,
      isValid: wordCount.isValid && arabic.isValid && compliance.isCompliant
    };
  }

  /**
   * Calculate overall script quality score
   * @param {Object} validation - Validation results
   * @returns {number} Score from 0-100
   */
  calculateScore(validation) {
    let score = 0;

    // Word count (30 points)
    if (validation.wordCount.isValid) {
      score += 30;
    } else {
      const wordCount = validation.wordCount.wordCount;
      const min = validation.wordCount.minWords;
      const max = validation.wordCount.maxWords;
      const distance = Math.min(
        Math.abs(wordCount - min),
        Math.abs(wordCount - max)
      );
      score += Math.max(0, 30 - distance); // Deduct 1 point per word off
    }

    // Arabic GCC dialect (40 points)
    score += Math.min(40, validation.arabic.dialect.score * 0.4);

    // Compliance (30 points)
    if (validation.compliance.isCompliant) {
      score += 30;
    } else {
      if (validation.compliance.riskWarning.isCompliant) score += 15;
      if (validation.compliance.cta.isCompliant) score += 10;
      if (validation.compliance.balance.isBalanced) score += 5;
    }

    return Math.round(score);
  }

  /**
   * Generate weekly batch of scripts (7 days)
   * @param {Object} options - Batch generation options
   * @returns {Array} Array of 7 scripts
   */
  async generateWeeklyBatch(options = {}) {
    const { persona = 'Fatima', brand = 'Seekapa' } = options;

    console.log(`\n📅 Generating weekly batch of scripts...`);
    console.log(`   Persona: ${persona}`);
    console.log(`   Brand: ${brand}\n`);

    const weeklyTopics = {
      monday: {
        topic: 'تحديث الأسواق - مراجعة نهاية الأسبوع',
        keyPoints: [
          'أداء الدولار الأمريكي',
          'تحركات الذهب والنفط',
          'الأسواق الآسيوية والأوروبية'
        ]
      },
      tuesday: {
        topic: 'كيف تستخدم وقف الخسارة بشكل صحيح',
        steps: [
          'تحديد مستوى الدخول',
          'حساب نسبة المخاطرة',
          'وضع وقف الخسارة عند مستوى منطقي'
        ]
      },
      wednesday: {
        term: 'الرافعة المالية',
        termEnglish: 'Leverage',
        simpleDefinition: 'استخدام أموال مقترضة لزيادة قوة التداول'
      },
      thursday: {
        topic: 'تحديث الكريبتو والسلع',
        keyPoints: [
          'بيتكوين وحركة العملات الرقمية',
          'الذهب والفضة',
          'النفط والغاز الطبيعي'
        ]
      },
      friday: {
        topic: 'توقعات الأسبوع القادم',
        keyPoints: [
          'الأحداث الاقتصادية المهمة',
          'الفرص المحتملة',
          'المخاطر التي يجب مراقبتها'
        ]
      },
      saturday: {
        topic: 'أسئلة المجتمع - كيف أبدأ التداول؟',
        steps: [
          'تعلم الأساسيات أولاً',
          'افتح حساب تجريبي',
          'تدرب لمدة 3 أشهر قبل المال الحقيقي'
        ]
      },
      sunday: {
        topic: 'علم نفس التداول - السيطرة على العواطف',
        steps: [
          'تحديد خطة واضحة',
          'الالتزام بإدارة المخاطر',
          'عدم التداول العاطفي'
        ]
      }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const scripts = [];

    for (const day of days) {
      try {
        const script = await this.generateScript({
          day,
          persona,
          brand,
          ...weeklyTopics[day]
        });
        scripts.push(script);
        console.log(`\n✅ ${day} script completed\n`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`\n❌ Failed to generate ${day} script:`, error.message);
        scripts.push({
          day,
          error: error.message,
          failed: true
        });
      }
    }

    console.log(`\n🎉 Weekly batch complete: ${scripts.filter(s => !s.failed).length}/7 successful`);
    return scripts;
  }

  /**
   * Generate single script by template name
   * @param {string} templateName - Template identifier
   * @param {Object} data - Template-specific data
   * @returns {Object} Generated script
   */
  async generateByTemplate(templateName, data = {}) {
    const TemplateClass = this.getTemplate(templateName);
    const systemPrompt = TemplateClass.getSystemPrompt(data);
    const userPrompt = TemplateClass.getUserPrompt(data);

    return this.generateScript({
      customPrompt: userPrompt,
      ...data
    });
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const writer = new ScriptWriter();

  console.log('🎬 Seekapa/Axia Script Writer Engine');
  console.log('=====================================\n');

  // Example: Generate Monday market update
  try {
    const script = await writer.generateScript({
      day: 'monday',
      persona: 'Fatima',
      brand: 'Seekapa',
      topic: 'تحليل الأسواق بعد نهاية الأسبوع',
      keyPoints: [
        'الدولار ارتفع 0.5% مقابل اليورو',
        'الذهب استقر عند 1850 دولار',
        'النفط انخفض إلى 75 دولار'
      ],
      newsEvent: 'بيانات التوظيف الأمريكية القوية',
      insight: 'توقعات باستمرار قوة الدولار هذا الأسبوع'
    });

    console.log('\n' + '='.repeat(60));
    console.log('📄 GENERATED SCRIPT');
    console.log('='.repeat(60));
    console.log(script.script_ar);
    console.log('='.repeat(60));
    console.log(`\n✅ Script saved to output\n`);

    // Save to file (optional)
    // fs.writeFileSync('./output/monday-script.json', JSON.stringify(script, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export default ScriptWriter;
