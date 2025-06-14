// src/api/modules/practiceHistory.ts
import { api } from '../service';
import { shouldUseMockFallback } from '../config';

// Re-using existing types from the swagger schema
export interface PracticeSessionDetailDTO {
  id: number;
  lessonId: number;
  lessonName: string;
  startTime: string;
  endTime?: string;
  currentExerciseIndex: number;
  currentExerciseId?: number;
  currentExerciseName?: string;
  attendeeIds: number[];
  createdAt: string;
  updatedAt: string;
  attendees: AttendanceResponse[];
  notes: PracticeNoteResponse[];
  evaluations: ExerciseEvaluation[];
}

export interface AttendanceResponse {
  practiceSessionId: number;
  performerId: number;
  performerFirstName: string;
  performerLastName: string;
}

export interface PracticeNoteResponse {
  id: number;
  lessonId: number;
  practiceSessionId?: number;
  noteType: string;
  content: string;
  createdAt: string;
}

export interface ExerciseEvaluation {
  id: number;
  practiceSession?: any; // Simplified - full session object
  lessonExercise?: any; // Simplified - full lesson exercise object
  evaluatedPerformers: any[]; // Array of performers
  evaluationScores: Array<{
    exerciseEvaluation?: any;
    criterionName: string;
    score: number;
  }>;
  notes?: string;
  evaluatedAt: string;
}

// New interface for the completed sessions endpoint
export interface PracticeSessionHistory {
  id: number;
  lessonId: number;
  lessonName: string;
  teamName?: string;
  startTime: string;
  endTime?: string;
  duration: number; // calculated field in minutes
  attendeeCount: number; // calculated field
  evaluationCount: number; // calculated field
  noteCount: number; // calculated field
  exerciseCount: number; // calculated field
}

// Derived interface for listing completed sessions (alias for backward compatibility)
export interface PracticeHistoryEntry {
  id: number;
  lessonId: number;
  lessonName: string;
  teamName?: string;
  sessionDate: string; // This maps to startTime from PracticeSessionHistory
  duration: number; // calculated from startTime/endTime in minutes
  attendeeCount: number;
  evaluationCount: number;
  noteCount: number;
  exerciseCount: number;
}

