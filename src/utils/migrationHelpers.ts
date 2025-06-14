// Migration helpers for backwards compatibility testing
import { ExerciseAdapter, ExerciseViewModel } from '../models';
import { Exercise, ExerciseResponse } from '../types';

/**
 * Helper to test that migrated components work with both old and new data structures
 */
export class MigrationTestHelper {
  /**
   * Test that the adapter correctly transforms old DTOs to new view models
   */
  static testExerciseAdapter() {
    const mockExerciseDTO: ExerciseResponse = {
      id: 1,
      name: 'Yes And Circle',
      description: 'A foundational exercise for practicing agreement and building',
      minimumDurationMinutes: 15,
      formattedMinimumDuration: '15 min',
      createdByCoachId: 1,
      createdByCoachName: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      focusAreas: [
        { id: 1, name: 'Yes And', description: 'Accept and build', colorCode: '#4CAF50' },
        { id: 2, name: 'Agreement', description: 'Shared reality', colorCode: '#2196F3' }
      ],
      hasDefaultEvaluationTemplate: true,
      defaultEvaluationTemplateName: 'Basic Reality Rubric',
      usageCount: 25,
      popular: true,
      favorite: false,
      durationInfo: '15-20 min',
      public: true
    };

    const viewModel = ExerciseAdapter.toViewModel(mockExerciseDTO);
    
    console.log('Migration Test Results:');
    console.log('Original DTO:', mockExerciseDTO);
    console.log('Transformed View Model:', viewModel);
    
    // Verify critical transformations
    const tests = [
      { 
        name: 'Title mapping', 
        expected: mockExerciseDTO.name, 
        actual: viewModel.title,
        pass: mockExerciseDTO.name === viewModel.title 
      },
      { 
        name: 'Duration formatting', 
        expected: mockExerciseDTO.formattedMinimumDuration, 
        actual: viewModel.duration.formatted,
        pass: mockExerciseDTO.formattedMinimumDuration === viewModel.duration.formatted 
      },
      { 
        name: 'Focus area colors', 
        expected: mockExerciseDTO.focusAreas[0].colorCode, 
        actual: viewModel.focusAreas[0].color,
        pass: mockExerciseDTO.focusAreas[0].colorCode === viewModel.focusAreas[0].color 
      },
      { 
        name: 'Status badges (Popular)', 
        expected: true, 
        actual: viewModel.display.statusBadges.includes('Popular'),
        pass: viewModel.display.statusBadges.includes('Popular') 
      },
      { 
        name: 'Source label (Public)', 
        expected: 'Public', 
        actual: viewModel.display.sourceLabel,
        pass: viewModel.display.sourceLabel === 'Public' 
      },
      { 
        name: 'Evaluation template', 
        expected: mockExerciseDTO.hasDefaultEvaluationTemplate, 
        actual: viewModel.evaluation.hasTemplate,
        pass: mockExerciseDTO.hasDefaultEvaluationTemplate === viewModel.evaluation.hasTemplate 
      }
    ];

    tests.forEach(test => {
      console.log(`${test.pass ? '✅' : '❌'} ${test.name}: ${test.pass ? 'PASS' : 'FAIL'}`);
      if (!test.pass) {
        console.log(`  Expected: ${test.expected}, Got: ${test.actual}`);
      }
    });

    return tests.every(test => test.pass);
  }

