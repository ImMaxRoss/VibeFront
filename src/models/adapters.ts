// Adapters - Transform between backend DTOs and frontend view models

import {
  Exercise,
  ExerciseResponse,
  ExerciseSummaryResponse,
  Team,
  PracticeSessionDetailDTO,
  Lesson,
  ExerciseEvaluation,
  FocusArea,
  LessonExercise,
  PracticeSessionHistory,
} from '../types';

import {
  ExerciseViewModel,
  TeamViewModel,
  PracticeSessionViewModel,
  LessonViewModel,
  EvaluationViewModel,
  ExerciseFormModel,
  LessonFormModel,
} from './viewModels';

// Utility functions
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else {
    const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return `In ${daysDiff} days`;
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
};

const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
};

// Exercise Adapters
export class ExerciseAdapter {
  static toViewModel(dto: Exercise | ExerciseResponse | ExerciseSummaryResponse): ExerciseViewModel {
    const author = ('createdByCoachName' in dto ? dto.createdByCoachName : null) || ('sourceLabel' in dto ? dto.sourceLabel : null);
    const isPublic = 'public' in dto ? (dto.public ?? false) : false;
    const isFavorite = 'favorite' in dto ? (dto.favorite ?? false) : false;
    const isPopular = 'popular' in dto ? (dto.popular ?? false) : false;
    const usageCount = 'usageCount' in dto ? (dto.usageCount ?? 0) : 0;

    const statusBadges: string[] = [];
    if (isPopular) statusBadges.push('Popular');
    if (isFavorite) statusBadges.push('Favorite');

    const sourceLabel = isPublic 
      ? 'Public'
      : author 
        ? `Created by ${author}`
        : 'Custom';

    return {
      id: dto.id.toString(),
      title: dto.name,
      description: ('description' in dto ? dto.description : '') || '',
      duration: {
        minutes: dto.minimumDurationMinutes,
        formatted: ('formattedMinimumDuration' in dto ? dto.formattedMinimumDuration : null) || formatDuration(dto.minimumDurationMinutes),
        isMinimum: true,
      },
      focusAreas: (dto.focusAreas || []).map(fa => ({
        id: fa.id.toString(),
        name: fa.name,
        color: fa.colorCode || '#6B7280',
      })),
      metadata: {
        author: author || null,
        isPublic,
        isFavorite,
        isPopular,
        usageCount,
      },
      evaluation: {
        hasTemplate: 'hasDefaultEvaluationTemplate' in dto ? (dto.hasDefaultEvaluationTemplate ?? false) : false,
        templateName: 'defaultEvaluationTemplateName' in dto ? (dto.defaultEvaluationTemplateName || null) : null,
      },
      display: {
        sourceLabel,
        statusBadges,
        searchableText: `${dto.name} ${('description' in dto ? dto.description : '') || ''} ${(dto.focusAreas || []).map(fa => fa.name).join(' ')}`.toLowerCase(),
      },
    };
  }

  static fromFormModel(form: ExerciseFormModel): any {
    return {
      name: form.name,
      description: form.description,
      minimumDurationMinutes: form.minimumDuration,
      focusAreaIds: form.selectedFocusAreas.map(id => parseInt(id)),
      public: form.isPublic,
      evaluationTemplateName: form.evaluationTemplate.create ? form.evaluationTemplate.name : undefined,
      evaluationCriteria: form.evaluationTemplate.create ? form.evaluationTemplate.criteria : undefined,
    };
  }

  static toFormModel(dto: Exercise | ExerciseResponse): ExerciseFormModel {
    return {
      name: dto.name,
      description: dto.description,
      minimumDuration: dto.minimumDurationMinutes,
      selectedFocusAreas: (dto.focusAreas || []).map(fa => fa.id.toString()),
      isPublic: 'public' in dto ? (dto.public ?? false) : false,
      evaluationTemplate: {
        create: false,
        name: '',
        criteria: [],
      },
      validation: {
        isValid: true,
        errors: {},
      },
    };
  }
}

// Team Adapters
export class TeamAdapter {
  static toViewModel(dto: Team): TeamViewModel {
    const memberCount = dto.performerCount || 0;
    const nextLessonDate = dto.nextLessonDate ? new Date(dto.nextLessonDate) : null;
    
    return {
      id: dto.id.toString(),
      name: dto.name,
      description: dto.description || null,
      members: {
        count: memberCount,
        list: (dto.performers || []).map(p => ({
          id: p.id.toString(),
          displayName: `${p.firstName} ${p.lastName}`,
        })),
      },
      activity: {
        upcomingLessonsCount: dto.upcomingLessonsCount || 0,
        nextLessonDate,
        nextLessonFormatted: nextLessonDate ? formatRelativeDate(nextLessonDate) : null,
      },
      display: {
        memberSummary: memberCount === 1 ? '1 member' : `${memberCount} members`,
        statusText: nextLessonDate 
          ? `Next lesson: ${formatRelativeDate(nextLessonDate)}`
          : dto.upcomingLessonsCount > 0
            ? `${dto.upcomingLessonsCount} upcoming lessons`
            : 'No upcoming lessons',
        isEmpty: memberCount === 0,
      },
    };
  }
}

