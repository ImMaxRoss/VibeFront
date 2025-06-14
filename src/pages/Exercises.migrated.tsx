// MIGRATED VERSION - Uses view models and service layer
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Grid, 
  List, 
  Download, 
  Upload,
  Filter,
  TrendingUp,
  Bookmark,
  Shuffle
} from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { ExerciseFilters } from '../components/Exercises/ExerciseFilters';
import { ExerciseCard } from '../components/ExerciseCard'; // Now uses view models
// import { ExerciseDetailModal } from '../components/Exercises/ExerciseDetailModal';
// import { CreateExerciseModal } from '../components/Exercises/CreateExerciseModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import { useExercises, useExerciseForm } from '../hooks/useExercises';
import { ExerciseViewModel, ExerciseFilterModel } from '../models';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const Exercises: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseViewModel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [filters, setFilters] = useState<Partial<ExerciseFilterModel>>({
    source: 'all',
    sortBy: 'popularity',
    sortDirection: 'desc',
    searchTerm: '',
    selectedFocusAreas: [],
    durationRange: { min: null, max: null },
    hasEvaluation: null,
    activeFilters: { count: 0, summary: '' }
  });

  // Use our new hooks
  const { 
    exercises, 
    loading, 
    error, 
    totalCount, 
    hasMore, 
    stats, 
    refetch,
    clearError 
  } = useExercises(filters);

  const {
    loading: formLoading,
    error: formError,
    createExercise,
    duplicateExercise,
    clearError: clearFormError
  } = useExerciseForm();

  // Mock focus areas - would come from a separate hook/service
  const focusAreas = [
    { id: '1', name: 'Yes And', description: 'Accept and build', colorCode: '#4CAF50' },
    { id: '2', name: 'Agreement', description: 'Shared reality', colorCode: '#2196F3' },
    { id: '3', name: 'Who/What/Where', description: 'Context establishment', colorCode: '#FF9800' },
    { id: '4', name: 'Physicality', description: 'Body and space', colorCode: '#9C27B0' },
    { id: '5', name: 'Listening', description: 'Active attention', colorCode: '#F44336' },
    { id: '6', name: 'Commitment', description: 'Full engagement', colorCode: '#3F51B5' },
    { id: '7', name: 'Avoidance of Denial', description: 'Accept reality', colorCode: '#009688' },
    { id: '8', name: 'Efficiency', description: 'Economic scene work', colorCode: '#795548' }
  ];

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ExerciseFilterModel>) => {
    const activeCount = Object.entries(newFilters).filter(([key, value]) => {
      if (key === 'activeFilters') return false;
      if (key === 'searchTerm') return value && typeof value === 'string' && value.trim() !== '';
      if (key === 'selectedFocusAreas') return Array.isArray(value) && value.length > 0;
      if (key === 'durationRange') return value && typeof value === 'object' && value !== null && !Array.isArray(value) && 'min' in value && 'max' in value && (value.min !== null || value.max !== null);
      if (key === 'source') return value && value !== 'all';
      if (key === 'hasEvaluation') return value !== null;
      return value !== null && value !== undefined && value !== '';
    }).length;

    setFilters({
      ...newFilters,
      activeFilters: {
        count: activeCount,
        summary: activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : ''
      }
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      source: 'all',
      sortBy: 'popularity',
      sortDirection: 'desc',
      searchTerm: '',
      selectedFocusAreas: [],
      durationRange: { min: null, max: null },
      hasEvaluation: null,
      activeFilters: { count: 0, summary: '' }
    });
  }, []);

  // Exercise handlers - now work with view model IDs
  const handleExerciseAdd = useCallback((exerciseId: string) => {
    console.log('Add exercise to lesson:', exerciseId);
    // This would typically add to a lesson planning context
  }, []);

  const handleExerciseView = useCallback((exercise: ExerciseViewModel) => {
    setSelectedExercise(exercise);
  }, []);

  const handleToggleFavorite = useCallback(async (exerciseId: string) => {
    // Would call API to toggle favorite
    console.log('Toggle favorite:', exerciseId);
    // After API call, refetch data
    refetch();
  }, [refetch]);

  const handleDuplicateExercise = useCallback(async (exerciseId: string) => {
    try {
      clearFormError();
      const exercise = exercises.find(e => e.id === exerciseId);
      const newName = exercise ? `${exercise.title} (Copy)` : undefined;
      await duplicateExercise(exerciseId, newName);
      refetch(); // Refresh data
    } catch (error) {
      // Error is handled by the hook
    }
  }, [exercises, duplicateExercise, refetch, clearFormError]);

  const handleCreateExercise = useCallback(async (exerciseData: any) => {
    try {
      clearFormError();
      await createExercise(exerciseData);
      setShowCreateModal(false);
      refetch(); // Refresh data
    } catch (error) {
      // Error is handled by the hook
    }
  }, [createExercise, refetch, clearFormError]);

  // Shuffle exercises
  const handleShuffle = useCallback(() => {
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    console.log('Shuffled exercises:', shuffled.slice(0, 5).map(e => e.title));
  }, [exercises]);

  // Computed values
  const displayStats = useMemo(() => ({
    total: stats.total || totalCount,
    popular: stats.total > 0 ? exercises.filter(e => e.display.statusBadges.includes('Popular')).length : 0,
    favorites: stats.favorites,
    custom: stats.custom
  }), [stats, totalCount, exercises]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-100">Exercise Library</h1>
            <p className="text-gray-400 mt-2">Discover, create, and organize improv exercises</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Exercise
            </Button>
          </div>
        </div>

        {/* Error handling */}
        {error && (
          <div className="mb-6">
            <ErrorMessage error={error} />
            <Button variant="secondary" className="mt-2" onClick={() => { clearError(); refetch(); }}>
              Try Again
            </Button>
          </div>
        )}

        {formError && (
          <div className="mb-6">
            <ErrorMessage error={formError} />
            <Button variant="secondary" className="mt-2" onClick={clearFormError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Grid}
            label="Total Exercises"
            value={displayStats.total}
            color="bg-blue-500 text-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Popular"
            value={displayStats.popular}
            color="bg-yellow-500 text-yellow-500"
          />
          <StatCard
            icon={Bookmark}
            label="Favorites"
            value={displayStats.favorites}
            color="bg-red-500 text-red-500"
          />
          <StatCard
            icon={Plus}
            label="Custom"
            value={displayStats.custom}
            color="bg-green-500 text-green-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <ExerciseFilters
                filters={filters as any} // TODO: Update ExerciseFilters to use new filter model
                onFiltersChange={handleFiltersChange as any}
                focusAreas={focusAreas as any}
                onClearFilters={clearFilters}
                resultCount={exercises.length}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                
                <span className="text-gray-400 text-sm">
                  {exercises.length} of {displayStats.total} exercises
                  {hasMore && ' (showing first batch)'}
                </span>

                {filters.activeFilters && filters.activeFilters.count > 0 && (
                  <span className="text-amber-400 text-sm">
                    {filters.activeFilters.summary}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShuffle}
                  disabled={exercises.length === 0}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Surprise Me
                </Button>
                
                <div className="flex border border-gray-600 rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-600 text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-600 text-gray-100' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <LoadingSpinner />
            ) : exercises.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">
                  No exercises found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or create a new exercise!
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exercise
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onAdd={handleExerciseAdd}
                    onClick={() => handleExerciseView(exercise)}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button variant="secondary" onClick={refetch}>
                  Load More Exercises
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal - TODO: Update to use view models */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold text-gray-100 mb-4">{selectedExercise.title}</h2>
            <p className="text-gray-400 mb-4">{selectedExercise.description}</p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setSelectedExercise(null)}>
                Close
              </Button>
              <Button onClick={() => handleDuplicateExercise(selectedExercise.id)}>
                Duplicate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exercise Modal - TODO: Update to use form models */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Create Exercise</h2>
            <p className="text-gray-400 mb-4">Exercise creation form would go here</p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowCreateModal(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleCreateExercise({ name: 'Test Exercise', description: 'Test' })}
                loading={formLoading}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};