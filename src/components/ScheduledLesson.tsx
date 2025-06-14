import React from 'react';
import { Calendar, Play, CheckCircle, Clock, Users } from 'lucide-react';
import { Lesson } from '../types';
import { Button } from './ui/Button';

interface ScheduledLessonProps {
  lesson: Lesson;
  onStartPractice?: (lessonId: number) => void;
}

type LessonStatus = 'upcoming' | 'today' | 'in-progress' | 'completed' | 'past';

const getLessonStatus = (lesson: Lesson): LessonStatus => {
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

const getStatusConfig = (status: LessonStatus) => {
  switch (status) {
    case 'upcoming':
      return {
        label: 'Upcoming',
        color: 'bg-blue-500 bg-opacity-20 text-blue-400 border-blue-500',
        icon: Calendar,
        showStartButton: false
      };
    case 'today':
      return {
        label: 'Today',
        color: 'bg-green-500 bg-opacity-20 text-green-400 border-green-500',
        icon: Calendar,
        showStartButton: true
      };
    case 'in-progress':
      return {
        label: 'In Progress',
        color: 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500',
        icon: Clock,
        showStartButton: true
      };
    case 'completed':
      return {
        label: 'Completed',
        color: 'bg-gray-500 bg-opacity-20 text-gray-400 border-gray-500',
        icon: CheckCircle,
        showStartButton: false
      };
    case 'past':
      return {
        label: 'Past',
        color: 'bg-gray-600 bg-opacity-20 text-gray-500 border-gray-600',
        icon: Calendar,
        showStartButton: false
      };
  }
};

export const ScheduledLesson: React.FC<ScheduledLessonProps> = ({ 
  lesson, 
  onStartPractice 
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      // Check if it's within the current week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (date >= weekStart && date <= weekEnd) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          hour: 'numeric', 
          minute: '2-digit' 
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit' 
        });
      }
    }
  };

  const status = getLessonStatus(lesson);
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
      status === 'today' || status === 'in-progress' 
        ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 hover:border-green-500/40' 
        : 'hover:bg-gray-700/50'
    }`}>
      <div className="flex-shrink-0">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center border ${statusConfig.color}`}>
          <StatusIcon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-gray-100 font-medium truncate">
            {lesson.name || `${lesson.teamName} Practice`}
          </h4>
          <span className={`px-2 py-1 text-xs rounded-full border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-400 text-sm">
          {lesson.teamName && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="truncate">{lesson.teamName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(lesson.scheduledDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        <div className="text-right">
          <p className="text-gray-400 text-sm font-medium">{lesson.formattedDuration}</p>
          <p className="text-gray-500 text-xs">{lesson.exerciseCount} exercises</p>
        </div>
        
        {statusConfig.showStartButton && onStartPractice && (
          <Button
            size="sm"
            onClick={() => onStartPractice(lesson.id)}
            className={`mt-1 ${
              status === 'in-progress' 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-yellow-100' 
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            <Play className="h-3 w-3 mr-1" />
            {status === 'in-progress' ? 'Resume' : 'Start'}
          </Button>
        )}
      </div>
    </div>
  );
};