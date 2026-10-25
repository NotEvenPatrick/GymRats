import { SessionPreview } from '../models/session-preview';
import { SessionStatus } from '../models/status';
import { buildSessionRequest } from './session-request-mapper';

describe('buildSessionRequest', () => {
  const preview: SessionPreview = {
    sourceWorkoutId: 'workout-1',
    workoutName: 'Push Day',
    startedAt: '2026-01-01T10:00:00Z',
    sessionExercises: [
      {
        sourceExerciseId: 'exercise-1',
        exerciseName: 'Bankdrücken',
        muscleGroup: 'CHEST',
        position: 1,
        plannedSets: 2,
        minReps: 8,
        maxReps: 12,
        sets: [],
      },
    ],
  };

  it('should map planned values and filled sets', () => {
    const request = buildSessionRequest(
      preview,
      [[{ weight: 60, reps: 10 }, { weight: 62.5, reps: 8 }]],
      SessionStatus.COMPLETED,
    );

    expect(request).toEqual({
      sourceWorkoutId: 'workout-1',
      startedAt: '2026-01-01T10:00:00Z',
      status: SessionStatus.COMPLETED,
      sessionExercises: [
        {
          sourceExerciseId: 'exercise-1',
          position: 1,
          plannedSets: 2,
          minReps: 8,
          maxReps: 12,
          sets: [
            { setNumber: 1, weight: 60, reps: 10 },
            { setNumber: 2, weight: 62.5, reps: 8 },
          ],
        },
      ],
    });
  });

  it('should skip unfilled sets and renumber the remaining ones', () => {
    const request = buildSessionRequest(
      preview,
      [[{ weight: 60, reps: null }, { weight: 60, reps: 9 }]],
      SessionStatus.CANCELLED,
    );

    expect(request.sessionExercises[0].sets).toEqual([{ setNumber: 1, weight: 60, reps: 9 }]);
  });

  it('should return no sets if the form has no values for an exercise', () => {
    const request = buildSessionRequest(preview, [], SessionStatus.CANCELLED);

    expect(request.sessionExercises[0].sets).toEqual([]);
  });
});