// Practice Session Adapters
export class PracticeSessionAdapter {
  static toDetailViewModel(dto: any): PracticeSessionViewModel {
    // Handle PracticeSessionDetailDTO specifically
    const startTime = new Date(dto.startTime);
    const endTime = dto.endTime ? new Date(dto.endTime) : null;
    const isActive = !endTime;
    
    let duration: number | null = null;
    if (endTime) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    }

    const attendees = dto.attendees || [];
    const evaluations = dto.evaluations || [];
    const notes = dto.notes || [];

    return {
      id: dto.id.toString(),
      lesson: {
        id: dto.lessonId.toString(),
        name: dto.lessonName,
      },
      team: null, // Not included in detail DTO
      timing: {
        startTime,
        endTime,
        duration,
        isActive,
        formattedDuration: duration ? formatDuration(duration) : 'In progress',
        formattedDate: startTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      },
      participants: {
        total: attendees.length,
        attendees: attendees.map((a: any) => ({
          id: a.performerId.toString(),
          displayName: a.performerFirstName,
        })),
      },
      progress: {
        currentExerciseIndex: dto.currentExerciseIndex || 0,
        totalExercises: 0, // Would need to be calculated separately
        percentComplete: 0,
        currentExerciseName: dto.currentExerciseName || null,
      },
      metrics: {
        evaluationCount: evaluations.length,
        noteCount: notes.length,
      },
      display: {
        statusText: isActive ? 'In Progress' : duration ? formatDuration(duration) + ' session' : 'Completed',
        participantSummary: attendees.length === 1 ? '1 participant' : `${attendees.length} participants`,
        progressText: 'Session details',
      },
    };
  }

  static toViewModel(dto: PracticeSessionDetailDTO | PracticeSessionHistory): PracticeSessionViewModel {
    const startTime = new Date(dto.startTime);
    const endTime = dto.endTime ? new Date(dto.endTime) : null;
    const isActive = !endTime;
    
    let duration: number | null = null;
    if ('duration' in dto) {
      duration = dto.duration;
    } else if (endTime) {
      duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    }

    const attendees = 'attendees' in dto ? dto.attendees : [];
    const attendeeCount = 'attendeeCount' in dto ? dto.attendeeCount : attendees.length;
    
    const evaluationCount = 'evaluationCount' in dto ? dto.evaluationCount : 
                           'evaluations' in dto ? dto.evaluations?.length || 0 : 0;
    
    const noteCount = 'noteCount' in dto ? dto.noteCount :
                     'notes' in dto ? dto.notes?.length || 0 : 0;

    return {
      id: dto.id.toString(),
      lesson: {
        id: dto.lessonId.toString(),
        name: dto.lessonName,
      },
      team: 'teamName' in dto && dto.teamName ? {
        id: 'unknown', // Not available in current DTOs
        name: dto.teamName,
      } : null,
      timing: {
        startTime,
        endTime,
        duration,
        isActive,
        formattedDuration: duration ? formatDuration(duration) : 'In progress',
        formattedDate: startTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      },
      participants: {
        total: attendeeCount,
        attendees: attendees.map(a => ({
          id: a.performerId.toString(),
          displayName: `${a.performerFirstName} ${a.performerLastName}`,
        })),
      },
      progress: {
        currentExerciseIndex: 'currentExerciseIndex' in dto ? dto.currentExerciseIndex : 0,
        totalExercises: 'exerciseCount' in dto ? dto.exerciseCount : 0,
        percentComplete: 'exerciseCount' in dto && 'currentExerciseIndex' in dto && dto.exerciseCount > 0 
          ? Math.round(((dto.currentExerciseIndex as number) / dto.exerciseCount) * 100) 
          : 0,
        currentExerciseName: 'currentExerciseName' in dto ? dto.currentExerciseName || null : null,
      },
      metrics: {
        evaluationCount,
        noteCount,
      },
      display: {
        statusText: isActive ? 'In Progress' : duration ? formatDuration(duration) + ' session' : 'Completed',
        participantSummary: attendeeCount === 1 ? '1 participant' : `${attendeeCount} participants`,
        progressText: 'exerciseCount' in dto && 'currentExerciseIndex' in dto && dto.exerciseCount > 0 
          ? `Exercise ${(dto.currentExerciseIndex as number) + 1} of ${dto.exerciseCount}`
          : 'Not started',
      },
    };
  }
}

