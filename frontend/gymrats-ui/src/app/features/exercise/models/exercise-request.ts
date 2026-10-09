import { MuscleGroup } from "./muscle-group";

export interface ExerciseRequest {
    name: string;
    muscleGroup: MuscleGroup;
    description: string;
}