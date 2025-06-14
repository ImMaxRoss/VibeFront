// New hook that uses view models instead of DTOs
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExerciseViewModel, ExerciseFilterModel } from '../models';
import { ExerciseService } from '../services/exerciseService';

interface UseExercisesResult {
  exercises: ExerciseViewModel[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  stats: {
    total: number;
    public: number;
    custom: number;
    favorites: number;
    withEvaluation: number;
    averageDuration: number;
    focusAreaDistribution: Record<string, number>;
  };
  refetch: () => Promise<void>;
  clearError: () => void;
}

export const useExercises = (filters?: Partial<ExerciseFilterModel>): UseExercisesResult => {
  const [exercises, setExercises] = useState<ExerciseViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ExerciseService.getExercises(filters);
      setExercises(result.exercises);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
      setExercises([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stats = useMemo(() => {
    return exercises.length > 0 ? ExerciseService.getExerciseStats(exercises) : {
      total: 0,
      public: 0,
      custom: 0,
      favorites: 0,
      withEvaluation: 0,
      averageDuration: 0,
      focusAreaDistribution: {},
    };
  }, [exercises]);

  return {
    exercises,
    loading,
    error,
    totalCount,
    hasMore,
    stats,
    refetch: fetchExercises,
    clearError,
  };
};

// Specialized hooks for specific use cases
export const usePopularExercises = (limit: number = 10) => {
  const [exercises, setExercises] = useState<ExerciseViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopular = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getPopularExercises(limit);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load popular exercises');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return { 
    exercises, 
    loading, 
    error,
    refetch: fetchPopular 
  };
};

export const useExerciseById = (id: string | null) => {
  const [exercise, setExercise] = useState<ExerciseViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!id) {
      setExercise(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getExerciseById(id);
      setExercise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercise');
      setExercise(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return { 
    exercise, 
    loading, 
    error,
    refetch: fetchExercise 
  };
};

export const useLessonPlanningExercises = () => {
  const [exercises, setExercises] = useState<ExerciseViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getForLessonPlanning();
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return { 
    exercises, 
    loading, 
    error,
    refetch: fetchExercises 
  };
};

// Hook for exercise creation/editing
export const useExerciseForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExercise = useCallback(async (form: ExerciseViewModel) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ExerciseService.createExercise(form as any); // TODO: Fix form model
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExercise = useCallback(async (id: string, form: ExerciseViewModel) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ExerciseService.updateExercise(id, form as any); // TODO: Fix form model
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExercise = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await ExerciseService.deleteExercise(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateExercise = useCallback(async (id: string, newName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ExerciseService.duplicateExercise(id, newName);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate exercise');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    duplicateExercise,
    clearError: () => setError(null),
  };
};