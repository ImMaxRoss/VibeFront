import React from 'react';
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
import { GripVertical, X, Clock } from 'lucide-react';
import { ExerciseSummaryResponse } from '../types';

interface DraggableExerciseItemProps {
  exercise: ExerciseSummaryResponse;
  index: number;
  onRemove?: (index: number) => void;
  onDurationChange?: (index: number, duration: number) => void;
  showDuration?: boolean;
  showRemove?: boolean;
  className?: string;
}

const DraggableExerciseItem: React.FC<DraggableExerciseItemProps> = ({
  exercise,
  index,
  onRemove,
  onDurationChange,
  showDuration = true,
  showRemove = true,
  className = '',
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all ${
        isDragging ? 'opacity-50 shadow-xl scale-105 ring-2 ring-yellow-500 ring-opacity-50 bg-yellow-500 bg-opacity-10' : ''
      } ${className}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200 transition-colors p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Exercise Number */}
      <div className="text-gray-400 font-bold text-lg min-w-[2rem] text-center">
        {index + 1}
      </div>

      {/* Exercise Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-gray-100 font-medium truncate">{exercise.name}</h4>
        {exercise.description && (
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{exercise.description}</p>
        )}
        
        {/* Focus Areas */}
        {exercise.focusAreas && exercise.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {exercise.focusAreas.slice(0, 3).map((area) => (
              <span
                key={area.id}
                className="text-xs px-2 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300"
              >
                {area.name}
              </span>
            ))}
            {exercise.focusAreas.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-500 bg-opacity-20 text-gray-400">
                +{exercise.focusAreas.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Duration Input */}
      {showDuration && onDurationChange && (
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <input
            type="number"
            value={exercise.plannedDurationMinutes || exercise.minimumDurationMinutes}
            onChange={(e) => {
              const duration = parseInt(e.target.value) || exercise.minimumDurationMinutes;
              onDurationChange(index, duration);
            }}
            min={exercise.minimumDurationMinutes}
            className="w-20 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm focus:outline-none focus:border-yellow-500"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-gray-400 text-sm">min</span>
        </div>
      )}

      {/* Duration Display (read-only) */}
      {showDuration && !onDurationChange && (
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {exercise.plannedDurationMinutes || exercise.minimumDurationMinutes} min
          </span>
        </div>
      )}

      {/* Remove Button */}
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="text-red-400 hover:text-red-300 transition-colors p-1"
          aria-label="Remove exercise"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

interface DraggableExerciseListProps {
  exercises: ExerciseSummaryResponse[];
  onReorder: (newOrder: ExerciseSummaryResponse[]) => void;
  onRemove?: (index: number) => void;
  onDurationChange?: (index: number, duration: number) => void;
  showDuration?: boolean;
  showRemove?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const DraggableExerciseList: React.FC<DraggableExerciseListProps> = ({
  exercises,
  onReorder,
  onRemove,
  onDurationChange,
  showDuration = true,
  showRemove = true,
  emptyMessage = 'No exercises added yet',
  className = '',
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

    if (active.id !== over?.id) {
      const oldIndex = exercises.findIndex((exercise) => exercise.id === active.id);
      const newIndex = exercises.findIndex((exercise) => exercise.id === over?.id);

      const newOrder = arrayMove(exercises, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-400 ${className}`}>
        <div className="text-gray-500 mb-2">📝</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={exercises.map((ex) => ex.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`space-y-3 ${className}`}>
          {exercises.map((exercise, index) => (
            <DraggableExerciseItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              onRemove={onRemove}
              onDurationChange={onDurationChange}
              showDuration={showDuration}
              showRemove={showRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};