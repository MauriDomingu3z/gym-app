import type { Exercise, ExerciseFilter, ExerciseFilterOptions, ExercisePage } from "./exercise.entity";

export interface ExerciseRepository {
  findMany(filter: ExerciseFilter): Promise<ExercisePage>;
  findBySlug(slug: string): Promise<Exercise | null>;
  listFilterOptions(): Promise<ExerciseFilterOptions>;
}
