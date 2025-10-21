/**
 * Synthesia Video Producer Test Suite
 * Tests video creation, branding, and complete workflow
 */

require('dotenv').config();
const VideoProducerAgent = require('../src/agents/video-producer');
const path = require('path');

// Test configurations
const TEST_SCRIPTS = {
  short: `مرحباً بكم في سيكابا، منصة التداول الموثوقة في الأسواق المالية العالمية.`,

  medium: `مرحباً بكم في سيكابا، منصة التداول الرائدة في منطقة الخليج.
نحن نقدم لكم أفضل تجربة تداول في أسواق الفوركس والعملات الرقمية.
مع سيكابا، يمكنكم الوصول إلى الأسواق العالمية بكل سهولة وأمان.
انضموا إلينا اليوم وابدأوا رحلتكم في عالم التداول الاحترافي.`,

  long: `مرحباً بكم في سيكابا، منصة التداول الرائدة في منطقة الخليج والشرق الأوسط.
نحن نفخر بتقديم خدمات تداول متميزة في أسواق الفوركس والعملات الرقمية.
سيكابا توفر لكم بيئة تداول آمنة ومنظمة، مع أدوات تحليل احترافية.
فريقنا من الخبراء متواجد على مدار الساعة لدعمكم ومساعدتكم.
نحن ملتزمون بالشفافية الكاملة في جميع عملياتنا.
انضموا إلى آلاف المتداولين الناجحين الذين اختاروا سيكابا كشريك موثوق في رحلتهم المالية.
ابدأوا اليوم واستمتعوا بتجربة تداول لا مثيل لها.`
};

/**
 * Test 1: Basic video creation (test mode)
 */
async function testBasicVideoCreation() {
  console.log('\n=== Test 1: Basic Video Creation (Test Mode) ===\n');

  try {
    const producer = new VideoProducerAgent();

    const result = await producer.produceVideo({
      title: 'Seekapa Test Video - Basic',
      script: TEST_SCRIPTS.short,
      persona: 'professional',
      language: 'ar-SA',
      gender: 'female',
      test: true,  // Test mode - won't consume credits
      addBranding: false
    });

    console.log('✅ Test 1 PASSED');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 2: Video creation with branding
 */
async function testVideoWithBranding() {
  console.log('\n=== Test 2: Video Creation with Branding ===\n');

  try {
    const producer = new VideoProducerAgent();

    const result = await producer.produceVideo({
      title: 'Seekapa Test Video - With Branding',
      script: TEST_SCRIPTS.medium,
      persona: 'friendly',
      language: 'ar-SA',
      gender: 'female',
      test: true,
      addBranding: true  // Add Seekapa watermark
    });

    console.log('✅ Test 2 PASSED');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 3: Different persona and voice
 */
async function testDifferentPersona() {
  console.log('\n=== Test 3: Different Persona (Male Expert) ===\n');

  try {
    const producer = new VideoProducerAgent();

    const result = await producer.produceVideo({
      title: 'Seekapa Test Video - Expert Trader',
      script: TEST_SCRIPTS.medium,
      persona: 'expert',
      language: 'ar-AE',  // UAE dialect
      gender: 'male',
      test: true,
      addBranding: true
    });

    console.log('✅ Test 3 PASSED');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 4: List videos
 */
async function testListVideos() {
  console.log('\n=== Test 4: List Videos ===\n');

  try {
    const producer = new VideoProducerAgent();
    const videos = await producer.listVideos();

    console.log(`Found ${videos.length} videos in account`);
    videos.slice(0, 5).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title} - Status: ${video.status} - Created: ${video.createdAt}`);
    });

    console.log('✅ Test 4 PASSED');
    return true;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 5: Batch production (sequential)
 */
async function testBatchProduction() {
  console.log('\n=== Test 5: Batch Production (2 videos) ===\n');

  try {
    const producer = new VideoProducerAgent();

    const batch = await producer.produceBatch([
      {
        title: 'Seekapa Batch Video 1',
        script: TEST_SCRIPTS.short,
        persona: 'professional',
        language: 'ar-SA',
        gender: 'female',
        test: true,
        addBranding: true
      },
      {
        title: 'Seekapa Batch Video 2',
        script: TEST_SCRIPTS.short,
        persona: 'expert',
        language: 'ar-SA',
        gender: 'male',
        test: true,
        addBranding: true
      }
    ], {
      sequential: true
    });

    console.log('✅ Test 5 PASSED');
    console.log('Stats:', JSON.stringify(batch.stats, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 6: Production video (real, not test mode) - COMMENTED OUT TO AVOID CONSUMING CREDITS
 */
async function testProductionVideo() {
  console.log('\n=== Test 6: Production Video (SKIPPED - Uncomment to run) ===\n');
  console.log('⚠️  This test is skipped to avoid consuming Synthesia credits.');
  console.log('💡 To run production video test, uncomment the code below.\n');
  return true;

  /*
  try {
    const producer = new VideoProducerAgent();

    const result = await producer.produceVideo({
      title: 'Seekapa Production Video - ' + new Date().toISOString(),
      script: TEST_SCRIPTS.long,
      persona: 'seekapa_trader',
      language: 'ar-SA',
      gender: 'male',
      test: false,  // PRODUCTION MODE
      addBranding: true
    });

    console.log('✅ Test 6 PASSED');
    console.log('Result:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message);
    return false;
  }
  */
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Synthesia Video Producer Test Suite         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const tests = [
    { name: 'Basic Video Creation', fn: testBasicVideoCreation },
    { name: 'Video with Branding', fn: testVideoWithBranding },
    { name: 'Different Persona', fn: testDifferentPersona },
    { name: 'List Videos', fn: testListVideos },
    { name: 'Batch Production', fn: testBatchProduction },
    { name: 'Production Video', fn: testProductionVideo }
  ];

  const results = [];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (error) {
      console.error(`Error running test "${test.name}":`, error);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Test Summary                                 ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${result.name}: ${status}`);
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\nTotal: ${passedCount}/${totalCount} tests passed`);
  console.log('════════════════════════════════════════════════\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testBasicVideoCreation,
  testVideoWithBranding,
  testDifferentPersona,
  testListVideos,
  testBatchProduction,
  testProductionVideo,
  runAllTests
};
