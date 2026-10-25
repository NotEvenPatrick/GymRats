import { buildWorkoutRequest } from './workout-request-mapper';

describe('buildWorkoutRequest', () => {
  const row = { exerciseId: 'exercise-1', plannedSets: 3, minReps: 8, maxReps: 12 };

  it('should trim texts and number the exercises by position', () => {
    const request = buildWorkoutRequest(
      { name: '  Push Day ', description: ' Brust ' },
      [row, { ...row, exerciseId: 'exercise-2' }],
    );

    expect(request).toEqual({
      name: 'Push Day',
      description: 'Brust',
      exercises: [
        { exerciseId: 'exercise-1', position: 1, plannedSets: 3, minReps: 8, maxReps: 12 },
        { exerciseId: 'exercise-2', position: 2, plannedSets: 3, minReps: 8, maxReps: 12 },
      ],
    });
  });

  it('should return null if a row is incomplete', () => {
    expect(buildWorkoutRequest({ name: 'A', description: '' }, [row, { ...row, exerciseId: null }])).toBeNull();
    expect(buildWorkoutRequest({ name: 'A', description: '' }, [{ ...row, maxReps: null }])).toBeNull();
  });
});
