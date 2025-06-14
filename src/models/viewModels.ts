// View Models - UI-optimized data structures independent of backend DTOs

export interface ExerciseViewModel {
  id: string;
  title: string;
  description: string;
  duration: {
    minutes: number;
    formatted: string;
    isMinimum: boolean;
  };
  focusAreas: {
    id: string;
    name: string;
    color: string;
  }[];
  metadata: {
    author: string | null;
    isPublic: boolean;
    isFavorite: boolean;
    isPopular: boolean;
    usageCount: number;
  };
  evaluation: {
    hasTemplate: boolean;
    templateName: string | null;
  };
  display: {
    sourceLabel: string; // "Public", "Custom", "Created by John"
    statusBadges: string[]; // ["Popular", "Favorite"]
    searchableText: string; // Combined text for filtering
  };
}

export interface TeamViewModel {
  id: string;
  name: string;
  description: string | null;
  members: {
    count: number;
    list: {
      id: string;
      displayName: string;
    }[];
  };
  activity: {
    upcomingLessonsCount: number;
    nextLessonDate: Date | null;
    nextLessonFormatted: string | null;
  };
  display: {
    memberSummary: string; // "5 members"
    statusText: string; // "Next lesson: Tomorrow at 7pm"
    isEmpty: boolean;
  };
}

export interface PracticeSessionViewModel {
  id: string;
  lesson: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
  } | null;
  timing: {
    startTime: Date;
    endTime: Date | null;
    duration: number | null; // minutes
    isActive: boolean;
    formattedDuration: string;
    formattedDate: string;
  };
  participants: {
    total: number;
    attendees: {
      id: string;
      displayName: string;
    }[];
  };
  progress: {
    currentExerciseIndex: number;
    totalExercises: number;
    percentComplete: number;
    currentExerciseName: string | null;
  };
  metrics: {
    evaluationCount: number;
    noteCount: number;
  };
  display: {
    statusText: string; // "In Progress", "Completed", "45 min session"
    participantSummary: string; // "8 participants"
    progressText: string; // "Exercise 3 of 7"
  };
}

export interface LessonViewModel {
  id: string;
  name: string;
  team: {
    id: string;
    name: string;
  } | null;
  scheduling: {
    scheduledDate: Date | null;
    isScheduled: boolean;
    isUpcoming: boolean;
    isPast: boolean;
    formattedDate: string | null;
    relativeDate: string | null; // "Tomorrow", "In 3 days"
  };
  exercises: {
    count: number;
    totalDuration: number;
    formattedDuration: string;
    list: {
      id: string;
      name: string;
      duration: number;
      order: number;
    }[];
  };
  focusAreas: {
    breakdown: Record<string, number>; // minutes per focus area
    primary: string[]; // top 3 focus areas
  };
  metadata: {
    isTemplate: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  display: {
    summaryText: string; // "7 exercises, 90 minutes"
    statusText: string; // "Scheduled for Tomorrow at 7pm"
    focusAreaSummary: string; // "Yes And, Listening, Physicality"
  };
}

export interface EvaluationViewModel {
  id: string;
  session: {
    id: string;
    lessonName: string;
    date: Date;
  };
  exercise: {
    id: string;
    name: string;
  };
  participants: {
    id: string;
    displayName: string;
  }[];
  scores: {
    criteria: {
      id: string;
      name: string;
      score: number;
      maxScore: number;
      percentage: number;
    }[];
    overall: {
      total: number;
      maxTotal: number;
      percentage: number;
      grade: string; // "A", "B+", etc.
    };
  };
  feedback: {
    notes: string;
    strengths: string[];
    improvements: string[];
  };
  display: {
    summaryText: string; // "Scene Evaluation - 85%"
    participantText: string; // "John & Sarah"
    scoreBreakdown: string; // "Yes And: 4/4, Listening: 3/4"
  };
}

// Form Models - Separate from API DTOs to allow independent validation and UI logic
export interface ExerciseFormModel {
  name: string;
  description: string;
  minimumDuration: number;
  selectedFocusAreas: string[];
  isPublic: boolean;
  evaluationTemplate: {
    create: boolean;
    name: string;
    criteria: {
      name: string;
      description: string;
      maxScore: number;
    }[];
  };
  validation: {
    isValid: boolean;
    errors: Record<string, string>;
  };
}

export interface LessonFormModel {
  name: string;
  teamId: string | null;
  scheduledDate: string | null; // ISO string
  exercises: {
    id: string;
    plannedDuration: number;
    order: number;
  }[];
  validation: {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: string[];
  };
  computed: {
    totalDuration: number;
    formattedDuration: string;
    focusAreaBreakdown: Record<string, number>;
  };
}

// Filter Models - UI-specific filtering state
export interface ExerciseFilterModel {
  searchTerm: string;
  selectedFocusAreas: string[];
  durationRange: {
    min: number | null;
    max: number | null;
  };
  source: 'all' | 'public' | 'custom' | 'favorites';
  difficulty: string | null;
  groupSize: string | null;
  hasEvaluation: boolean | null;
  sortBy: 'name' | 'popularity' | 'duration' | 'created';
  sortDirection: 'asc' | 'desc';
  activeFilters: {
    count: number;
    summary: string; // "3 filters active"
  };
}

export interface PracticeHistoryFilterModel {
  teamId: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: 'week' | 'month' | 'quarter' | 'year' | 'custom' | null;
  };
  pagination: {
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  activeFilters: {
    count: number;
    summary: string;
  };
}