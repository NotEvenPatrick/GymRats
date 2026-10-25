import { SessionPreview } from '../models/session-preview';
import { SessionExerciseRequest, SessionRequest, SessionSetRequest } from '../models/session-request';
import { SessionStatus } from '../models/status';

export interface SessionSetValue {
  weight: number | null;
  reps: number | null;
}

export function buildSessionRequest(
  preview: SessionPreview,
  setValues: SessionSetValue[][],
  status: SessionStatus,
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
      plannedSets: exercise.plannedSets,
      minReps: exercise.minReps,
      maxReps: exercise.maxReps,
      sets,
    };
  });

  return {
    sourceWorkoutId: preview.sourceWorkoutId,
    startedAt: preview.startedAt,
    status,
    sessionExercises,
  };
}
