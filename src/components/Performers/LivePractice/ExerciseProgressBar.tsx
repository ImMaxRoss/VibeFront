import React from 'react';
import { CheckCircle, Circle, Clock, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LessonExercise } from '../../../types';
import { Card } from '../../ui/Card';

interface ExerciseProgressBarProps {
  exercises: LessonExercise[];
  currentIndex: number;
  onExerciseClick?: (index: number) => void;
  onReorder?: (newOrder: LessonExercise[]) => void;
  allowReordering?: boolean;
}

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
  exercise: LessonExercise;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  allowReordering: boolean;
  onExerciseClick?: (index: number) => void;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
  exercise,
  index,
  isActive,
  isCompleted,
  allowReordering,
  onExerciseClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: exercise.id,
    disabled: !allowReordering
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isPending = !isActive && !isCompleted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
        isDragging ? 'opacity-50 shadow-xl scale-105 ring-2 ring-yellow-500 ring-opacity-50' : ''
      } ${
        isActive 
          ? 'bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-50' 
          : isCompleted
          ? 'bg-green-500 bg-opacity-10 hover:bg-green-500 hover:bg-opacity-20'
          : 'bg-gray-700 hover:bg-gray-600'
      } ${allowReordering ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
    >
      {/* Drag Handle - only show when reordering is allowed */}
      {allowReordering && (
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-200 transition-colors p-1"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Clickable Exercise Content */}
      <div 
        className="flex items-center space-x-3 flex-1 min-w-0"
        onClick={() => onExerciseClick && onExerciseClick(index)}
      >
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isActive ? (
            <Clock className="h-5 w-5 text-yellow-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${
            isActive ? 'text-yellow-100' : 
            isCompleted ? 'text-green-100' : 'text-gray-300'
          }`}>
            {exercise.exerciseName}
          </h4>
          <p className={`text-xs ${
            isActive ? 'text-yellow-200' : 
            isCompleted ? 'text-green-200' : 'text-gray-400'
          }`}>
            {exercise.formattedDuration}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {exercise.focusAreas?.slice(0, 2).map((area, areaIndex) => (
            <span
              key={areaIndex}
              className={`px-2 py-1 text-xs rounded ${
                isActive
                  ? 'bg-yellow-600 text-yellow-100'
                  : isCompleted
                  ? 'bg-green-600 text-green-100'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {area.name}
            </span>
          ))}
          {exercise.focusAreas && exercise.focusAreas.length > 2 && (
            <span className={`px-2 py-1 text-xs rounded ${
              isActive
                ? 'bg-yellow-600 text-yellow-100'
                : isCompleted
                ? 'bg-green-600 text-green-100'
                : 'bg-gray-600 text-gray-300'
            }`}>
              +{exercise.focusAreas.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ExerciseProgressBar: React.FC<ExerciseProgressBarProps> = ({
  exercises,
  currentIndex,
  onExerciseClick,
  onReorder,
  allowReordering = false
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorder) {
      const oldIndex = exercises.findIndex((exercise) => exercise.id === active.id);
      const newIndex = exercises.findIndex((exercise) => exercise.id === over?.id);

      const newOrder = arrayMove(exercises, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };
  return (
    <Card className="p-4">
      <h3 className="font-medium text-gray-100 mb-3">
        Lesson Progress
        {allowReordering && (
          <span className="text-xs text-gray-400 ml-2">(Drag to reorder)</span>
        )}
      </h3>
      
      {allowReordering ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={exercises.map((ex) => ex.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {exercises.map((exercise, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                  <SortableExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    allowReordering={allowReordering}
                    onExerciseClick={onExerciseClick}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <SortableExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                isActive={isActive}
                isCompleted={isCompleted}
                allowReordering={false}
                onExerciseClick={onExerciseClick}
              />
            );
          })}
        </div>
      )}
      
      <div className="mt-4 bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-yellow-500 to-green-500 h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${exercises.length > 0 ? (currentIndex / exercises.length) * 100 : 0}%` 
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{currentIndex} completed</span>
        <span>{exercises.length} total</span>
      </div>
    </Card>
  );
};