import type { Exercise } from "../domain/exercise.entity";

export interface ExerciseDTO {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  instructionsEs: string[];
  exerciseType: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  isStretch: boolean;
  frames: string[];
  defaultRestSeconds: number;
}

export function toExerciseDTO(exercise: Exercise): ExerciseDTO {
  return {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    nameEs: exercise.nameEs,
    instructionsEs: exercise.instructionsEs,
    exerciseType: exercise.exerciseType,
    equipment: exercise.equipment,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles,
    isStretch: exercise.isStretch,
    frames: exercise.frames,
    defaultRestSeconds: exercise.defaultRestSeconds,
  };
}
