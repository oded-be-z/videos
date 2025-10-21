#!/usr/bin/env node

import 'dotenv/config';
import logger from './utils/logger.js';
import { loadConfig } from './config/index.js';
import { VideoOrchestrator } from './orchestrator.js';

/**
 * Main entry point for Seekapa YouTube Automation
 */
async function main() {
  try {
    // Banner
    console.log('\n' + '═'.repeat(70));
    console.log('  SEEKAPA YOUTUBE AUTOMATION PIPELINE');
    console.log('  AI-Powered Video Generation & Publishing');
    console.log('═'.repeat(70) + '\n');

    // Load configuration
    logger.info('Loading configuration...');
    const config = loadConfig();
    logger.info('Configuration loaded successfully');

    // Initialize orchestrator
    logger.info('Initializing pipeline orchestrator...');
    const orchestrator = new VideoOrchestrator(config);

    // Check for recovery
    const canRecover = await orchestrator.canRecover();
    if (canRecover) {
      const recoveryInfo = orchestrator.getRecoveryInfo();
      logger.warn('Found incomplete pipeline run', recoveryInfo);

      // For now, start fresh (resume logic can be added later)
      logger.info('Starting fresh pipeline run');
    }

    // Run the pipeline
    logger.info('Starting pipeline execution...\n');
    const result = await orchestrator.run();

    // Display results
    console.log('\n' + '═'.repeat(70));
    if (result.success) {
      console.log('  ✓ PIPELINE COMPLETED SUCCESSFULLY!');
      console.log('═'.repeat(70));
      console.log(`\n  YouTube URL: ${result.youtubeUrl}`);
      console.log(`  Video ID: ${result.videoId}`);
      console.log(`  Content Type: ${result.contentType}`);
      console.log(`  Topic: ${result.topic}`);
      console.log(`  Duration: ${(result.duration / 1000 / 60).toFixed(2)} minutes`);
      console.log('\n' + '═'.repeat(70) + '\n');
      process.exit(0);
    } else {
      console.log('  ✗ PIPELINE FAILED');
      console.log('═'.repeat(70));
      console.log(`\n  Error: ${result.error}`);
      console.log(`  Stage: ${result.stage}`);
      console.log('\n  Check logs for detailed error information.');
      console.log('\n' + '═'.repeat(70) + '\n');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Fatal error in main function', {
      error: error.message,
      stack: error.stack
    });

    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('\nCheck logs/error.log for details\n');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason,
    promise
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

// Run main function
main();