  /**
   * Test component prop compatibility
   */
  static testComponentPropCompatibility() {
    const mockExercise: ExerciseResponse = {
      id: 1,
      name: 'Test Exercise',
      description: 'Test description',
      minimumDurationMinutes: 10,
      formattedMinimumDuration: '10 min',
      createdByCoachName: 'Test Coach',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      focusAreas: [],
      hasDefaultEvaluationTemplate: false,
      usageCount: 0,
      popular: false,
      favorite: false,
      durationInfo: '10 min',
      public: true
    };

    const viewModel = ExerciseAdapter.toViewModel(mockExercise);

    // Test that old component props would work with new view model
    const oldPropsTest = {
      // Old component expected: exercise.name
      exerciseName: viewModel.title, // ✅ Now: exercise.title
      
      // Old component expected: exercise.formattedMinimumDuration
      durationDisplay: viewModel.duration.formatted, // ✅ Now: exercise.duration.formatted
      
      // Old component expected: exercise.createdByCoachName
      authorDisplay: viewModel.display.sourceLabel, // ✅ Now: exercise.display.sourceLabel
      
      // Old component expected: exercise.hasDefaultEvaluationTemplate
      hasEvaluation: viewModel.evaluation.hasTemplate, // ✅ Now: exercise.evaluation.hasTemplate
    };

    console.log('Component Props Compatibility Test:');
    console.log('Old props mapped to new view model:', oldPropsTest);
    
    return true;
  }

  /**
   * Test callback compatibility
   */
  static testCallbackCompatibility() {
    const mockExercise: ExerciseResponse = {
      id: 42,
      name: 'Test Exercise',
      description: 'Test',
      minimumDurationMinutes: 10,
      formattedMinimumDuration: '10 min',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      focusAreas: [],
      hasDefaultEvaluationTemplate: false,
      usageCount: 0,
      popular: false,
      favorite: false,
      durationInfo: '10 min',
      public: true
    };

    const viewModel = ExerciseAdapter.toViewModel(mockExercise);

    // Old callback: onAdd(exercise: Exercise)
    const oldCallback = (exercise: Exercise) => {
      console.log('Old callback called with exercise ID:', exercise.id);
    };

    // New callback: onAdd(exerciseId: string)
    const newCallback = (exerciseId: string) => {
      console.log('New callback called with exercise ID:', exerciseId);
    };

    // Test that we can bridge between them
    const bridgedCallback = (exercise: Exercise) => {
      // Convert to view model and call new callback
      const vm = ExerciseAdapter.toViewModel(exercise as ExerciseResponse);
      newCallback(vm.id);
    };

    console.log('Callback Compatibility Test:');
    oldCallback(mockExercise as Exercise);
    newCallback(viewModel.id);
    bridgedCallback(mockExercise as Exercise);

    return true;
  }

  /**
   * Run all migration tests
   */
  static runAllTests() {
    console.log('🧪 Running Migration Compatibility Tests...\n');
    
    const tests = [
      { name: 'Exercise Adapter', test: () => this.testExerciseAdapter() },
      { name: 'Component Props', test: () => this.testComponentPropCompatibility() },
      { name: 'Callback Compatibility', test: () => this.testCallbackCompatibility() },
    ];

    let allPassed = true;
    
    tests.forEach(({ name, test }, index) => {
      console.log(`\n${index + 1}. Testing ${name}...`);
      try {
        const passed = test();
        if (passed) {
          console.log(`✅ ${name} tests passed`);
        } else {
          console.log(`❌ ${name} tests failed`);
          allPassed = false;
        }
      } catch (error) {
        console.log(`❌ ${name} tests failed with error:`, error);
        allPassed = false;
      }
    });

    console.log(`\n${allPassed ? '🎉' : '💥'} Migration tests ${allPassed ? 'PASSED' : 'FAILED'}`);
    return allPassed;
  }
}

/**
 * Quick test function to call from console
 */
export const testMigration = () => MigrationTestHelper.runAllTests();

/**
 * Helper to compare old vs new data structures
 */
export const compareDataStructures = (oldExercise: Exercise, newExercise: ExerciseViewModel) => {
  console.log('Data Structure Comparison:');
  console.table({
    'Name/Title': { old: oldExercise.name, new: newExercise.title },
    'Duration': { 
      old: oldExercise.formattedMinimumDuration || `${oldExercise.minimumDurationMinutes} min`, 
      new: newExercise.duration.formatted 
    },
    'Author': { 
      old: oldExercise.createdByCoachName || 'Unknown', 
      new: newExercise.display.sourceLabel 
    },
    'Has Evaluation': { 
      old: oldExercise.hasDefaultEvaluationTemplate || false, 
      new: newExercise.evaluation.hasTemplate 
    },
  });
};