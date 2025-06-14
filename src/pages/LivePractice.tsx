// src/pages/LivePractice.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Save, Clock, Users, Target } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AttendanceSelector } from '../components/Performers/LivePractice/AttendanceSelector';
import { ExerciseProgressBar } from '../components/Performers/LivePractice/ExerciseProgressBar';
import { QuickNotes } from '../components/Performers/LivePractice/QuickNotes';
import { PracticeStats } from '../components/Performers/LivePractice/PracticeStats';
import { SceneEvaluationModal } from '../components/Performers/LivePractice/SceneEvaluationModal';
import { Lesson, PracticeSession, Performer, SceneEvaluation, PracticeStats as Stats } from '../types';
import { lessonsAPI, practiceAPI, attendanceAPI, teamsAPI } from '../api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const LivePractice: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  // State
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [attendeeIds, setAttendeeIds] = useState<number[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalDuration: 0,
    exercisesCompleted: 0,
    evaluationsCompleted: 0,
    attendanceCount: 0
  });
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [allowReordering, setAllowReordering] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Load lesson and performers
  useEffect(() => {
    const loadData = async () => {
      if (!lessonId) return;
      
      try {
        setLoading(true);
        const lessonData = await lessonsAPI.getById(parseInt(lessonId));
        setLesson(lessonData);
        
        // Load performers if team-based lesson
        if (lessonData.teamId) {
          try {
            // Get team with performers since performers are contacts associated with teams
            const teamWithPerformers = await teamsAPI.getTeamWithPerformers(lessonData.teamId);
            // Convert team performers to the expected format
            const performerData = teamWithPerformers.performers?.map(performer => ({
              id: performer.id,
              firstName: performer.firstName,
              lastName: performer.lastName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })) || [];
            setPerformers(performerData);
          } catch (performerError) {
            console.warn('Could not load team performers:', performerError);
            setPerformers([]); // Continue without performers if team fetch fails
          }
        }
      } catch (err) {
        setError('Failed to load lesson data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId]);

  // Start practice session
  const startPractice = async () => {
    if (!lesson) return;
    
    try {
      setSaving(true);
      const newSession = await practiceAPI.startPractice(lesson.id);
      setSession(newSession);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        attendanceCount: attendeeIds.length
      }));
      
      // Save initial attendance if any performers selected
      if (attendeeIds.length > 0) {
        await attendanceAPI.updateBulkAttendance(newSession.id, attendeeIds);
      }
    } catch (err) {
      setError('Failed to start practice session');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Update attendance
  const handleAttendanceChange = async (selectedIds: number[]) => {
    setAttendeeIds(selectedIds);
    setStats(prev => ({ ...prev, attendanceCount: selectedIds.length }));
    
    // If session is active, update attendance in real-time
    if (session) {
      try {
        await attendanceAPI.updateBulkAttendance(session.id, selectedIds);
      } catch (err) {
        console.error('Failed to update attendance:', err);
      }
    }
  };

  // Navigate between exercises
  const goToExercise = async (index: number) => {
    if (!session || !lesson?.exercises) return;
    
    const exercise = lesson.exercises[index];
    if (!exercise) return;
    
    try {
      const updatedSession = await practiceAPI.updateCurrentExercise(
        session.id, 
        exercise.id
      );
      setSession(updatedSession);
      setCurrentExerciseIndex(index);
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Failed to update exercise:', err);
    }
  };

  // Save evaluation
  const handleSaveEvaluation = async (evaluation: Omit<SceneEvaluation, 'id'>) => {
    try {
      await practiceAPI.createEvaluation(evaluation);
      setStats(prev => ({
        ...prev,
        evaluationsCompleted: prev.evaluationsCompleted + 1
      }));
      setShowEvaluationModal(false);
    } catch (err) {
      console.error('Failed to save evaluation:', err);
    }
  };

  // Save notes
  const handleSaveNote = async (note: string, type: 'exercise' | 'overall') => {
    if (!lesson || !session) return;
    
    try {
      await practiceAPI.savePracticeNotes(lesson.id, session.id, note, type);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  // End practice
  const endPractice = async () => {
    if (!session) return;
    
    try {
      await practiceAPI.endPractice(session.id);
      navigate(`/lessons/${lessonId}`);
    } catch (err) {
      console.error('Failed to end practice:', err);
    }
  };

  // Timer callbacks
  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
  };

  const handleTimeUp = () => {
    // Could auto-advance or show notification
  };

  // Handle exercise reordering
  const handleExerciseReorder = async (newOrder: any[]) => {
    if (!lesson || !lessonId) return;
    
    setReordering(true);
    try {
      // Update lesson with new exercise order
      const exerciseIds = newOrder.map(ex => ex.id);
      await lessonsAPI.reorderExercises(parseInt(lessonId), exerciseIds);
      
      // Update local lesson state
      setLesson({
        ...lesson,
        exercises: newOrder
      });
      
      // If the current exercise has moved, update the current index
      const currentExercise = lesson.exercises?.[currentExerciseIndex];
      if (currentExercise) {
        const newIndex = newOrder.findIndex(ex => ex.id === currentExercise.id);
        if (newIndex !== -1) {
          setCurrentExerciseIndex(newIndex);
        }
      }
    } catch (err) {
      console.error('Failed to reorder exercises:', err);
      alert('Failed to reorder exercises. Please try again.');
    } finally {
      setReordering(false);
    }
  };

  // Update total duration every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (session && isTimerRunning) {
      interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          totalDuration: prev.totalDuration + 1
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session, isTimerRunning]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
        <ErrorMessage error={error || 'Lesson not found'} />
      </div>
    );
  }

  const currentExercise = lesson.exercises?.[currentExerciseIndex];
  const exerciseCount = lesson.exercises?.length || 0;
  const progress = exerciseCount > 0 ? ((currentExerciseIndex + 1) / exerciseCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Modern Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {lesson.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  {lesson.teamName && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{lesson.teamName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(lesson.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  {session && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{currentExerciseIndex + 1} of {exerciseCount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {session && (
                <Button 
                  onClick={endPractice} 
                  variant="secondary"
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30"
                >
                  End Practice
                </Button>
              )}
            </div>
            
            {/* Progress bar for active session */}
            {session && exerciseCount > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Practice Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {!session ? (
          // Pre-practice setup with modern styling
          <div className="space-y-6">
            {performers.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <AttendanceSelector
                  performers={performers}
                  selectedIds={attendeeIds}
                  onSelectionChange={handleAttendanceChange}
                />
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl blur-xl"></div>
              <Card className="relative bg-gray-800/50 backdrop-blur-sm border-gray-700/50 p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-100">
                    Ready to start practice?
                  </h2>
                  <p className="text-gray-300">
                    {lesson.exercises?.length || 0} exercises • {lesson.formattedDuration || '0 minutes'}
                  </p>
                  <Button 
                    onClick={startPractice} 
                    size="lg" 
                    loading={saving}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 px-8 py-3 text-lg font-medium"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Practice
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          // Active practice session with modern 3-column layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Exercise progress with modern styling */}
            <div className="lg:col-span-1 space-y-6">
              {/* Reorder toggle */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-100">Exercise Order</h3>
                <button
                  onClick={() => setAllowReordering(!allowReordering)}
                  disabled={reordering}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    allowReordering 
                      ? 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-50' 
                      : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                  } ${reordering ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {reordering ? 'Saving...' : allowReordering ? 'Stop Reordering' : 'Reorder Exercises'}
                </button>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <ExerciseProgressBar
                  exercises={lesson.exercises || []}
                  currentIndex={currentExerciseIndex}
                  onExerciseClick={goToExercise}
                  onReorder={handleExerciseReorder}
                  allowReordering={allowReordering}
                />
              </div>
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <QuickNotes onSaveNote={handleSaveNote} />
              </div>
            </div>

            {/* Center column - Current exercise with enhanced styling */}
            <div className="lg:col-span-1 space-y-6">
              {currentExercise && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
                  <Card className="relative bg-gray-800/50 backdrop-blur-sm border-gray-700/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {currentExerciseIndex + 1}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-100">
                        {currentExercise.exerciseName}
                      </h2>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
                      {currentExercise.exerciseDescription}
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => setShowEvaluationModal(true)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Evaluate Scene
                      </Button>
                      
                      {currentExerciseIndex < (lesson.exercises?.length || 0) - 1 && (
                        <Button
                          onClick={() => goToExercise(currentExerciseIndex + 1)}
                          variant="secondary"
                          className="w-full bg-gray-700/50 hover:bg-gray-600/50 backdrop-blur-sm"
                        >
                          Next Exercise
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )}
              
              {/* <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <PracticeTimer
                  plannedDuration={currentExercise?.plannedDurationMinutes || 5}
                  onTimeUp={handleTimeUp}
                  isRunning={isTimerRunning}
                  onToggle={handleTimerToggle}
                  onReset={handleTimerReset}
                />
              </div> */}
            </div>

            {/* Right column - Stats with modern styling */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 sticky top-6">
                <PracticeStats
                  stats={stats}
                  currentExercise={currentExerciseIndex + 1}
                  totalExercises={lesson.exercises?.length || 0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Modal */}
        {showEvaluationModal && currentExercise && (
          <SceneEvaluationModal
            isOpen={showEvaluationModal}
            onClose={() => setShowEvaluationModal(false)}
            onSave={handleSaveEvaluation}
            performers={performers.filter(p => attendeeIds.includes(p.id))}
            lessonExerciseId={currentExercise.id}
            practiceSessionId={session?.id}
            evaluationTemplateId={currentExercise.evaluationTemplateId}
            evaluationTemplateName={currentExercise.evaluationTemplateName}
          />
        )}
      </div>
    </div>
  );
};