export interface PracticeHistoryFilter {
  teamId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface PracticeHistoryStats {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  totalAttendees: number;
  averageAttendees: number;
  totalEvaluations: number;
  totalNotes: number;
}

// Mock data for development fallback
const MOCK_PRACTICE_HISTORY: PracticeHistoryEntry[] = [
  {
    id: 1,
    lessonId: 101,
    lessonName: "Tuesday Night Practice",
    teamName: "The Improvers",
    sessionDate: "2024-12-10T19:00:00Z",
    duration: 120,
    attendeeCount: 8,
    evaluationCount: 12,
    noteCount: 5,
    exerciseCount: 6
  },
  {
    id: 2,
    lessonId: 102,
    lessonName: "Advanced Scene Work",
    teamName: "Comedy Collective",
    sessionDate: "2024-12-08T18:30:00Z",
    duration: 120,
    attendeeCount: 6,
    evaluationCount: 8,
    noteCount: 3,
    exerciseCount: 4
  },
  {
    id: 3,
    lessonId: 103,
    lessonName: "Beginner Workshop",
    sessionDate: "2024-12-05T19:00:00Z",
    duration: 90,
    attendeeCount: 12,
    evaluationCount: 6,
    noteCount: 8,
    exerciseCount: 5
  }
];

const MOCK_SESSION_DETAIL: PracticeSessionDetailDTO = {
  id: 1,
  lessonId: 101,
  lessonName: "Tuesday Night Practice",
  startTime: "2024-12-10T19:00:00Z",
  endTime: "2024-12-10T21:00:00Z",
  currentExerciseIndex: 6,
  currentExerciseId: 1,
  currentExerciseName: "Zip Zap Zop",
  attendeeIds: [1, 2, 3, 4, 5, 6, 7, 8],
  createdAt: "2024-12-10T19:00:00Z",
  updatedAt: "2024-12-10T21:00:00Z",
  attendees: [
    { practiceSessionId: 1, performerId: 1, performerFirstName: "John", performerLastName: "Doe" },
    { practiceSessionId: 1, performerId: 2, performerFirstName: "Jane", performerLastName: "Smith" },
    { practiceSessionId: 1, performerId: 3, performerFirstName: "Bob", performerLastName: "Johnson" },
    { practiceSessionId: 1, performerId: 4, performerFirstName: "Alice", performerLastName: "Wilson" },
    { practiceSessionId: 1, performerId: 5, performerFirstName: "Charlie", performerLastName: "Brown" },
    { practiceSessionId: 1, performerId: 6, performerFirstName: "Diana", performerLastName: "Davis" },
    { practiceSessionId: 1, performerId: 7, performerFirstName: "Eve", performerLastName: "Miller" },
    { practiceSessionId: 1, performerId: 8, performerFirstName: "Frank", performerLastName: "Garcia" }
  ],
  notes: [
    {
      id: 1,
      lessonId: 101,
      practiceSessionId: 1,
      noteType: "exercise",
      content: "Great energy in the warm-up exercises. Everyone was engaged and listening well.",
      createdAt: "2024-12-10T19:15:00Z"
    },
    {
      id: 2,
      lessonId: 101,
      practiceSessionId: 1,
      noteType: "overall",
      content: "Team is showing improvement in agreement and physicality. Need to work on game identification.",
      createdAt: "2024-12-10T20:30:00Z"
    }
  ],
  evaluations: [
    {
      id: 1,
      evaluatedPerformers: [
        { id: 1, firstName: "John", lastName: "Doe" },
        { id: 2, firstName: "Jane", lastName: "Smith" }
      ],
      evaluationScores: [
        { criterionName: "yes_and", score: 3 },
        { criterionName: "agreement", score: 4 },
        { criterionName: "who_what_where", score: 3 },
        { criterionName: "physicality", score: 2 },
        { criterionName: "listening", score: 4 },
        { criterionName: "commitment", score: 3 },
        { criterionName: "avoidance_of_denial", score: 4 },
        { criterionName: "efficiency", score: 3 }
      ],
      notes: "Strong scene with good character development. Could improve on establishing environment earlier.",
      evaluatedAt: "2024-12-10T19:45:00Z"
    }
  ]
};

export const practiceHistoryAPI = {
  // Get completed practice sessions using the new endpoint
  getHistory: async (filters?: PracticeHistoryFilter): Promise<PracticeHistoryEntry[]> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('completed', 'true');
      
      if (filters?.teamId) {
        queryParams.append('teamId', filters.teamId.toString());
      }
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      if (filters?.offset) {
        queryParams.append('offset', filters.offset.toString());
      }

      const url = `/practice/sessions?${queryParams.toString()}`;
      const sessions = await api.get<PracticeSessionHistory[]>(url);
      
      // Convert PracticeSessionHistory to PracticeHistoryEntry format
      return sessions.map(session => ({
        id: session.id,
        lessonId: session.lessonId,
        lessonName: session.lessonName,
        teamName: session.teamName,
        sessionDate: session.startTime, // Map startTime to sessionDate
        duration: session.duration,
        attendeeCount: session.attendeeCount,
        evaluationCount: session.evaluationCount,
        noteCount: session.noteCount,
        exerciseCount: session.exerciseCount
      }));
    } catch (error) {
      console.error('Failed to fetch practice history:', error);
      if (shouldUseMockFallback(error as Error)) {
        console.warn('Using mock practice history data for development');
        
        // Apply basic filtering to mock data
        let filteredData = [...MOCK_PRACTICE_HISTORY];
        
        if (filters?.teamId) {
          // Simple mock filtering - in reality this would be server-side
          filteredData = filteredData.filter(session => 
            (session.teamName?.toLowerCase().includes('improvers') && filters.teamId === 1) ||
            (session.teamName?.toLowerCase().includes('collective') && filters.teamId === 2)
          );
        }
        
        if (filters?.limit) {
          filteredData = filteredData.slice(0, filters.limit);
        }
        
        return filteredData;
      }
      throw error;
    }
  },

  // Get detailed information about a specific practice session
  // Uses the existing swagger endpoint: GET /api/practice/sessions/{sessionId}
  getSessionDetail: async (sessionId: number): Promise<PracticeSessionDetailDTO> => {
    try {
      return await api.get<PracticeSessionDetailDTO>(`/practice/sessions/${sessionId}`);
    } catch (error) {
      console.error(`Failed to fetch session detail for ${sessionId}:`, error);
      if (shouldUseMockFallback(error as Error)) {
        console.warn('Using mock session detail for development');
        if (sessionId === 1) {
          return MOCK_SESSION_DETAIL;
        }
        throw new Error('Session not found in mock data');
      }
      throw error;
    }
  },

  // Get practice session statistics
  getSessionStats: async (filters?: Omit<PracticeHistoryFilter, 'limit' | 'offset'>): Promise<PracticeHistoryStats> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('stats', 'true');
      
      if (filters?.teamId) {
        queryParams.append('teamId', filters.teamId.toString());
      }
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const url = `/practice/sessions/stats?${queryParams.toString()}`;
      return await api.get<PracticeHistoryStats>(url);
    } catch (error) {
      console.error('Failed to fetch practice stats:', error);
      if (shouldUseMockFallback(error as Error)) {
        console.warn('Using mock practice stats for development');
        
        // Calculate mock stats from sample data
        const sessions = MOCK_PRACTICE_HISTORY;
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalAttendees = sessions.reduce((sum, s) => sum + s.attendeeCount, 0);
        
        return {
          totalSessions: sessions.length,
          totalDuration,
          averageDuration: Math.round(totalDuration / sessions.length),
          totalAttendees,
          averageAttendees: Math.round(totalAttendees / sessions.length),
          totalEvaluations: sessions.reduce((sum, s) => sum + s.evaluationCount, 0),
          totalNotes: sessions.reduce((sum, s) => sum + s.noteCount, 0),
        };
      }
      throw error;
    }
  },

  // Export practice history data
  exportHistory: async (
    format: 'csv' | 'json' = 'csv',
    filters?: PracticeHistoryFilter
  ): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('export', format);
      
      if (filters?.teamId) {
        queryParams.append('teamId', filters.teamId.toString());
      }
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const url = `/practice/sessions/export?${queryParams.toString()}`;
      const response = await fetch(`${api['baseURL']}${url}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Failed to export practice history:', error);
      if (shouldUseMockFallback(error as Error)) {
        console.warn('Generating mock export for development');
        
        // Generate mock CSV data
        const headers = 'Session ID,Lesson Name,Team,Start Time,End Time,Duration (min),Attendees,Evaluations,Notes,Exercises\n';
        const csvData = MOCK_PRACTICE_HISTORY.map(session => [
          session.id,
          `"${session.lessonName}"`,
          `"${session.teamName || 'N/A'}"`,
          session.sessionDate,
          'N/A', // endTime not in mock data
          session.duration,
          session.attendeeCount,
          session.evaluationCount,
          session.noteCount,
          session.exerciseCount
        ].join(',')).join('\n');
        
        return new Blob([headers + csvData], { type: 'text/csv' });
      }
      throw error;
    }
  },

  // Helper function to convert session detail to history entry
  convertSessionToHistoryEntry: (session: PracticeSessionDetailDTO, teamName?: string): PracticeHistoryEntry => {
    const duration = session.endTime 
      ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
      : 0;

    return {
      id: session.id,
      lessonId: session.lessonId,
      lessonName: session.lessonName,
      teamName,
      sessionDate: session.startTime,
      duration,
      attendeeCount: session.attendees.length,
      evaluationCount: session.evaluations.length,
      noteCount: session.notes.length,
      exerciseCount: session.currentExerciseIndex
    };
  },

  // Convert evaluation data from backend format to our expected format
  convertEvaluationData: (backendEvaluation: ExerciseEvaluation) => {
    // Convert the evaluation scores array to a scores object
    const scores: Record<string, number> = {};
    backendEvaluation.evaluationScores.forEach(score => {
      scores[score.criterionName] = score.score;
    });

    return {
      id: backendEvaluation.id,
      lessonExerciseId: 0, // Would need to extract from lessonExercise object
      practiceSessionId: 0, // Would need to extract from practiceSession object  
      performerIds: backendEvaluation.evaluatedPerformers.map((p: any) => p.id),
      scores,
      notes: backendEvaluation.notes || '',
      rubricType: 'base-reality' as const // Default, might need to determine from criteria
    };
  }
};