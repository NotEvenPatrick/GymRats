import { SessionStatus } from "./status";

export interface SessionRequest {
    sourceWorkoutId: string;
    startedAt: string;
    status: SessionStatus;
    sessionExercises: SessionExerciseRequest[];
}

export interface SessionExerciseRequest {
    sourceExerciseId: string;
    position: number;
    plannedSets: number;
    minReps: number;
    maxReps: number;
    sets: SessionSetRequest[];
}

export interface SessionSetRequest {
    setNumber: number;
    weight: number;
    reps: number;
}