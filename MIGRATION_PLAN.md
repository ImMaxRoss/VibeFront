# Frontend Decoupling Migration Plan

## Overview
This plan outlines the step-by-step migration from tightly coupled frontend-backend architecture to a decoupled view model approach.

## Phase 1: Foundation Setup ✅ COMPLETE

### Created Infrastructure
- [x] View models (`/src/models/viewModels.ts`)
- [x] Adapters (`/src/models/adapters.ts`)
- [x] Service layer example (`/src/services/exerciseService.ts`)
- [x] Custom hooks (`/src/hooks/useExercises.ts`)
- [x] Refactored component example (`/src/components/ExerciseCard.refactored.tsx`)

## Phase 2: Core Entity Migration (Week 1-2)

### Priority 1: Exercise Management
**Files to migrate:**
1. `src/components/ExerciseCard.tsx` → Use `ExerciseViewModel`
2. `src/components/Exercises/EnhancedExerciseCard.tsx` → Use `ExerciseViewModel`
3. `src/components/Exercises/ExerciseDetailModal.tsx` → Use `ExerciseViewModel`
4. `src/components/Exercises/CreateExerciseModal.tsx` → Use `ExerciseFormModel`
5. `src/pages/Exercises.tsx` → Use `useExercises` hook

**Steps:**
1. Create `ExerciseService` (✅ Complete)
2. Create `useExercises` hooks (✅ Complete)
3. Update components one by one
4. Test filtering and search functionality
5. Verify form submission still works

### Priority 2: Team Management
**Files to migrate:**
1. `src/components/Teams/TeamCard.tsx` → Use `TeamViewModel`
2. `src/components/Teams/CreateTeamModal.tsx` → Use form model
3. `src/components/Teams/ManagePerformersModal.tsx` → Use view models
4. `src/pages/Teams.tsx` → Use `useTeams` hook
5. `src/pages/TeamDetail.tsx` → Use `TeamViewModel`

**New files to create:**
- `src/services/teamService.ts`
- `src/hooks/useTeams.ts`

## Phase 3: Practice Session Migration (Week 3-4)

### Priority 1: Live Practice
**Files to migrate:**
1. `src/pages/LivePractice.tsx` → Use `PracticeSessionViewModel`
2. `src/components/Performers/LivePractice/AttendanceSelector.tsx`
3. `src/components/Performers/LivePractice/PracticeTimer.tsx`
4. `src/components/Performers/LivePractice/QuickNotes.tsx`
5. `src/components/Performers/LivePractice/SceneEvaluationModal.tsx`

### Priority 2: Practice History
**Files to migrate:**
1. `src/pages/History.tsx` → Use `PracticeSessionViewModel`
2. `src/components/History/PracticeHistoryDetail.tsx`
3. `src/pages/PracticeDetail.tsx`

**New files to create:**
- `src/services/practiceService.ts`
- `src/hooks/usePracticeSession.ts`
- `src/hooks/usePracticeHistory.ts`

## Phase 4: Lesson Planning Migration (Week 5-6)

### Priority 1: Lesson Management
**Files to migrate:**
1. `src/pages/LessonPlanner.tsx` → Use `LessonViewModel` and `LessonFormModel`
2. `src/components/ScheduledLesson.tsx` → Use `LessonViewModel`

### Priority 2: Evaluation System
**Files to migrate:**
1. `src/components/EvaluationForm.tsx` → Use `EvaluationViewModel`
2. `src/components/Exercises/EvaluationTemplateManager.tsx`

**New files to create:**
- `src/services/lessonService.ts`
- `src/services/evaluationService.ts`
- `src/hooks/useLessons.ts`
- `src/hooks/useEvaluations.ts`

## Phase 5: Dashboard and Analytics (Week 7)

### Files to migrate:
1. `src/pages/Dashboard.tsx` → Use all new view models
2. `src/components/StatCard.tsx` → Use computed stats from services

### New files to create:
- `src/services/analyticsService.ts`
- `src/hooks/useAnalytics.ts`

## Phase 6: API Layer Enhancement (Week 8)

### Backend API Improvements (Optional)
**Potential new endpoints to reduce coupling:**

1. **GET /api/exercises/ui-optimized**
   ```json
   {
     "exercises": [
       {
         "id": "123",
         "displayName": "Yes And Circle",
         "durationText": "15-20 min",
         "focusAreaColors": ["#22c55e", "#3b82f6"],
         "statusBadges": ["Popular", "Has Evaluation"],
         "sourceLabel": "Public Library"
       }
     ]
   }
   ```

