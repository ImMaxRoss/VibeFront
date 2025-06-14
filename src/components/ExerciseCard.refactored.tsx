// REFACTORED VERSION - Uses view models instead of direct DTO consumption
import React from 'react';
import { Clock, Plus, FileText, Star, TrendingUp } from 'lucide-react';
import { ExerciseViewModel } from '../models';
import { Card } from './ui/Card';

interface ExerciseCardProps {
  exercise: ExerciseViewModel;
  onAdd?: (exerciseId: string) => void;
  onClick?: () => void; 
  variant?: 'default' | 'compact' | 'detailed';
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onAdd, 
  onClick,
  variant = 'default'
}) => {
  const getFocusAreaColor = (color: string): string => {
    // Use the color from the view model instead of hardcoded mapping
    return color;
  };

  const renderStatusBadges = () => {
    return exercise.display.statusBadges.map(badge => (
      <span 
        key={badge}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
      >
        {badge === 'Popular' && <TrendingUp className="h-3 w-3 mr-1" />}
        {badge === 'Favorite' && <Star className="h-3 w-3 mr-1" />}
        {badge}
      </span>
    ));
  };

  const renderCompactVersion = () => (
    <Card hoverable className="p-4" onClick={onClick}>
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-100 truncate">{exercise.title}</h4>
          <p className="text-xs text-gray-400">{exercise.duration.formatted}</p>
        </div>
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(exercise.id);
            }}
            className="text-yellow-500 hover:text-yellow-400 ml-2"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );

  const renderDetailedVersion = () => (
    <Card hoverable className="p-6" onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-100 mb-1">{exercise.title}</h3>
          <p className="text-xs text-gray-500">{exercise.display.sourceLabel}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {exercise.duration.formatted}
            {exercise.duration.isMinimum && (
              <span className="text-xs ml-1">(min)</span>
            )}
          </div>
          {exercise.evaluation.hasTemplate && (
            <div 
              className="flex items-center text-green-400 text-sm" 
              title={exercise.evaluation.templateName || 'Has evaluation template'}
            >
              <FileText className="h-4 w-4" />
            </div>
          )}
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(exercise.id);
              }}
              className="text-yellow-500 hover:text-yellow-400"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Status badges */}
      {exercise.display.statusBadges.length > 0 && (
        <div className="flex gap-2 mb-3">
          {renderStatusBadges()}
        </div>
      )}

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exercise.description}</p>
      
      {/* Focus areas with dynamic colors */}
      <div className="flex flex-wrap gap-2 mb-3">
        {exercise.focusAreas.map((area) => (
          <span
            key={area.id}
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </span>
        ))}
      </div>

      {/* Metadata section */}
      <div className="space-y-2">
        {exercise.evaluation.hasTemplate && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-green-400 text-xs flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {exercise.evaluation.templateName || 'Includes evaluation template'}
            </p>
          </div>
        )}
        
        {exercise.metadata.usageCount > 0 && (
          <p className="text-gray-500 text-xs">
            Used {exercise.metadata.usageCount} times
          </p>
        )}
        
        {exercise.metadata.author && (
          <p className="text-gray-500 text-xs">
            {exercise.display.sourceLabel}
          </p>
        )}
      </div>
    </Card>
  );

  const renderDefaultVersion = () => (
    <Card hoverable className="p-6" onClick={onClick}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-100">{exercise.title}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {exercise.duration.formatted}
          </div>
          {exercise.evaluation.hasTemplate && (
            <div 
              className="flex items-center text-green-400 text-sm" 
              title={exercise.evaluation.templateName || 'Has evaluation template'}
            >
              <FileText className="h-4 w-4" />
            </div>
          )}
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(exercise.id);
              }}
              className="text-yellow-500 hover:text-yellow-400"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exercise.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {exercise.focusAreas.map((area) => (
          <span
            key={area.id}
            className="px-2 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </span>
        ))}
      </div>

      {exercise.evaluation.hasTemplate && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-green-400 text-xs flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            Includes evaluation template
          </p>
        </div>
      )}
      
      {exercise.metadata.author && (
        <p className="text-gray-500 text-xs mt-3">{exercise.display.sourceLabel}</p>
      )}
    </Card>
  );

  // Render based on variant
  if (variant === 'compact') return renderCompactVersion();
  if (variant === 'detailed') return renderDetailedVersion();
  return renderDefaultVersion();
};

// Migration Notes:
// 1. Now uses ExerciseViewModel instead of Exercise DTO
// 2. Uses computed display properties instead of manual logic
// 3. onAdd callback now receives string ID instead of full object
// 4. Supports multiple display variants
// 5. Colors come from the view model, not hardcoded
// 6. All display text computed in the adapter layer