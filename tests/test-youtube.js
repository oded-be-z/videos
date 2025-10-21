const YouTubeUploadSystem = require('../src/index');
const path = require('path');

/**
 * Test YouTube Upload System
 * Run this file to test the upload functionality
 */

async function runTests() {
  console.log('YouTube Upload System - Test Suite\n');
  console.log('=====================================\n');

  const uploadSystem = new YouTubeUploadSystem();

  try {
    // Test 1: Initialize system
    console.log('Test 1: Initializing system...');
    await uploadSystem.initialize();
    console.log('✓ System initialized\n');

    // Test 2: Get channel info
    console.log('Test 2: Getting channel info...');
    const channelInfo = await uploadSystem.getChannelInfo();
    console.log('✓ Channel info retrieved:');
    console.log(`  - Channel: ${channelInfo.title}`);
    console.log(`  - ID: ${channelInfo.id}`);
    console.log(`  - Subscribers: ${channelInfo.subscriberCount}`);
    console.log(`  - Videos: ${channelInfo.videoCount}\n`);

    // Test 3: Setup playlists
    console.log('Test 3: Setting up standard playlists...');
    const playlists = await uploadSystem.setupPlaylists();
    console.log('✓ Playlists created\n');

    // Test 4: Test metadata generation
    console.log('Test 4: Testing metadata generation...');
    const MetadataGenerator = require('../src/utils/youtube-metadata');
    const metadata = MetadataGenerator.generateMetadata({
      topic: 'Forex Market Update',
      topicArabic: 'تحديث سوق الفوركس',
      summary: 'تحليل شامل لأسواق الفوركس اليوم مع نظرة على أهم الأزواج وفرص التداول المتاحة.',
      tradingPairs: [
        { pair: 'EUR/USD', price: '1.0850' },
        { pair: 'GBP/USD', price: '1.2650' }
      ],
      keyInsight: 'الدولار الأمريكي يواصل قوته مقابل العملات الرئيسية',
      persona: {
        name: 'فاطمة الراشد',
        bio: 'محللة أسواق مالية معتمدة مع خبرة 10 سنوات في تداول الفوركس',
        specialty: 'التحليل الفني والأساسي',
        tag: 'فاطمة_الراشد'
      },
      videoType: 'market_update',
      language: 'ar'
    });
    console.log('✓ Metadata generated:');
    console.log(`  - Title: ${metadata.title}`);
    console.log(`  - Tags: ${metadata.tags.length} tags`);
    console.log(`  - Description length: ${metadata.description.length} chars\n`);

    // Test 5: Test thumbnail generator (if video file provided)
    console.log('Test 5: Thumbnail generation...');
    console.log('⚠ Skipped (requires video file)\n');

    console.log('=====================================');
    console.log('ALL TESTS PASSED!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

/**
 * Example: Upload a single video
 */
async function uploadExample() {
  console.log('Example: Uploading a video\n');

  const uploadSystem = new YouTubeUploadSystem();

  // Example video data
  const videoData = {
    topic: 'Daily Forex Update',
    topicArabic: 'التحديث اليومي لسوق الفوركس',
    summary: 'تحليل شامل لأسواق الفوركس اليوم مع نظرة على أهم الأزواج والعملات المشفرة.',
    tradingPairs: [
      { pair: 'EUR/USD', price: '1.0850' },
      { pair: 'GBP/USD', price: '1.2650' },
      { pair: 'BTC/USD', price: '65000' }
    ],
    keyInsight: 'الدولار الأمريكي يواصل قوته بعد بيانات التضخم الإيجابية',
    persona: {
      name: 'فاطمة الراشد',
      bio: 'محللة أسواق مالية معتمدة مع خبرة 10 سنوات في تداول الفوركس',
      specialty: 'التحليل الفني والأساسي',
      tag: 'فاطمة_الراشد'
    },
    videoType: 'market_update',
    language: 'ar',
    customTags: ['تحليل_يومي', 'فرص_تداول']
  };

  try {
    const result = await uploadSystem.uploadVideo({
      videoPath: '/path/to/your/video.mp4', // Update this path
      videoData: videoData,
      generateThumbnail: true,
      addToPlaylists: true
    });

    console.log('\nUpload successful!');
    console.log('Video URL:', result.videoUrl);

  } catch (error) {
    console.error('Upload failed:', error.message);
  }
}

/**
 * Example: Batch upload multiple videos
 */
async function batchUploadExample() {
  console.log('Example: Batch uploading videos\n');

  const uploadSystem = new YouTubeUploadSystem();

  const videos = [
    {
      videoPath: '/path/to/video1.mp4',
      videoData: {
        topic: 'Market Update 1',
        topicArabic: 'تحديث السوق ١',
        // ... rest of video data
      }
    },
    {
      videoPath: '/path/to/video2.mp4',
      videoData: {
        topic: 'Market Update 2',
        topicArabic: 'تحديث السوق ٢',
        // ... rest of video data
      }
    }
  ];

  try {
    const { results, errors } = await uploadSystem.uploadBatch(videos, 10000);
    console.log(`\nBatch upload complete: ${results.length} successful, ${errors.length} failed`);
  } catch (error) {
    console.error('Batch upload failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--upload')) {
    uploadExample();
  } else if (args.includes('--batch')) {
    batchUploadExample();
  } else {
    runTests();
  }
}

module.exports = { runTests, uploadExample, batchUploadExample };