2. **GET /api/teams/dashboard-summary**
   ```json
   {
     "teams": [
       {
         "id": "456",
         "displayName": "Tuesday Night Improv",
         "memberSummary": "8 active members",
         "nextSessionText": "Tomorrow at 7:00 PM",
         "activityStatus": "active"
       }
     ]
   }
   ```

3. **GET /api/practice-sessions/history-view**
   ```json
   {
     "sessions": [
       {
         "id": "789",
         "summaryText": "90 min session with 8 participants",
         "dateText": "March 15, 2024",
         "metricsText": "5 exercises, 3 evaluations",
         "statusBadge": "completed"
       }
     ]
   }
   ```

## Implementation Guidelines

### 1. Migration Pattern
```typescript
// OLD: Direct DTO consumption
const MyComponent = ({ exercise }: { exercise: Exercise }) => {
  const duration = exercise.formattedMinimumDuration || `${exercise.minimumDurationMinutes} min`;
  return <div>{exercise.name} - {duration}</div>;
};

// NEW: View model consumption
const MyComponent = ({ exercise }: { exercise: ExerciseViewModel }) => {
  return <div>{exercise.title} - {exercise.duration.formatted}</div>;
};
```

### 2. Service Layer Pattern
```typescript
// Create service for each domain
export class DomainService {
  static async getEntities(): Promise<DomainViewModel[]> {
    const dtos = await domainAPI.getEntities();
    return dtos.map(dto => DomainAdapter.toViewModel(dto));
  }
  
  static async createEntity(form: DomainFormModel): Promise<DomainViewModel> {
    const requestData = DomainAdapter.fromFormModel(form);
    const dto = await domainAPI.create(requestData);
    return DomainAdapter.toViewModel(dto);
  }
}
```

### 3. Custom Hook Pattern
```typescript
export const useDomainEntities = (filters?: FilterModel) => {
  const [entities, setEntities] = useState<DomainViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = async () => {
    try {
      const data = await DomainService.getEntities(filters);
      setEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [filters]);

  return { entities, loading, error, refetch: fetchEntities };
};
```

### 4. Gradual Migration Approach
1. **Week N**: Create view models and adapters for domain
2. **Week N+1**: Create service layer and hooks
3. **Week N+2**: Update components one by one
4. **Week N+3**: Remove old code and add tests

### 5. Testing Strategy
- Create unit tests for adapters
- Test view model transformations
- Verify UI still works with new data flow
- Performance test to ensure no regressions

## Quality Gates

### Phase Completion Criteria
Each phase must meet these criteria before proceeding:

1. **All targeted components migrated**
2. **No direct DTO imports in migrated components**
3. **All existing functionality preserved**
4. **Error handling improved**
5. **Loading states properly managed**
6. **TypeScript errors resolved**

### Migration Verification Checklist
- [ ] Component receives view model instead of DTO
- [ ] All display logic moved to adapter/service layer
- [ ] Form handling uses form models
- [ ] API calls go through service layer
- [ ] Custom hooks used for data fetching
- [ ] Error messages user-friendly
- [ ] Loading states consistent

## Risk Mitigation

### Potential Issues
1. **Breaking changes during migration**
   - Solution: Use feature flags to toggle between old/new implementations
   
2. **Performance impact of additional transformation layer**
   - Solution: Benchmark before/after, optimize adapters if needed
   
3. **Developer confusion during transition**
   - Solution: Clear documentation, pair programming, code reviews

### Rollback Plan
- Keep old components until migration fully tested
- Use git branches for each phase
- Maintain backwards compatibility during transition

## Benefits After Migration

### Developer Experience
- Components focused on presentation logic only
- Easier testing with view models
- Consistent data shapes across UI
- Better TypeScript autocomplete and validation

### Maintainability
- Backend changes don't break frontend
- UI can evolve independently
- Centralized display logic
- Easier to add new API endpoints

### User Experience
- More consistent loading states
- Better error handling
- Optimized data for UI needs
- Potential performance improvements

## Timeline Summary

| Week | Phase | Focus | Deliverables |
|------|-------|-------|--------------|
| 1-2  | Core Entity Migration | Exercises & Teams | Updated components, services, hooks |
| 3-4  | Practice Sessions | Live practice & history | Practice flow working with view models |
| 5-6  | Lesson Planning | Lessons & evaluations | Lesson planner using new architecture |
| 7    | Dashboard | Analytics integration | Dashboard with computed stats |
| 8    | API Enhancement | Backend optimizations | Optional UI-optimized endpoints |

## Success Metrics
- 0 direct DTO imports in components (excluding legacy compatibility)
- All API calls go through service layer
- Improved error handling coverage
- Maintained or improved bundle size
- No regression in functionality