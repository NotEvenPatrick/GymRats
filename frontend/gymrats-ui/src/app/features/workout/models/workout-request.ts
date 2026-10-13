export interface WorkoutRequest {
  name: string;
  description: string;
  exercises: WorkoutExerciseRequest[]; 
}

export interface WorkoutExerciseRequest {
    exerciseId: string;
    position: number;
    plannedSets: number;
    minReps: number;
    maxReps: number;
}