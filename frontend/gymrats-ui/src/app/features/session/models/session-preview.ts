import { MuscleGroup } from "../../exercise/models/muscle-group";
import { SessionExerciseStatus } from "./status";

export interface SessionPreview {
    sourceWorkoutId: string;
    workoutName: string;
    startedAt: string;
    sessionExercises: SessionExercisePreview[];
}

export interface SessionExercisePreview {
    sourceExerciseId: string;
    exerciseName: string;
    muscleGroup: MuscleGroup;
    position: number;
    plannedSets: number;
    minReps: number;
    maxReps: number;
    status: SessionExerciseStatus;
    sets: SessionSetPreview[];
}

export interface SessionSetPreview {
    setNumber: number;
    weight: number | null;
    reps: number | null;
    completed: boolean;
}
