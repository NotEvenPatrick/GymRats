import { WorkoutRequest } from '../models/workout-request';

export interface WorkoutFormValue {
  name: string;
  description: string;
}

export interface WorkoutExerciseRowValue {
  exerciseId: string | null;
  plannedSets: number | null;
  minReps: number | null;
  maxReps: number | null;
}

// Liefert null, wenn eine Zeile unvollständig ist.
export function buildWorkoutRequest(
  value: WorkoutFormValue,
  rows: WorkoutExerciseRowValue[],
): WorkoutRequest | null {
  const exercises: WorkoutRequest['exercises'] = [];

  for (const [index, { exerciseId, plannedSets, minReps, maxReps }] of rows.entries()) {
    if (exerciseId === null || plannedSets === null || minReps === null || maxReps === null) {
      return null;
    }

    exercises.push({ exerciseId, position: index + 1, plannedSets, minReps, maxReps });
  }

  return {
    name: value.name.trim(),
    description: value.description.trim(),
    exercises,
  };
}
