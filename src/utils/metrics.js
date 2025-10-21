import logger from './logger.js';

/**
 * Pipeline metrics tracker
 * Tracks execution time, success rates, and performance metrics
 */
export class MetricsTracker {
  constructor() {
    this.metrics = {
      pipelineRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      stages: {},
      totalDuration: 0,
      averageDuration: 0
    };
    this.currentRun = null;
  }

  /**
   * Start tracking a new pipeline run
   */
  startRun() {
    this.currentRun = {
      id: `run_${Date.now()}`,
      startTime: Date.now(),
      stages: {},
      success: false
    };
    this.metrics.pipelineRuns++;
    logger.info('Pipeline run started', { runId: this.currentRun.id });
  }

  /**
   * Start tracking a pipeline stage
   */
  startStage(stageName) {
    if (!this.currentRun) {
      logger.warn('No active run to track stage', { stageName });
      return;
    }

    this.currentRun.stages[stageName] = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
      success: false,
      error: null
    };

    logger.info(`Stage started: ${stageName}`);
  }

  /**
   * End tracking a pipeline stage
   */
  endStage(stageName, success = true, error = null) {
    if (!this.currentRun || !this.currentRun.stages[stageName]) {
      logger.warn('No active stage to end', { stageName });
      return;
    }

    const stage = this.currentRun.stages[stageName];
    stage.endTime = Date.now();
    stage.duration = stage.endTime - stage.startTime;
    stage.success = success;
    stage.error = error;

    // Update global stage metrics
    if (!this.metrics.stages[stageName]) {
      this.metrics.stages[stageName] = {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        totalDuration: 0,
        averageDuration: 0
      };
    }

    const stageMetrics = this.metrics.stages[stageName];
    stageMetrics.totalRuns++;
    stageMetrics.totalDuration += stage.duration;
    stageMetrics.averageDuration = stageMetrics.totalDuration / stageMetrics.totalRuns;

    if (success) {
      stageMetrics.successfulRuns++;
    } else {
      stageMetrics.failedRuns++;
    }

    logger.info(`Stage completed: ${stageName}`, {
      duration: `${(stage.duration / 1000).toFixed(2)}s`,
      success
    });
  }

  /**
   * End tracking the current pipeline run
   */
  endRun(success = true) {
    if (!this.currentRun) {
      logger.warn('No active run to end');
      return;
    }

    this.currentRun.endTime = Date.now();
    this.currentRun.duration = this.currentRun.endTime - this.currentRun.startTime;
    this.currentRun.success = success;

    // Update global metrics
    this.metrics.totalDuration += this.currentRun.duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.pipelineRuns;

    if (success) {
      this.metrics.successfulRuns++;
    } else {
      this.metrics.failedRuns++;
    }

    logger.info('Pipeline run completed', {
      runId: this.currentRun.id,
      duration: `${(this.currentRun.duration / 1000).toFixed(2)}s`,
      success,
      stages: Object.keys(this.currentRun.stages).length
    });

    // Archive the run
    const runSummary = { ...this.currentRun };
    this.currentRun = null;

    return runSummary;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.pipelineRuns > 0
        ? ((this.metrics.successfulRuns / this.metrics.pipelineRuns) * 100).toFixed(2) + '%'
        : '0%',
      averageDurationSeconds: (this.metrics.averageDuration / 1000).toFixed(2)
    };
  }

  /**
   * Get detailed stage metrics
   */
  getStageMetrics(stageName) {
    return this.metrics.stages[stageName] || null;
  }

  /**
   * Log current metrics
   */
  logMetrics() {
    const metrics = this.getMetrics();
    logger.info('Pipeline Metrics', { metrics });
    return metrics;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      pipelineRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      stages: {},
      totalDuration: 0,
      averageDuration: 0
    };
    this.currentRun = null;
    logger.info('Metrics reset');
  }
}

export default new MetricsTracker();
