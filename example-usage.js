/**
 * Example Usage: Synthesia Video Producer Agent
 *
 * This file demonstrates how to use the Video Producer Agent
 * to create branded Arabic videos with Synthesia API
 */

require('dotenv').config();
const VideoProducerAgent = require('./src/agents/video-producer');

// Initialize the agent
const producer = new VideoProducerAgent();

// Example 1: Simple video creation (test mode)
async function example1_BasicVideo() {
  console.log('\n=== Example 1: Basic Video Creation ===\n');

  const result = await producer.produceVideo({
    title: 'Seekapa Welcome Video',
    script: 'مرحباً بكم في سيكابا، منصة التداول الموثوقة في الأسواق المالية العالمية.',
    persona: 'professional',
    language: 'ar-SA',
    gender: 'female',
    test: true, // Test mode - won't consume credits
    addBranding: true
  });

  console.log('Video created at:', result.finalVideoPath);
}

// Example 2: Using a predefined persona
async function example2_PredefinedPersona() {
  console.log('\n=== Example 2: Using Predefined Persona ===\n');

  const result = await producer.produceVideo({
    title: 'Seekapa Trading Tips - Expert',
    script: `مرحباً، أنا خبير التداول في سيكابا.
    اليوم سأشارككم بعض النصائح المهمة للتداول الناجح.
    أولاً، من المهم دائماً إدارة المخاطر بعناية.
    ثانياً، احرصوا على التعلم المستمر وتطوير مهاراتكم.
    مع سيكابا، نوفر لكم جميع الأدوات اللازمة للنجاح.`,
    persona: 'seekapa_trader', // Uses expert avatar with male Saudi voice
    test: true,
    addBranding: true
  });

  console.log('Video created at:', result.finalVideoPath);
}

// Example 3: UAE dialect with different avatar
async function example3_UAEDialect() {
  console.log('\n=== Example 3: UAE Dialect Video ===\n');

  const result = await producer.produceVideo({
    title: 'Axia Customer Support',
    script: `أهلاً وسهلاً بكم في أكسيا.
    نحن هنا لمساعدتكم في جميع استفساراتكم.
    فريق الدعم متاح على مدار الساعة.
    لا تترددوا في التواصل معنا في أي وقت.`,
    persona: 'axia_support', // Friendly female with UAE dialect
    test: true,
    addBranding: true
  });

  console.log('Video created at:', result.finalVideoPath);
}

// Example 4: Batch production
async function example4_BatchProduction() {
  console.log('\n=== Example 4: Batch Video Production ===\n');

  const videos = [
    {
      title: 'Seekapa - What is Forex',
      script: 'ما هو الفوركس؟ هو سوق تداول العملات الأجنبية.',
      persona: 'seekapa_educator',
      test: true,
      addBranding: true
    },
    {
      title: 'Seekapa - How to Start',
      script: 'كيف تبدأ التداول؟ سجل في سيكابا واحصل على حساب تجريبي.',
      persona: 'seekapa_educator',
      test: true,
      addBranding: true
    },
    {
      title: 'Seekapa - Support',
      script: 'نحن هنا لدعمك. تواصل معنا في أي وقت.',
      persona: 'seekapa_support',
      test: true,
      addBranding: true
    }
  ];

  const result = await producer.produceBatch(videos, {
    sequential: true // Process one at a time
  });

  console.log('Batch completed!');
  console.log('Stats:', result.stats);
}

// Example 5: Custom avatar and voice selection
async function example5_CustomSelection() {
  console.log('\n=== Example 5: Custom Avatar and Voice ===\n');

  const result = await producer.produceVideo({
    title: 'Custom Video',
    script: 'هذا فيديو تجريبي مع اختيار مخصص للأفاتار والصوت.',
    persona: 'expert', // Expert avatar
    language: 'ar-EG', // Egyptian dialect
    gender: 'male',
    background: 'modern',
    test: true,
    addBranding: true
  });

  console.log('Video created at:', result.finalVideoPath);
}

// Example 6: Production video (real, not test) - COMMENTED TO AVOID CHARGES
async function example6_ProductionVideo() {
  console.log('\n=== Example 6: Production Video (COMMENTED) ===\n');
  console.log('⚠️  This creates a real video and consumes credits!');
  console.log('💡 Uncomment the code below to run.\n');

  /*
  const result = await producer.produceVideo({
    title: 'Seekapa Official - ' + new Date().toISOString(),
    script: `مرحباً بكم في سيكابا، منصة التداول الرائدة في منطقة الخليج.
    نحن نقدم لكم أفضل تجربة تداول في أسواق الفوركس والعملات الرقمية.
    مع سيكابا، يمكنكم الوصول إلى الأسواق العالمية بكل سهولة وأمان.
    فريقنا من الخبراء متواجد على مدار الساعة لدعمكم.
    انضموا إلينا اليوم وابدأوا رحلتكم في عالم التداول الاحترافي.`,
    persona: 'seekapa_trader',
    test: false, // PRODUCTION MODE
    addBranding: true
  });

  console.log('Production video created at:', result.finalVideoPath);
  */
}

// Main function to run examples
async function main() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Synthesia Video Producer - Examples         ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  try {
    // Run one example at a time
    // Uncomment the example you want to run:

    await example1_BasicVideo();
    // await example2_PredefinedPersona();
    // await example3_UAEDialect();
    // await example4_BatchProduction();
    // await example5_CustomSelection();
    // await example6_ProductionVideo();

    console.log('\n✅ Example completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error running example:', error.message);
    console.error(error.stack);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  example1_BasicVideo,
  example2_PredefinedPersona,
  example3_UAEDialect,
  example4_BatchProduction,
  example5_CustomSelection,
  example6_ProductionVideo
};
