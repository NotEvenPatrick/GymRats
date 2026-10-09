import { MuscleGroup } from "./muscle-group";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
}