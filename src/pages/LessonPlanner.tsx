import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Save, X, BookOpen, Plus } from 'lucide-react';
import { lessonsAPI } from '../api/modules/lessons';
import { exercisesAPI } from '../api/modules/exercises';
import { teamsAPI } from '../api/modules/teams';
import { useApi } from '../hooks/useApi';
import { Exercise, ExerciseSummaryResponse, Lesson, Team } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ExerciseCardBridge } from '../components/ExerciseCardBridge';
import { TemplateSelectorModal } from '../components/Templates/TemplateSelectorModal';
import { SaveAsTemplateModal } from '../components/Templates/SaveAsTemplateModal';
import { CreateTemplateModal } from '../components/Templates/CreateTemplateModal'; // NEW
import { DraggableExerciseList } from '../components/DraggableExerciseList';

export const LessonPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [lessonName, setLessonName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Template modal states
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false); // NEW
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loadingFromTemplate, setLoadingFromTemplate] = useState(false);
  
  const { data: exercises, loading: exercisesLoading } = useApi(() => exercisesAPI.getForLessonPlanning());
  const { data: teams, loading: teamsLoading } = useApi(() => teamsAPI.getMyTeams());

  const totalDuration = selectedExercises.reduce((sum, ex) => sum + (ex.plannedDurationMinutes || ex.minimumDurationMinutes), 0);

  // Helper function to convert ExerciseSummaryResponse to Exercise
  const convertToExercise = (exercise: ExerciseSummaryResponse): Exercise => ({
    ...exercise,
    description: '', // Add required description field (empty for summaries)
    formattedMinimumDuration: exercise.formattedMinimumDuration,
    createdByCoachName: exercise.sourceLabel,
    hasDefaultEvaluationTemplate: exercise.hasDefaultEvaluationTemplate,
    public: exercise.public,
    focusAreas: exercise.focusAreas || [] // Ensure focusAreas is defined
  });

  const handleAddExercise = (exercise: Exercise) => {
    // Add planned duration and order index
    const exerciseWithPlanning: Exercise = {
      ...exercise,
      plannedDurationMinutes: exercise.minimumDurationMinutes,
      orderIndex: selectedExercises.length
    };
    
    setSelectedExercises([...selectedExercises, exerciseWithPlanning]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleReorderExercises = (newOrder: ExerciseSummaryResponse[]) => {
    // Convert ExerciseSummaryResponse back to Exercise format and update order indices
    const reorderedExercises: Exercise[] = newOrder.map((exercise, index) => ({
      ...exercise,
      description: exercise.description || '',
      formattedMinimumDuration: exercise.formattedMinimumDuration || `${exercise.minimumDurationMinutes} minutes`,
      orderIndex: index,
      plannedDurationMinutes: exercise.plannedDurationMinutes || exercise.minimumDurationMinutes
    }));
    setSelectedExercises(reorderedExercises);
  };

  const handleDurationChange = (index: number, duration: number) => {
    const updated = [...selectedExercises];
    updated[index] = {
      ...updated[index],
      plannedDurationMinutes: duration
    };
    setSelectedExercises(updated);
  };

  const resetForm = () => {
    setLessonName('');
    setSelectedExercises([]);
    setScheduledDate('');
    setSelectedTeam('');
  };

  // Handle template selection
  const handleSelectTemplate = async (templateId: number, customName?: string, teamId?: number, scheduledDate?: string) => {
    setLoadingFromTemplate(true);
    try {
      const newLesson = await lessonsAPI.createFromTemplate(
        templateId,
        scheduledDate || new Date().toISOString(),
        customName,
        teamId
      );
      
      // Load the created lesson details to populate the form
      const lessonDetails = await lessonsAPI.getById(newLesson.id);
      
      setLessonName(lessonDetails.name);
      setSelectedTeam(lessonDetails.teamId?.toString() || '');
      setScheduledDate(lessonDetails.scheduledDate || '');
      
      // Convert lesson exercises to form exercises
      if (lessonDetails.exercises) {
        const exercises = lessonDetails.exercises.map(le => ({
          id: le.exerciseId,
          name: le.exerciseName,
          description: le.exerciseDescription,
          minimumDurationMinutes: le.plannedDurationMinutes,
          plannedDurationMinutes: le.plannedDurationMinutes,
          formattedMinimumDuration: le.formattedDuration,
          focusAreas: le.focusAreas || [],
          orderIndex: le.orderIndex,
          public: true
        }));
        setSelectedExercises(exercises);
      }
      
      setShowTemplateSelector(false);
    } catch (error) {
      alert('Failed to load template: ' + (error as Error).message);
    } finally {
      setLoadingFromTemplate(false);
    }
  };

  // Handle saving current lesson as template
  const handleSaveAsTemplate = async (lessonId: number) => {
    try {
      await lessonsAPI.saveAsTemplate(lessonId);
      alert('Lesson saved as template successfully!');
      setShowSaveTemplate(false);
      setCurrentLesson(null);
    } catch (error) {
      alert('Failed to save template: ' + (error as Error).message);
    }
  };

  // NEW: Handle creating template directly
  const handleCreateTemplate = async (templateData: any) => {
    try {
      await lessonsAPI.createTemplate(templateData);
      alert('Template created successfully!');
      setShowCreateTemplate(false);
    } catch (error) {
      alert('Failed to create template: ' + (error as Error).message);
    }
  };

  const handleSaveLesson = async () => {
    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise to the lesson');
      return;
    }

    setSaving(true);
    try {
      const lessonData = {
        name: lessonName.trim() || undefined,
        teamId: selectedTeam ? parseInt(selectedTeam) : undefined,
        scheduledDate: scheduledDate || undefined,
        exercises: selectedExercises.map((ex, index) => ({
          exerciseId: ex.id,
          plannedDurationMinutes: ex.plannedDurationMinutes || ex.minimumDurationMinutes,
          orderIndex: index
        }))
      };

      const newLesson = await lessonsAPI.create(lessonData);
      
      // Show success message and set current lesson for potential template saving
      setCurrentLesson(newLesson);
      
      // Show option to save as template
      const shouldSaveAsTemplate = window.confirm(
        'Lesson saved successfully! Would you like to save this lesson as a template for future use?'
      );
      
      if (shouldSaveAsTemplate) {
        setShowSaveTemplate(true);
      } else {
        // Reset form and navigate
        resetForm();
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Failed to save lesson: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelLesson = () => {
    const hasUnsavedData = lessonName.trim() || selectedExercises.length > 0 || scheduledDate || selectedTeam;
    
    if (hasUnsavedData) {
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel? All unsaved changes will be lost.'
      );
      if (!confirmCancel) {
        return;
      }
    }
    
    resetForm();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900">
     <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-100 mb-8">Plan Your Lesson</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lesson Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto-generated name based on team and date"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team (Optional)
                    </label>
                    <select
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      disabled={teamsLoading}
                    >
                      <option value="">No team</option>
                      {teams?.map((team: Team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Schedule Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-100">Exercises</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">Total: {totalDuration} minutes</span>
                  <div className="flex space-x-3">
                    {/* Template Management Buttons */}
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowTemplateSelector(true)}
                      disabled={saving}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Load Template
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowCreateTemplate(true)}
                      disabled={saving}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleCancelLesson}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveLesson} loading={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Lesson
                    </Button>
                  </div>
                </div>
              </div>

              <DraggableExerciseList
                exercises={selectedExercises.map(ex => ({
                  ...ex,
                  formattedMinimumDuration: ex.formattedMinimumDuration || `${ex.minimumDurationMinutes} minutes`,
                  focusAreas: ex.focusAreas || [],
                  hasDefaultEvaluationTemplate: ex.hasDefaultEvaluationTemplate || false,
                  public: ex.public || false
                }))}
                onReorder={handleReorderExercises}
                onRemove={handleRemoveExercise}
                onDurationChange={handleDurationChange}
                emptyMessage="No exercises added yet! Browse the library and add some exercises to get started, or load from a template."
              />
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-100 mb-4">Exercise Library</h3>
              {exercisesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {exercises?.map((exercise: ExerciseSummaryResponse) => (
                    <ExerciseCardBridge
                      key={exercise.id}
                      exercise={exercise}
                      onAdd={handleAddExercise}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleSelectTemplate}
        loading={loadingFromTemplate}
      />

      {/* Save as Template Modal */}
      <SaveAsTemplateModal
        isOpen={showSaveTemplate}
        onClose={() => {
          setShowSaveTemplate(false);
          setCurrentLesson(null);
          resetForm();
          navigate('/dashboard');
        }}
        onSave={handleSaveAsTemplate}
        lesson={currentLesson}
      />

      {/* NEW: Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onSave={handleCreateTemplate}
        teams={teams || undefined} // Convert null to undefined
        availableExercises={exercises || undefined} // Convert null to undefined
        />
    </div>
  );
};