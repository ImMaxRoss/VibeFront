// Compatibility bridge for ExerciseCard during migration
import React from 'react';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseAdapter } from '../models';
import { Exercise, ExerciseResponse, ExerciseSummaryResponse } from '../types';

interface ExerciseCardBridgeProps {
  exercise: Exercise | ExerciseResponse | ExerciseSummaryResponse;
  onAdd?: (exercise: any) => void;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

/**
 * Bridge component that adapts old Exercise DTOs to new ExerciseCard
 * Use this during migration period to maintain backwards compatibility
 */
export const ExerciseCardBridge: React.FC<ExerciseCardBridgeProps> = ({ 
  exercise, 
  onAdd, 
  onClick,
  variant = 'default'
}) => {
  // Convert DTO to view model
  const viewModel = ExerciseAdapter.toViewModel(exercise);

  // Convert callback from old format to new format
  const handleAdd = onAdd ? (exerciseId: string) => {
    // Pass the original exercise object to maintain compatibility
    onAdd(exercise);
  } : undefined;

  return (
    <ExerciseCard
      exercise={viewModel}
      onAdd={handleAdd}
      onClick={onClick}
      variant={variant}
    />
  );
};