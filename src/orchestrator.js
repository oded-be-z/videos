import logger from './utils/logger.js';
import errorHandler from './utils/error-handler.js';
import metricsTracker from './utils/metrics.js';
import StateManager from './state-manager.js';
import ResearchStep from './pipeline/1-research.js';
import EventDetectionStep from './pipeline/2-event-detection.js';
import TopicDecisionStep from './pipeline/3-topic-decision.js';
import ScriptGenerationStep from './pipeline/4-script-generation.js';
import ScriptReviewStep from './pipeline/5-script-review.js';
import VideoProductionStep from './pipeline/6-video-production.js';
import BrandOverlayStep from './pipeline/7-brand-overlay.js';
import YouTubeUploadStep from './pipeline/8-youtube-upload.js';

/**
 * Main Pipeline Orchestrator
 * Coordinates all 8 pipeline steps from research to YouTube upload
 */
export class VideoOrchestrator {
  constructor(config) {
    this.config = config;
    this.state = new StateManager(config.env.app.stateFilePath);

    // Initialize pipeline steps
    this.steps = {
      research: new ResearchStep(config),
      eventDetection: new EventDetectionStep(config),
      topicDecision: new TopicDecisionStep(config),
      scriptGeneration: new ScriptGenerationStep(config),
      scriptReview: new ScriptReviewStep(config),
      videoProduction: new VideoProductionStep(config),
      brandOverlay: new BrandOverlayStep(config),
      youtubeUpload: new YouTubeUploadStep(config)
    };

    logger.info('Video Orchestrator initialized', {
      steps: Object.keys(this.steps).length
    });
  }

  /**
   * Run the complete pipeline
   */
  async run() {
    const runId = await this.state.initRun();
    metricsTracker.startRun();

    try {
      logger.info('='.repeat(60));
      logger.info('SEEKAPA YOUTUBE AUTOMATION PIPELINE STARTED');
      logger.info('='.repeat(60));

      // Step 1: Market Research
      const marketData = await this.executeStep(
        'research',
        'Market Research',
        async () => await this.steps.research.execute()
      );
      this.state.set('market_data', marketData);

      // Step 2: Event Detection
      const urgencyData = await this.executeStep(
        'event-detection',
        'Event Detection',
        async () => await this.steps.eventDetection.execute(marketData)
      );
      this.state.set('urgency_data', urgencyData);

      // Step 3: Topic Decision
      const topicData = await this.executeStep(
        'topic-decision',
        'Topic Decision',
        async () => await this.steps.topicDecision.execute(urgencyData, marketData)
      );
      this.state.set('topic_data', topicData);

      // Step 4: Script Generation
      const scriptData = await this.executeStep(
        'script-generation',
        'Script Generation',
        async () => await this.steps.scriptGeneration.execute(topicData, marketData)
      );
      this.state.set('script_data', scriptData);

      // Step 5: Script Review
      const reviewData = await this.executeStep(
        'script-review',
        'Script Review',
        async () => await this.steps.scriptReview.execute(scriptData)
      );
      this.state.set('review_data', reviewData);

      // Check if script was approved
      if (!reviewData.approved) {
        logger.warn('Script was not approved after review, using corrected version');
      }

      // Step 6: Video Production
      const videoData = await this.executeStep(
        'video-production',
        'Video Production',
        async () => await this.steps.videoProduction.execute(
          { ...scriptData, text: reviewData.corrected_script },
          topicData
        )
      );
      this.state.set('video_data', videoData);

      // Step 7: Brand Overlay
      const brandedVideo = await this.executeStep(
        'brand-overlay',
        'Brand Overlay',
        async () => await this.steps.brandOverlay.execute(videoData)
      );
      this.state.set('branded_video', brandedVideo);

      // Step 8: YouTube Upload
      const uploadResult = await this.executeStep(
        'youtube-upload',
        'YouTube Upload',
        async () => await this.steps.youtubeUpload.execute(
          brandedVideo,
          topicData,
          scriptData
        )
      );
      this.state.set('upload_result', uploadResult);

      // Pipeline completed successfully
      await this.state.complete(true);
      const runSummary = metricsTracker.endRun(true);

      logger.info('='.repeat(60));
      logger.info('PIPELINE COMPLETED SUCCESSFULLY!');
      logger.info('='.repeat(60));

      return {
        success: true,
        runId,
        youtubeUrl: uploadResult.url,
        videoId: uploadResult.videoId,
        contentType: topicData.contentType,
        topic: topicData.topic.title,
        duration: runSummary.duration,
        metrics: metricsTracker.getMetrics()
      };
    } catch (error) {
      logger.error('Pipeline failed', { error: error.message, stack: error.stack });

      await this.state.complete(false, error);
      metricsTracker.endRun(false);

      logger.info('='.repeat(60));
      logger.info('PIPELINE FAILED');
      logger.info('='.repeat(60));

      return {
        success: false,
        runId,
        error: error.message,
        stage: error.stage || 'unknown',
        metrics: metricsTracker.getMetrics()
      };
    }
  }

  /**
   * Execute a single pipeline step with error handling and metrics
   */
  async executeStep(stepName, displayName, stepFunction) {
    await this.state.setStep(stepName);
    metricsTracker.startStage(stepName);

    logger.info('─'.repeat(60));
    logger.info(`▶ STEP: ${displayName}`);
    logger.info('─'.repeat(60));

    let retryCount = 0;
    const maxRetries = this.config.env.pipeline.maxRetries;

    while (retryCount <= maxRetries) {
      try {
        const result = await stepFunction();

        await this.state.completeStep(stepName, true);
        metricsTracker.endStage(stepName, true);

        logger.info(`✓ ${displayName} completed successfully`);

        return result;
      } catch (error) {
        logger.error(`✗ ${displayName} failed`, {
          attempt: retryCount + 1,
          maxRetries: maxRetries + 1,
          error: error.message
        });

        const handlerResult = await errorHandler.handleError(error, {
          step: stepName,
          attempt: retryCount + 1
        });

        if (handlerResult.retry && retryCount < maxRetries) {
          retryCount++;
          logger.info(`Retrying ${displayName}... (attempt ${retryCount + 1})`);
          continue;
        }

        // Max retries reached or non-retryable error
        await this.state.completeStep(stepName, false, error);
        metricsTracker.endStage(stepName, false, error);

        throw error;
      }
    }
  }

  /**
   * Check if recovery is possible
   */
  async canRecover() {
    return await this.state.canRecover();
  }

  /**
   * Get recovery information
   */
  getRecoveryInfo() {
    return this.state.getRecoveryInfo();
  }

  /**
   * Resume from saved state
   */
  async resume() {
    const recoveryInfo = this.getRecoveryInfo();
    if (!recoveryInfo) {
      throw new Error('No recoverable state found');
    }

    logger.info('Resuming pipeline from saved state', {
      runId: recoveryInfo.runId,
      currentStep: recoveryInfo.currentStep,
      completedSteps: recoveryInfo.completedSteps
    });

    // TODO: Implement resume logic
    // For now, just start a new run
    return await this.run();
  }
}

export default VideoOrchestrator;
