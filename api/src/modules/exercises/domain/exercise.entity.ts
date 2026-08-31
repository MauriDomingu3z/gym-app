export interface Exercise {
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
}

export interface ExerciseFilter {
  muscle?: string;
  equipment?: string;
  type?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface ExercisePage {
  items: Exercise[];
  total: number;
  page: number;
  limit: number;
}

export interface ExerciseFilterOptions {
  equipment: string[];
  muscles: string[];
  types: string[];
}
