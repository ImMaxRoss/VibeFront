// New service layer that transforms DTOs to view models
import { ExerciseAdapter, ExerciseViewModel, ExerciseFormModel, ExerciseFilterModel } from '../models';
import { exercisesAPI } from '../api/modules/exercises';
import { Exercise, ExerciseResponse, ExerciseFilter, ExerciseCreateRequest } from '../types';

export class ExerciseService {
  static async getExercises(filters?: Partial<ExerciseFilterModel>): Promise<{
    exercises: ExerciseViewModel[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      // Convert UI filters to API filters
      const apiFilters: ExerciseFilter = {
        searchTerm: filters?.searchTerm || '',
        focusAreaIds: filters?.selectedFocusAreas?.map(id => parseInt(id)) || [],
        maxDuration: filters?.durationRange?.max || undefined,
        minDuration: filters?.durationRange?.min || undefined,
        source: filters?.source || 'all',
        sortBy: filters?.sortBy || 'name',
        sortDirection: filters?.sortDirection?.toUpperCase() as 'ASC' | 'DESC' || 'ASC',
        hasEvaluation: filters?.hasEvaluation ?? undefined,
        difficulty: filters?.difficulty || undefined,
        groupSize: filters?.groupSize || undefined,
      };

      const response = await exercisesAPI.search({
        ...apiFilters,
        page: 0,
        size: 50 // Get a reasonable batch size
      });

      return {
        exercises: response.content.map(dto => ExerciseAdapter.toViewModel(dto)),
        totalCount: response.totalElements,
        hasMore: !response.last
      };
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      throw new Error('Unable to load exercises. Please try again.');
    }
  }

  static async getAllExercises(): Promise<ExerciseViewModel[]> {
    try {
      const dtos = await exercisesAPI.getAll();
      return dtos.map(dto => ExerciseAdapter.toViewModel(dto));
    } catch (error) {
      console.error('Failed to fetch all exercises:', error);
      throw new Error('Unable to load exercises. Please try again.');
    }
  }

  static async getPopularExercises(limit: number = 10): Promise<ExerciseViewModel[]> {
    try {
      const dtos = await exercisesAPI.getPopular(limit);
      return dtos.map(dto => ExerciseAdapter.toViewModel(dto));
    } catch (error) {
      console.error('Failed to fetch popular exercises:', error);
      throw new Error('Unable to load popular exercises. Please try again.');
    }
  }

  static async getExerciseById(id: string): Promise<ExerciseViewModel> {
    try {
      const dto = await exercisesAPI.getById(parseInt(id));
      return ExerciseAdapter.toViewModel(dto);
    } catch (error) {
      console.error(`Failed to fetch exercise ${id}:`, error);
      throw new Error('Exercise not found.');
    }
  }

  static async createExercise(form: ExerciseFormModel): Promise<ExerciseViewModel> {
    try {
      const requestData: ExerciseCreateRequest = ExerciseAdapter.fromFormModel(form);
      const dto = await exercisesAPI.create(requestData);
      return ExerciseAdapter.toViewModel(dto);
    } catch (error) {
      console.error('Failed to create exercise:', error);
      throw new Error('Unable to create exercise. Please check your data and try again.');
    }
  }

  static async updateExercise(id: string, form: ExerciseFormModel): Promise<ExerciseViewModel> {
    try {
      const requestData = ExerciseAdapter.fromFormModel(form);
      const dto = await exercisesAPI.update(parseInt(id), requestData);
      return ExerciseAdapter.toViewModel(dto);
    } catch (error) {
      console.error(`Failed to update exercise ${id}:`, error);
      throw new Error('Unable to update exercise. Please check your data and try again.');
    }
  }

  static async deleteExercise(id: string): Promise<void> {
    try {
      await exercisesAPI.delete(parseInt(id));
    } catch (error) {
      console.error(`Failed to delete exercise ${id}:`, error);
      throw new Error('Unable to delete exercise. Please try again.');
    }
  }

  static async duplicateExercise(id: string, newName?: string): Promise<ExerciseViewModel> {
    try {
      const dto = await exercisesAPI.duplicate(parseInt(id), newName);
      return ExerciseAdapter.toViewModel(dto);
    } catch (error) {
      console.error(`Failed to duplicate exercise ${id}:`, error);
      throw new Error('Unable to duplicate exercise. Please try again.');
    }
  }

