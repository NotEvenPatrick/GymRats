import { SessionStatus } from "./status";

export interface Session {
    id: string;
    sourceWorkoutId: string;
    workoutName: string;
    startedAt: string;
    endedAt: string;
    status: SessionStatus;
    sessionExercises: SessionExercise[];
}

export interface SessionExercise {
    id: string;
    sourceExerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    position: number;
    plannedSets: number;
    minReps: number;
    maxReps: number;
    sets: SessionSet[];
}

export interface SessionSet {
    setNumber: number;
    weight: number | null;
    reps: number | null;
}
