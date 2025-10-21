/**
 * Test Script Generation
 * Comprehensive tests for the Arabic GCC script generator
 */

import { ScriptWriter } from '../src/agents/script-writer.js';
import { ArabicValidator } from '../src/utils/arabic-validator.js';
import { WordCounter } from '../src/utils/word-counter.js';
import { ComplianceChecker } from '../src/utils/compliance-checker.js';

// Test utilities
const testSampleScript = `أهلين يا شباب، عساكم طيبين! اليوم بنتكلم عن حركة الأسواق الأسبوع اللي راح.

الدولار الأمريكي ارتفع بنسبة 0.5% مقابل اليورو، والذهب استقر عند مستوى 1850 دولار للأونصة. أما النفط، فانخفض شوي ووصل 75 دولار للبرميل.

السبب الرئيسي لقوة الدولار هو بيانات التوظيف الأمريكية اللي طلعت أقوى من المتوقع. هذا خلى المستثمرين يتوقعون إن الفيدرالي الأمريكي بيحافظ على أسعار الفائدة مرتفعة.

بالنسبة للمتداولين، الحين الفرصة في مراقبة مستويات الدعم عند اليورو دولار. وايد مهم تحطون وقف خسارة مناسب قبل الدخول في أي صفقة.

هذا الأسبوع، ترقبوا بيانات التضخم الأوروبية اللي ممكن تغير اتجاه السوق.

تذكروا دايماً، التداول يحمل مخاطر. قد تخسر رأس مالك. ابدأوا بالحساب التجريبي وتعلموا قبل ما تخاطروا بأموالكم الحقيقية.

زوروا موقع سيكابا للمزيد من التحليلات المجانية.`;

console.log('🧪 Testing Script Generator\n');
console.log('='.repeat(60));

// Test 1: Word Counter
console.log('\n📊 Test 1: Word Counter');
console.log('-'.repeat(60));
const wordStats = WordCounter.getStatistics(testSampleScript);
console.log(`✓ Word count: ${wordStats.wordCount}`);
console.log(`✓ Estimated duration: ${wordStats.estimatedDuration}s`);
console.log(`✓ Character count: ${wordStats.characterCount}`);

const wordValidation = WordCounter.validateWordCount(testSampleScript);
console.log(`✓ Within target range: ${wordValidation.isValid ? '✅ Yes' : '❌ No'}`);
console.log(`  ${wordValidation.message}`);

// Test 2: Arabic Validator
console.log('\n📊 Test 2: GCC Dialect Validator');
console.log('-'.repeat(60));
const arabicValidation = ArabicValidator.validate(testSampleScript);
console.log(`✓ GCC Dialect Score: ${arabicValidation.dialect.score}/100`);
console.log(`✓ GCC markers found: ${arabicValidation.dialect.gccMatches}`);
console.log(`✓ MSA indicators: ${arabicValidation.dialect.msaMatches}`);
console.log(`✓ Financial terms: ${arabicValidation.financial.matchCount}`);
console.log(`✓ Quality check: ${arabicValidation.quality.isValid ? '✅ Pass' : '❌ Fail'}`);
console.log(`✓ Overall: ${arabicValidation.isValid ? '✅ Valid' : '❌ Invalid'}`);

// Test 3: Compliance Checker
console.log('\n📊 Test 3: Compliance Checker');
console.log('-'.repeat(60));
const complianceCheck = ComplianceChecker.checkCompliance(testSampleScript);
console.log(`✓ Risk warning present: ${complianceCheck.riskWarning.isCompliant ? '✅ Yes' : '❌ No'}`);
console.log(`✓ CTA compliant: ${complianceCheck.cta.isCompliant ? '✅ Yes' : '❌ No'}`);
console.log(`✓ Content balanced: ${complianceCheck.balance.isBalanced ? '✅ Yes' : '❌ No'}`);
console.log(`✓ Overall compliance: ${complianceCheck.isCompliant ? '✅ Pass' : '❌ Fail'}`);

if (complianceCheck.recommendations.length > 0) {
  console.log('\n📋 Recommendations:');
  complianceCheck.recommendations.forEach(rec => {
    console.log(`  - [${rec.severity.toUpperCase()}] ${rec.message}`);
  });
}

// Test 4: Script Generation
console.log('\n📊 Test 4: Live Script Generation (using Azure OpenAI)');
console.log('-'.repeat(60));

const writer = new ScriptWriter();

(async () => {
  try {
    console.log('🔄 Generating Monday market update script...\n');

    const script = await writer.generateScript({
      day: 'monday',
      persona: 'Fatima',
      brand: 'Seekapa',
      topic: 'تحديث أسواق الفوركس',
      keyPoints: [
        'اليورو انخفض أمام الدولار بنسبة 0.3%',
        'الجنيه الإسترليني يواصل الصعود',
        'الين الياباني تحت الضغط'
      ],
      newsEvent: 'قرار البنك المركزي الأوروبي',
      insight: 'فرص في تداول اليورو دولار هذا الأسبوع'
    });

    console.log('\n✅ Script generated successfully!\n');
    console.log('='.repeat(60));
    console.log('📄 SCRIPT OUTPUT');
    console.log('='.repeat(60));
    console.log(script.script_ar);
    console.log('='.repeat(60));
    console.log('\n📈 Script Metrics:');
    console.log(`   Word Count: ${script.word_count}`);
    console.log(`   Duration: ${script.duration_seconds}s`);
    console.log(`   Quality Score: ${script.score}/100`);
    console.log(`   Compliance: ${script.compliance_verified ? '✅' : '❌'}`);
    console.log(`   Template: ${script.template}`);
    console.log(`   Persona: ${script.persona}`);

    console.log('\n🎉 All tests completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
