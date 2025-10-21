import { AzureOpenAI } from '@azure/openai';
import logger from '../utils/logger.js';
import { ScriptGenerationError } from '../utils/error-handler.js';

/**
 * Step 4: Script Generation
 * Uses Azure OpenAI GPT-5 to generate Arabic (Khaleeji) video scripts
 */
export class ScriptGenerationStep {
  constructor(config) {
    this.config = config;
    this.client = new AzureOpenAI({
      apiKey: config.env.azureOpenAI.key,
      endpoint: config.env.azureOpenAI.endpoint,
      apiVersion: '2025-01-01-preview'
    });
    this.deployment = config.env.azureOpenAI.deployments.gpt5;
  }

  /**
   * Execute script generation
   */
  async execute(topicData, marketData) {
    try {
      logger.info('Starting script generation...', {
        contentType: topicData.contentType,
        topic: topicData.topic.title
      });

      // Build context from market data
      const context = this.buildContext(topicData, marketData);

      // Generate script using GPT-5
      const script = await this.generateScript(context, topicData);

      // Format and structure the script
      const formattedScript = this.formatScript(script, topicData);

      logger.info('Script generation completed successfully', {
        wordCount: formattedScript.text.split(' ').length,
        duration: formattedScript.estimatedDuration
      });

      return formattedScript;
    } catch (error) {
      logger.error('Script generation failed', { error: error.message });
      throw new ScriptGenerationError('Failed to generate script', error);
    }
  }

  /**
   * Build context for script generation
   */
  buildContext(topicData, marketData) {
    const { contentType, topic } = topicData;

    let context = {
      contentType,
      topic: topic.title,
      angle: topic.angle,
      focus: topic.focus
    };

    if (contentType === 'breaking_news') {
      context.urgentEvents = topic.urgentEvents;
      context.keyPoints = marketData.summary?.keyPoints || [];
      context.marketData = {
        forex: this.extractRelevantData(marketData.forex?.answer),
        commodities: this.extractRelevantData(marketData.commodities?.answer),
        economic: this.extractRelevantData(marketData.economicIndicators?.answer)
      };
    } else {
      context.category = topic.category;
      context.targetAudience = topic.targetAudience;
    }

    return context;
  }

  /**
   * Extract relevant data from long text
   */
  extractRelevantData(text, maxLength = 500) {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  /**
   * Generate script using Azure OpenAI GPT-5
   */
  async generateScript(context, topicData) {
    const systemPrompt = this.buildSystemPrompt(topicData);
    const userPrompt = this.buildUserPrompt(context, topicData);

    try {
      const response = await this.client.getChatCompletions(
        this.deployment,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          temperature: 0.7,
          maxTokens: 1500,
          topP: 0.95,
          frequencyPenalty: 0.3,
          presencePenalty: 0.3
        }
      );

      const script = response.choices[0].message.content;
      return script;
    } catch (error) {
      logger.error('Azure OpenAI API call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Build system prompt for GPT-5
   */
  buildSystemPrompt(topicData) {
    const persona = this.config.personas[topicData.topic.persona || 'maha'];

    return `أنت ${persona.name}، ${persona.description}.

مهمتك: كتابة نص فيديو يوتيوب باللهجة الخليجية (الكويتية/الإماراتية/السعودية).

المواصفات:
- اللغة: عربية خليجية طبيعية (استخدم "شلون" بدل "كيف"، "وايد" بدل "كثير"، إلخ)
- الأسلوب: ${persona.voice}، واضح، وموثوق
- المدة المستهدفة: 45-60 ثانية (حوالي 150-200 كلمة)
- الجمهور: متداولون عرب في منطقة الخليج والشرق الأوسط

البنية المطلوبة:
1. مقدمة جذابة (10 ثوانٍ)
2. المحتوى الرئيسي (35-45 ثانية)
3. خاتمة ودعوة للعمل (5-10 ثوانٍ)

ملاحظات مهمة:
- استخدم أرقام وإحصائيات محددة
- تجنب المصطلحات التقنية المعقدة
- اذكر "سيكابا" بشكل طبيعي
- أنهِ بدعوة واضحة للعمل (زيارة الموقع، الاشتراك، إلخ)
- لا تستخدم رموز تعبيرية (emoji)`;
  }

  /**
   * Build user prompt based on content type
   */
  buildUserPrompt(context, topicData) {
    if (context.contentType === 'breaking_news') {
      return this.buildBreakingNewsPrompt(context);
    } else {
      return this.buildEducationalPrompt(context);
    }
  }

  /**
   * Build breaking news prompt
   */
  buildBreakingNewsPrompt(context) {
    return `اكتب نص فيديو عاجل عن:
العنوان: ${context.topic}
الزاوية: ${context.angle}
التركيز: ${context.focus}

أحداث عاجلة:
${context.urgentEvents.slice(0, 3).map((e, i) => `${i + 1}. ${e}`).join('\n')}

نقاط رئيسية من السوق:
${context.keyPoints.slice(0, 5).map((k, i) => `${i + 1}. ${k}`).join('\n')}

المطلوب:
1. ابدأ بـ "السلام عليكم، أنا [الاسم] من سيكابا"
2. اشرح الحدث العاجل وأثره على المتداولين
3. قدم نصيحة عملية سريعة
4. اختم بدعوة لزيارة seekapa.com لمتابعة التحديثات

اكتب النص كاملاً باللهجة الخليجية الطبيعية.`;
  }

  /**
   * Build educational prompt
   */
  buildEducationalPrompt(context) {
    return `اكتب نص فيديو تعليمي عن:
العنوان: ${context.topic}
الفئة: ${context.category}
الزاوية: ${context.angle}
التركيز: ${context.focus}
الجمهور المستهدف: ${context.targetAudience}

المطلوب:
1. ابدأ بـ "السلام عليكم، أنا [الاسم] من سيكابا"
2. قدم مقدمة جذابة توضح أهمية الموضوع
3. اشرح 2-3 نقاط رئيسية بأسلوب بسيط
4. أعطِ مثال عملي قصير
5. اختم بتشجيع المشاهدين على الاشتراك وزيارة seekapa.com

اكتب النص كاملاً باللهجة الخليجية الطبيعية.`;
  }

  /**
   * Format and structure the script
   */
  formatScript(scriptText, topicData) {
    const words = scriptText.trim().split(/\s+/);
    const wordCount = words.length;

    // Estimate duration (assuming ~2.5 words per second in Arabic)
    const estimatedDuration = Math.round(wordCount / 2.5);

    // Split into sections
    const sections = this.splitIntoSections(scriptText);

    return {
      text: scriptText,
      wordCount,
      estimatedDuration,
      sections,
      topic: topicData.topic.title,
      contentType: topicData.contentType,
      persona: topicData.topic.persona || 'maha',
      language: 'ar-AE', // Arabic (UAE)
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Split script into sections (intro, body, outro)
   */
  splitIntoSections(scriptText) {
    const sentences = scriptText.split(/[.!؟]+/).filter(s => s.trim().length > 0);

    const totalSentences = sentences.length;
    const introEnd = Math.max(1, Math.floor(totalSentences * 0.15));
    const bodyEnd = totalSentences - Math.max(1, Math.floor(totalSentences * 0.15));

    return {
      intro: sentences.slice(0, introEnd).join('. ') + '.',
      body: sentences.slice(introEnd, bodyEnd).join('. ') + '.',
      outro: sentences.slice(bodyEnd).join('. ') + '.'
    };
  }
}

export default ScriptGenerationStep;