  static async getCustomExercises(): Promise<ExerciseViewModel[]> {
    try {
      const dtos = await exercisesAPI.getCustom();
      return dtos.map(dto => ExerciseAdapter.toViewModel(dto));
    } catch (error) {
      console.error('Failed to fetch custom exercises:', error);
      throw new Error('Unable to load custom exercises. Please try again.');
    }
  }

  static async getForLessonPlanning(): Promise<ExerciseViewModel[]> {
    try {
      const dtos = await exercisesAPI.getForLessonPlanning();
      return dtos.map(dto => ExerciseAdapter.toViewModel(dto));
    } catch (error) {
      console.error('Failed to fetch exercises for lesson planning:', error);
      throw new Error('Unable to load exercises for lesson planning. Please try again.');
    }
  }

  // Utility methods for UI operations
  static filterExercises(
    exercises: ExerciseViewModel[], 
    searchTerm: string
  ): ExerciseViewModel[] {
    if (!searchTerm.trim()) return exercises;
    
    const term = searchTerm.toLowerCase();
    return exercises.filter(exercise => 
      exercise.display.searchableText.includes(term)
    );
  }

  static sortExercises(
    exercises: ExerciseViewModel[], 
    sortBy: 'name' | 'popularity' | 'duration' | 'created',
    direction: 'asc' | 'desc' = 'asc'
  ): ExerciseViewModel[] {
    const sorted = [...exercises].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return b.metadata.usageCount - a.metadata.usageCount;
        case 'duration':
          return a.duration.minutes - b.duration.minutes;
        case 'created':
          // Would need created date in view model
          return a.title.localeCompare(b.title); // Fallback
        default:
          return 0;
      }
    });

    return direction === 'desc' ? sorted.reverse() : sorted;
  }

  static groupByFocusArea(exercises: ExerciseViewModel[]): Record<string, ExerciseViewModel[]> {
    const groups: Record<string, ExerciseViewModel[]> = {};
    
    exercises.forEach(exercise => {
      exercise.focusAreas.forEach(area => {
        if (!groups[area.name]) {
          groups[area.name] = [];
        }
        groups[area.name].push(exercise);
      });
    });

    return groups;
  }

  static getExerciseStats(exercises: ExerciseViewModel[]) {
    return {
      total: exercises.length,
      public: exercises.filter(e => e.metadata.isPublic).length,
      custom: exercises.filter(e => !e.metadata.isPublic).length,
      favorites: exercises.filter(e => e.metadata.isFavorite).length,
      withEvaluation: exercises.filter(e => e.evaluation.hasTemplate).length,
      averageDuration: Math.round(
        exercises.reduce((sum, e) => sum + e.duration.minutes, 0) / exercises.length
      ),
      focusAreaDistribution: exercises.reduce((acc, exercise) => {
        exercise.focusAreas.forEach(area => {
          acc[area.name] = (acc[area.name] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

// Migration utility - helps transition existing code
export class ExerciseMigrationHelper {
  /**
   * Temporary method to convert old Exercise DTOs to new view models
   * Use this during migration phase, then remove once all components are updated
   */
  static adaptLegacyExercise(legacyExercise: Exercise | ExerciseResponse): ExerciseViewModel {
    return ExerciseAdapter.toViewModel(legacyExercise);
  }

  /**
   * Converts array of legacy exercises
   */
  static adaptLegacyExercises(legacyExercises: (Exercise | ExerciseResponse)[]): ExerciseViewModel[] {
    return legacyExercises.map(exercise => ExerciseAdapter.toViewModel(exercise));
  }

  /**
   * Creates a backwards-compatible callback adapter
   * Old components expect Exercise objects, new ones expect string IDs
   */
  static createLegacyAddCallback(
    newCallback: (id: string) => void,
    exercises: ExerciseViewModel[]
  ): (exercise: Exercise) => void {
    return (legacyExercise: Exercise) => {
      // Find the corresponding view model
      const viewModel = exercises.find(vm => vm.id === legacyExercise.id.toString());
      if (viewModel) {
        newCallback(viewModel.id);
      }
    };
  }
}