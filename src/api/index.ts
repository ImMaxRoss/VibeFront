// src/api/index.ts - Add this export to your existing API exports

export { authAPI } from './modules/auth';
export { exercisesAPI } from './modules/exercises';
export { lessonsAPI } from './modules/lessons';
export { teamsAPI } from './modules/teams';
export { performersAPI } from './modules/teams'; // assuming performers are in teams module
export { evaluationsAPI } from './modules/evaluations';
export { practiceAPI } from './modules/practice';
export { attendanceAPI } from './modules/attendance'; // if you have this
export { analyticsAPI } from './modules/analytics'; // if you have this
export { practiceHistoryAPI } from './modules/practiceHistory'; // Add this line

// Also export types if needed
export type {
  PracticeHistoryEntry,
  PracticeSessionDetailDTO,
  PracticeHistoryFilter,
  PracticeHistoryStats,
  PracticeSessionHistory
} from './modules/practiceHistory';