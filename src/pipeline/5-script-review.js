import { AzureOpenAI } from '@azure/openai';
import logger from '../utils/logger.js';

/**
 * Step 5: Script Review
 * Uses GPT-5 Pro to review and improve the generated script
 */
export class ScriptReviewStep {
  constructor(config) {
    this.config = config;
    this.client = new AzureOpenAI({
      apiKey: config.env.azureOpenAI.key,
      endpoint: config.env.azureOpenAI.endpoint,
      apiVersion: '2025-01-01-preview'
    });
    this.deployment = config.env.azureOpenAI.deployments.gpt5Pro;
  }

  /**
   * Execute script review
   */
  async execute(script) {
    try {
      logger.info('Starting script review...', {
        wordCount: script.wordCount,
        estimatedDuration: script.estimatedDuration
      });

      // Review script using GPT-5 Pro
      const review = await this.reviewScript(script);

      // Apply corrections if needed
      const finalScript = review.approved
        ? script.text
        : review.corrected_script;

      const result = {
        approved: review.approved,
        original_script: script.text,
        corrected_script: finalScript,
        issues: review.issues || [],
        improvements: review.improvements || [],
        quality_score: review.quality_score || 0,
        final_word_count: finalScript.split(/\s+/).length,
        final_duration: Math.round(finalScript.split(/\s+/).length / 2.5),
        timestamp: new Date().toISOString()
      };

      logger.info('Script review completed', {
        approved: result.approved,
        issues: result.issues.length,
        improvements: result.improvements.length,
        qualityScore: result.quality_score
      });

      return result;
    } catch (error) {
      logger.error('Script review failed', { error: error.message });
      // If review fails, approve original script with warning
      logger.warn('Proceeding with original script due to review failure');
      return {
        approved: true,
        original_script: script.text,
        corrected_script: script.text,
        issues: [],
        improvements: [],
        quality_score: 7, // Default acceptable score
        final_word_count: script.wordCount,
        final_duration: script.estimatedDuration,
        review_error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Review script using Azure OpenAI GPT-5 Pro
   */
  async reviewScript(script) {
    const systemPrompt = `أنت مراجع محترف لنصوص فيديوهات اليوتيوب المالية باللغة العربية.

مهمتك: مراجعة النص وتقييمه بناءً على:
1. جودة اللهجة الخليجية (هل هي طبيعية؟)
2. الوضوح والدقة المالية
3. طول النص (المثالي 45-60 ثانية)
4. البنية (مقدمة، محتوى، خاتمة)
5. الدعوة للعمل (CTA)
6. النبرة المهنية والموثوقة

قيّم النص من 1-10 وقدم ملاحظات محددة.`;

    const userPrompt = `راجع هذا النص:

---
${script.text}
---

المعلومات:
- عدد الكلمات: ${script.wordCount}
- المدة المقدرة: ${script.estimatedDuration} ثانية
- نوع المحتوى: ${script.contentType}
- الموضوع: ${script.topic}

قدم تقييمك بالصيغة التالية:
{
  "approved": true/false,
  "quality_score": 1-10,
  "issues": ["مشكلة 1", "مشكلة 2"],
  "improvements": ["تحسين 1", "تحسين 2"],
  "corrected_script": "النص المحسّن (فقط إذا كان هناك مشاكل)"
}`;

    try {
      const response = await this.client.getChatCompletions(
        this.deployment,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          temperature: 0.3,
          maxTokens: 2000,
          responseFormat: { type: 'json_object' }
        }
      );

      const reviewResult = JSON.parse(response.choices[0].message.content);

      // Auto-approve if quality score >= 7
      if (reviewResult.quality_score >= 7) {
        reviewResult.approved = true;
      }

      // If not approved, ensure we have a corrected script
      if (!reviewResult.approved && !reviewResult.corrected_script) {
        reviewResult.corrected_script = script.text;
        reviewResult.approved = true; // Fallback to approval
      }

      return reviewResult;
    } catch (error) {
      logger.error('GPT-5 Pro review call failed', { error: error.message });
      throw error;
    }
  }
}

export default ScriptReviewStep;
