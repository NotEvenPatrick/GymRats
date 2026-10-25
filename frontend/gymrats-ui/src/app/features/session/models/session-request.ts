export interface SessionRequest {
    sourceWorkoutId: string;
    startedAt: string;
    sessionExercises: SessionExerciseRequest[];
}

export interface SessionExerciseRequest {
    sourceExerciseId: string;
    position: number;
    sets: SessionSetRequest[];
}

export interface SessionSetRequest {
    setNumber: number;
    weight: number;
    reps: number;
}