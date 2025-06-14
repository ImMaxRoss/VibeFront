import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen, Star, Play, Plus, ChevronRight, Sparkles, BarChart3, TrendingUp, History as HistoryIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { lessonsAPI } from '../api/modules/lessons';
import { exercisesAPI } from '../api/modules/exercises';
import { teamsAPI } from '../api/modules/teams';
import { analyticsAPI } from '../api/modules/analytics';
import { useApi } from '../hooks/useApi';
import { Navigation } from '../components/Navigation';
import { StatCard } from '../components/StatCard';
import { ScheduledLesson } from '../components/ScheduledLesson';
import { ExerciseCardBridge } from '../components/ExerciseCardBridge';
import { ApiHealthCheck } from '../components/ApiHealthCheck';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LessonPlanner } from './LessonPlanner';
import { Lesson } from '../types';

// Helper function to determine lesson status
const getLessonStatus = (lesson: Lesson): 'upcoming' | 'today' | 'in-progress' | 'completed' | 'past' => {
  const now = new Date();
  const lessonDate = new Date(lesson.scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lessonDay = new Date(lessonDate);
  lessonDay.setHours(0, 0, 0, 0);
  
  // Check if lesson is today
  if (lessonDay.getTime() === today.getTime()) {
    // If it's today, check if it's currently happening or completed
    const lessonEndTime = new Date(lessonDate.getTime() + (lesson.totalDurationMinutes || 60) * 60000);
    
    if (now >= lessonDate && now <= lessonEndTime) {
      return 'in-progress';
    } else if (now > lessonEndTime) {
      return 'completed';
    } else {
      return 'today';
    }
  }
  
  // Check if lesson is in the future
  if (lessonDate > now) {
    return 'upcoming';
  }
  
  // Lesson is in the past
  return lesson.upcoming === false ? 'completed' : 'past';
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'planner'>('dashboard');
  
  // Updated to use getScheduled instead of getUpcoming
  const { data: scheduledLessons, loading: lessonsLoading } = useApi(() => lessonsAPI.getScheduled());
  const { data: popularExercises, loading: exercisesLoading } = useApi(() => exercisesAPI.getPopular(5));
  const { data: teams, loading: teamsLoading } = useApi(() => teamsAPI.getMyTeams());
  
  // Analytics preview data
  const { data: coachingInsights } = useApi(() => analyticsAPI.getCoachingInsights({ timeRange: '30d' }));
  const { data: performerProgress } = useApi(() => analyticsAPI.getPerformerProgress({ timeRange: '30d' }));

  // Filter lessons to show only active ones (exclude completed/past)
  const activeLessons = useMemo(() => {
    if (!scheduledLessons) return [];
    
    return scheduledLessons.filter(lesson => {
      const status = getLessonStatus(lesson);
      // Only show upcoming, today, and in-progress lessons
      return ['upcoming', 'today', 'in-progress'].includes(status);
    });
  }, [scheduledLessons]);

  // Sort active lessons by priority: today's lessons first, then upcoming, then in-progress
  const sortedActiveLessons = useMemo(() => {
    if (!activeLessons) return [];
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return [...activeLessons].sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      const dayA = new Date(dateA);
      dayA.setHours(0, 0, 0, 0);
      const dayB = new Date(dateB);
      dayB.setHours(0, 0, 0, 0);
      
      const statusA = getLessonStatus(a);
      const statusB = getLessonStatus(b);
      
      // Priority order: in-progress -> today -> upcoming
      const statusPriority = { 'in-progress': 0, 'today': 1, 'upcoming': 2 };
      const priorityA = statusPriority[statusA as keyof typeof statusPriority] ?? 3;
      const priorityB = statusPriority[statusB as keyof typeof statusPriority] ?? 3;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Within same status, sort by time
      return dateA.getTime() - dateB.getTime();
    });
  }, [activeLessons]);

  // Count completed lessons for stats - placeholder until history API is working
  const completedLessonsCount = useMemo(() => {
    if (!scheduledLessons) return 0;
    // For now, count past lessons until we have proper session completion tracking
    return scheduledLessons.filter(lesson => {
      const status = getLessonStatus(lesson);
      return ['completed', 'past'].includes(status);
    }).length;
  }, [scheduledLessons]);

  const handleStartPractice = (lessonId: number) => {
    navigate(`/live-practice/${lessonId}`);
  };

  const handleNavigateToAnalytics = () => {
    navigate('/analytics');
  };

  const handleNavigateToExercises = () => {
    navigate('/exercises');
  };

  const handleNavigateToHistory = () => {
    navigate('/history');
  };

  if (activeView === 'planner') {
    return (
      <>
        <Navigation />
        <button
          onClick={() => setActiveView('dashboard')}
          className="mt-4 ml-4 text-gray-400 hover:text-gray-200 flex items-center space-x-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span>Back to Dashboard</span>
        </button>
        <LessonPlanner />
      </>
    );
  }

  // Calculate analytics preview stats
  const avgScore = performerProgress 
    ? (performerProgress.reduce((sum, p) => sum + (p.overallProgress || 0), 0) / performerProgress.length).toFixed(1)
    : '0.0';
  
  const improvingPerformers = performerProgress 
    ? performerProgress.filter(p => 
        p.focusAreaScores && 
        Object.values(p.focusAreaScores).some(score => score?.trend === 'improving')
      ).length
    : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Health Check */}
        <ApiHealthCheck />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-100">
            Welcome back, {user?.firstName}! <span className="inline-block animate-bounce">🎭</span>
          </h1>
          <p className="text-gray-400 mt-2">Ready to make some comedy magic happen?</p>
        </div>

        {/* Quick Stats - Moved to top */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-gray-100">Quick Stats</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Today's Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Today's Schedule</h3>
              <div className="text-2xl font-bold text-gray-100">
                {sortedActiveLessons?.filter(lesson => getLessonStatus(lesson) === 'today').length || 0}
              </div>
              <div className="text-xs text-gray-400">lessons today</div>
            </div>

            {/* This Week Preview */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">This Week</h3>
              <div className="text-2xl font-bold text-gray-100">
                {sortedActiveLessons?.filter(lesson => {
                  const lessonDate = new Date(lesson.scheduledDate);
                  const now = new Date();
                  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);
                  return lessonDate >= weekStart && lessonDate <= weekEnd;
                }).length || 0}
              </div>
              <div className="text-xs text-gray-400">Upcoming</div>
            </div>

            {/* Completed Lessons */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Completed</h3>
              <div className="text-2xl font-bold text-green-400">{completedLessonsCount}</div>
              <div className="text-xs text-gray-400">Total sessions</div>
            </div>
          </div>
        </Card>

        {/* Quick Actions - Updated to include History */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            hoverable 
            className="p-6 cursor-pointer"
            onClick={() => setActiveView('planner')}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
                <Plus className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Plan Lesson</h3>
                <p className="text-gray-400 text-sm">Create practice</p>
              </div>
            </div>
          </Card>

          <Card 
            hoverable 
            className="p-6 cursor-pointer"
            onClick={handleNavigateToExercises}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                <Sparkles className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Exercises</h3>
                <p className="text-gray-400 text-sm">Browse library</p>
              </div>
            </div>
          </Card>

          <Card 
            hoverable 
            className="p-6 cursor-pointer"
            onClick={handleNavigateToHistory}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                <HistoryIcon className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">History</h3>
                <p className="text-gray-400 text-sm">View past sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Lessons - Updated section */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-gray-100">Active Lessons</h2>
              <div className="flex items-center space-x-2">
                {completedLessonsCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleNavigateToHistory}
                  >
                    History ({completedLessonsCount})
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/lessons')}
                >
                  View All
                </Button>
              </div>
            </div>
            {lessonsLoading ? (
              <LoadingSpinner />
            ) : sortedActiveLessons?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No active lessons scheduled</p>
                <div className="mt-4 space-y-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveView('planner')}
                  >
                    Plan a Lesson
                  </Button>
                  {completedLessonsCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={handleNavigateToHistory}
                    >
                      <HistoryIcon className="h-4 w-4 mr-2" />
                      View {completedLessonsCount} Completed
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedActiveLessons?.slice(0, 5).map((lesson) => (
                  <ScheduledLesson 
                    key={lesson.id} 
                    lesson={lesson} 
                    onStartPractice={handleStartPractice}
                  />
                ))}
                {sortedActiveLessons && sortedActiveLessons.length > 5 && (
                  <div className="text-center pt-3 border-t border-gray-700">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/lessons')}
                    >
                      View {sortedActiveLessons.length - 5} more lessons
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Popular Exercises */}
          <Card className="p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-gray-100">Popular Exercises</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleNavigateToExercises}
              >
                Browse All
              </Button>
            </div>
            {exercisesLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {popularExercises?.slice(0, 3).map((exercise) => (
                  <ExerciseCardBridge key={exercise.id} exercise={exercise} />
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 lg:col-span-1">
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={handleNavigateToHistory}
                >
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  View Practice History
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};