// Lesson Adapters
export class LessonAdapter {
  static toViewModel(dto: Lesson): LessonViewModel {
    const scheduledDate = dto.scheduledDate ? new Date(dto.scheduledDate) : null;
    const now = new Date();
    const isUpcoming = scheduledDate ? scheduledDate > now : false;
    const isPast = scheduledDate ? scheduledDate < now : false;
    
    const exercises = dto.exercises || [];
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.plannedDurationMinutes, 0);
    
    // Extract primary focus areas
    const focusAreaBreakdown = dto.focusAreaBreakdown || {};
    const primaryFocusAreas = Object.entries(focusAreaBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    return {
      id: dto.id.toString(),
      name: dto.name,
      team: dto.teamId && dto.teamName ? {
        id: dto.teamId.toString(),
        name: dto.teamName,
      } : null,
      scheduling: {
        scheduledDate,
        isScheduled: !!scheduledDate,
        isUpcoming,
        isPast,
        formattedDate: scheduledDate ? scheduledDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }) : null,
        relativeDate: scheduledDate ? formatRelativeDate(scheduledDate) : null,
      },
      exercises: {
        count: exercises.length,
        totalDuration,
        formattedDuration: formatDuration(totalDuration),
        list: exercises.map(ex => ({
          id: ex.exerciseId.toString(),
          name: ex.exerciseName,
          duration: ex.plannedDurationMinutes,
          order: ex.orderIndex,
        })),
      },
      focusAreas: {
        breakdown: focusAreaBreakdown,
        primary: primaryFocusAreas,
      },
      metadata: {
        isTemplate: dto.template || false,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
        updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      },
      display: {
        summaryText: `${exercises.length} exercises, ${formatDuration(totalDuration)}`,
        statusText: scheduledDate 
          ? `Scheduled for ${formatRelativeDate(scheduledDate)}`
          : 'Not scheduled',
        focusAreaSummary: primaryFocusAreas.join(', ') || 'No focus areas',
      },
    };
  }

  static fromFormModel(form: LessonFormModel): any {
    return {
      name: form.name,
      teamId: form.teamId ? parseInt(form.teamId) : null,
      scheduledDate: form.scheduledDate,
      exercises: form.exercises.map(ex => ({
        exerciseId: parseInt(ex.id),
        plannedDurationMinutes: ex.plannedDuration,
        orderIndex: ex.order,
      })),
    };
  }

  static toFormModel(dto: Lesson): LessonFormModel {
    const exercises = dto.exercises || [];
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.plannedDurationMinutes, 0);
    
    return {
      name: dto.name,
      teamId: dto.teamId?.toString() || null,
      scheduledDate: dto.scheduledDate || null,
      exercises: exercises.map(ex => ({
        id: ex.exerciseId.toString(),
        plannedDuration: ex.plannedDurationMinutes,
        order: ex.orderIndex,
      })),
      validation: {
        isValid: true,
        errors: {},
        warnings: [],
      },
      computed: {
        totalDuration,
        formattedDuration: formatDuration(totalDuration),
        focusAreaBreakdown: dto.focusAreaBreakdown || {},
      },
    };
  }
}

// Evaluation Adapters
export class EvaluationAdapter {
  static toViewModel(dto: ExerciseEvaluation): EvaluationViewModel {
    const scores = dto.evaluationScores || [];
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const maxTotalScore = scores.length * 4; // Assuming max score of 4 per criterion
    const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

    return {
      id: dto.id.toString(),
      session: {
        id: dto.practiceSessionId?.toString() || 'unknown',
        lessonName: 'Unknown Lesson', // Would need to be passed separately
        date: new Date(dto.evaluatedAt),
      },
      exercise: {
        id: dto.lessonExerciseId?.toString() || 'unknown',
        name: dto.exerciseName || 'Unknown Exercise',
      },
      participants: dto.evaluatedPerformers?.map(p => ({
        id: p.id?.toString() || 'unknown',
        displayName: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
      })) || [],
      scores: {
        criteria: scores.map(score => ({
          id: score.criterionName.toLowerCase().replace(/\s+/g, '_'),
          name: score.criterionName,
          score: score.score,
          maxScore: 4, // Assuming max score of 4
          percentage: Math.round((score.score / 4) * 100),
        })),
        overall: {
          total: totalScore,
          maxTotal: maxTotalScore,
          percentage,
          grade: getGradeFromPercentage(percentage),
        },
      },
      feedback: {
        notes: dto.notes || '',
        strengths: [], // Would need to be extracted from notes or separate field
        improvements: [], // Would need to be extracted from notes or separate field
      },
      display: {
        summaryText: `Scene Evaluation - ${percentage}%`,
        participantText: dto.evaluatedPerformers?.map(p => p.firstName).join(' & ') || 'Unknown',
        scoreBreakdown: scores.slice(0, 3).map(s => `${s.criterionName}: ${s.score}/4`).join(', '),
      },
    };
  }
}