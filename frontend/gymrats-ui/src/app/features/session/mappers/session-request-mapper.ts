import { SessionPreview } from '../models/session-preview';
import { SessionExerciseRequest, SessionRequest, SessionSetRequest } from '../models/session-request';

export interface SessionSetValue {
  weight: number | null;
  reps: number | null;
}

export function buildSessionRequest(
  preview: SessionPreview,
  setValues: SessionSetValue[][],
): SessionRequest {
  const sessionExercises: SessionExerciseRequest[] = preview.sessionExercises.map((exercise, exerciseIndex) => {
    const sets: SessionSetRequest[] = [];

    for (const { weight, reps } of setValues[exerciseIndex] ?? []) {
      if (weight === null || reps === null) {
        continue;
      }

      sets.push({ setNumber: sets.length + 1, weight, reps });
    }

    return {
      sourceExerciseId: exercise.sourceExerciseId,
      position: exercise.position,
      sets,
    };
  });

  return {
    sourceWorkoutId: preview.sourceWorkoutId,
    startedAt: preview.startedAt,
    sessionExercises,
  };
}
