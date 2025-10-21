import fs from 'fs/promises';
import path from 'path';
import logger from './utils/logger.js';

/**
 * State Manager - Manages pipeline state with persistence
 * Allows recovery from failures and tracking progress
 */
export class StateManager {
  constructor(stateFilePath = './pipeline_state.json') {
    this.stateFilePath = stateFilePath;
    this.state = {
      runId: null,
      startTime: null,
      currentStep: null,
      status: 'idle', // idle, running, completed, failed
      data: {},
      history: []
    };
  }

  /**
   * Initialize a new pipeline run
   */
  async initRun(runId = null) {
    this.state = {
      runId: runId || `run_${Date.now()}`,
      startTime: new Date().toISOString(),
      currentStep: null,
      status: 'running',
      data: {},
      history: []
    };

    await this.save();
    logger.info('New pipeline run initialized', { runId: this.state.runId });
    return this.state.runId;
  }

  /**
   * Set current pipeline step
   */
  async setStep(stepName) {
    this.state.currentStep = stepName;
    this.state.history.push({
      step: stepName,
      timestamp: new Date().toISOString(),
      status: 'started'
    });

    await this.save();
    logger.info(`Pipeline step: ${stepName}`, { runId: this.state.runId });
  }

  /**
   * Set state data for a specific key
   */
  async set(key, value) {
    this.state.data[key] = value;
    await this.save();
    logger.debug(`State updated: ${key}`, { runId: this.state.runId });
  }

  /**
   * Get state data by key
   */
  get(key) {
    return this.state.data[key];
  }

  /**
   * Get all state data
   */
  getAll() {
    return { ...this.state.data };
  }

  /**
   * Mark step as completed
   */
  async completeStep(stepName, success = true, error = null) {
    const historyEntry = {
      step: stepName,
      timestamp: new Date().toISOString(),
      status: success ? 'completed' : 'failed',
      error: error ? error.message : null
    };

    this.state.history.push(historyEntry);
    await this.save();

    logger.info(`Step ${success ? 'completed' : 'failed'}: ${stepName}`, {
      runId: this.state.runId,
      error: error?.message
    });
  }

  /**
   * Mark entire pipeline as completed
   */
  async complete(success = true, error = null) {
    this.state.status = success ? 'completed' : 'failed';
    this.state.endTime = new Date().toISOString();
    this.state.duration = new Date() - new Date(this.state.startTime);

    if (error) {
      this.state.error = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
    }

    await this.save();
    logger.info(`Pipeline ${success ? 'completed' : 'failed'}`, {
      runId: this.state.runId,
      duration: `${(this.state.duration / 1000).toFixed(2)}s`
    });
  }

  /**
   * Save state to file
   */
  async save() {
    try {
      const stateJson = JSON.stringify(this.state, null, 2);
      await fs.writeFile(this.stateFilePath, stateJson, 'utf-8');
      logger.debug('State saved to file', { path: this.stateFilePath });
    } catch (error) {
      logger.error('Failed to save state', { error: error.message });
      throw error;
    }
  }

  /**
   * Load state from file
   */
  async load() {
    try {
      const stateJson = await fs.readFile(this.stateFilePath, 'utf-8');
      this.state = JSON.parse(stateJson);
      logger.info('State loaded from file', {
        runId: this.state.runId,
        status: this.state.status
      });
      return this.state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No existing state file found');
        return null;
      }
      logger.error('Failed to load state', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if there's a recoverable state
   */
  async canRecover() {
    try {
      const state = await this.load();
      return state && state.status === 'running';
    } catch {
      return false;
    }
  }

  /**
   * Get recovery information
   */
  getRecoveryInfo() {
    if (this.state.status !== 'running') {
      return null;
    }

    return {
      runId: this.state.runId,
      currentStep: this.state.currentStep,
      startTime: this.state.startTime,
      completedSteps: this.state.history
        .filter(h => h.status === 'completed')
        .map(h => h.step),
      failedSteps: this.state.history
        .filter(h => h.status === 'failed')
        .map(h => h.step)
    };
  }

  /**
   * Clear state file
   */
  async clear() {
    try {
      await fs.unlink(this.stateFilePath);
      logger.info('State file cleared');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.error('Failed to clear state file', { error: error.message });
      }
    }
  }

  /**
   * Reset state to idle
   */
  reset() {
    this.state = {
      runId: null,
      startTime: null,
      currentStep: null,
      status: 'idle',
      data: {},
      history: []
    };
    logger.info('State reset to idle');
  }

  /**
   * Get state summary
   */
  getSummary() {
    return {
      runId: this.state.runId,
      status: this.state.status,
      currentStep: this.state.currentStep,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      steps: this.state.history.length,
      dataKeys: Object.keys(this.state.data)
    };
  }
}

export default StateManager;
