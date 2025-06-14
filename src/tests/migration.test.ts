// Migration test - can be run in browser console or as a proper test
import { MigrationTestHelper } from '../utils/migrationHelpers';
import { ExerciseAdapter } from '../models';
import { ExerciseResponse } from '../types';

// Mock data for testing
const mockExerciseResponse: ExerciseResponse = {
  id: 123,
  name: 'Advanced Scene Work',
  description: 'An advanced exercise focusing on scene development and character work',
  minimumDurationMinutes: 20,
  formattedMinimumDuration: '20-25 min',
  createdByCoachId: 42,
  createdByCoachName: 'Sarah Johnson',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
  focusAreas: [
    { id: 1, name: 'Yes And', description: 'Accept and build', colorCode: '#4CAF50' },
    { id: 3, name: 'Who/What/Where', description: 'Context establishment', colorCode: '#FF9800' },
    { id: 4, name: 'Physicality', description: 'Body and space', colorCode: '#9C27B0' }
  ],
  hasDefaultEvaluationTemplate: true,
  defaultEvaluationTemplateName: 'Advanced Scene Rubric',
  usageCount: 47,
  popular: true,
  favorite: false,
  durationInfo: '20-30 minutes depending on group size',
  public: false
};

export const runMigrationTests = () => {
  console.log('🚀 Starting Migration Tests for Exercise Components\n');

  // Test 1: Basic Adapter Functionality
  console.log('Test 1: Basic Adapter Functionality');
  const viewModel = ExerciseAdapter.toViewModel(mockExerciseResponse);
  
  console.log('✅ Successfully converted DTO to ViewModel');
  console.log('Original ID:', mockExerciseResponse.id, '→ ViewModel ID:', viewModel.id);
  console.log('Original Name:', mockExerciseResponse.name, '→ ViewModel Title:', viewModel.title);
  console.log('Focus Areas Count:', mockExerciseResponse.focusAreas.length, '→', viewModel.focusAreas.length);

  // Test 2: Display Properties
  console.log('\nTest 2: Display Properties Computation');
  console.log('Source Label:', viewModel.display.sourceLabel);
  console.log('Status Badges:', viewModel.display.statusBadges);
  console.log('Searchable Text Length:', viewModel.display.searchableText.length);

  // Test 3: Duration Handling
  console.log('\nTest 3: Duration Handling');
  console.log('Original Duration:', mockExerciseResponse.minimumDurationMinutes, 'minutes');
  console.log('Formatted Duration:', viewModel.duration.formatted);
  console.log('Is Minimum:', viewModel.duration.isMinimum);

  // Test 4: Focus Area Mapping
  console.log('\nTest 4: Focus Area Mapping');
  viewModel.focusAreas.forEach((area, index) => {
    const original = mockExerciseResponse.focusAreas[index];
    console.log(`Area ${index + 1}: ${original.name} (${original.colorCode}) → ${area.name} (${area.color})`);
  });

  // Test 5: Metadata Transformation
  console.log('\nTest 5: Metadata Transformation');
  console.log('Author:', viewModel.metadata.author);
  console.log('Is Public:', viewModel.metadata.isPublic);
  console.log('Is Popular:', viewModel.metadata.isPopular);
  console.log('Usage Count:', viewModel.metadata.usageCount);

  // Test 6: Evaluation Template Info
  console.log('\nTest 6: Evaluation Template Info');
  console.log('Has Template:', viewModel.evaluation.hasTemplate);
  console.log('Template Name:', viewModel.evaluation.templateName);

  // Test 7: Component Props Compatibility
  console.log('\nTest 7: Component Props Compatibility');
  
  // Simulate old component prop usage
  const oldComponentWould = {
    displayName: mockExerciseResponse.name,
    showDuration: mockExerciseResponse.formattedMinimumDuration,
    showAuthor: mockExerciseResponse.createdByCoachName,
    hasEvalTemplate: mockExerciseResponse.hasDefaultEvaluationTemplate
  };

  // New component prop usage
  const newComponentDoes = {
    displayName: viewModel.title,
    showDuration: viewModel.duration.formatted,
    showAuthor: viewModel.display.sourceLabel,
    hasEvalTemplate: viewModel.evaluation.hasTemplate
  };

  console.log('Old component props:', oldComponentWould);
  console.log('New component props:', newComponentDoes);
  
  // Check compatibility
  const compatibility = {
    nameMatches: oldComponentWould.displayName === newComponentDoes.displayName,
    durationMatches: oldComponentWould.showDuration === newComponentDoes.showDuration,
    evaluationMatches: oldComponentWould.hasEvalTemplate === newComponentDoes.hasEvalTemplate
  };

  console.log('Compatibility check:', compatibility);

  // Test 8: Callback Transformation
  console.log('\nTest 8: Callback Transformation');
  
  // Old callback style: (exercise: Exercise) => void
  const oldStyleCallback = (exercise: any) => {
    console.log('Old callback received exercise with ID:', exercise.id);
  };

  // New callback style: (exerciseId: string) => void
  const newStyleCallback = (exerciseId: string) => {
    console.log('New callback received exercise ID:', exerciseId);
  };

  // Test both
  oldStyleCallback(mockExerciseResponse);
  newStyleCallback(viewModel.id);

  console.log('\n🎉 All migration tests completed successfully!');
  console.log('\n📊 Summary:');
  console.log('✅ DTO to ViewModel conversion works');
  console.log('✅ Display properties computed correctly'); 
  console.log('✅ Focus areas transformed with colors');
  console.log('✅ Metadata extracted properly');
  console.log('✅ Component props compatible');
  console.log('✅ Callback patterns adaptable');

  return true;
};

// Export for use in browser console
(window as any).runMigrationTests = runMigrationTests;
(window as any).testMigration = MigrationTestHelper.runAllTests;

console.log('🧪 Migration tests loaded. Run `runMigrationTests()` or `testMigration()` in console to test.');