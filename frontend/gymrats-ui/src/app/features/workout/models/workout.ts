import { MuscleGroup } from "../../exercise/models/muscle-group";

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    id: string;
    exerciseId: string;
    exerciseName: string;
    muscleGroup: MuscleGroup
    position: number;
    plannedSets: number;
    minReps: number;
    maxReps: number;
}
