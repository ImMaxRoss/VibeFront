// src/utils/index.ts
export * as practiceHelpers from './practiceHelpers';

// Re-export individual helper functions for convenience
export { 
  formatDuration, 
  getScoreColor, 
  getScoreLabel, 
  calculateSessionProgress, 
  generatePracticeId 
} from './practiceHelpers';