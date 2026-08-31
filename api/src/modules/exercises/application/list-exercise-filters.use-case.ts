import type { ExerciseRepository } from "../domain/exercise.repository";

export function listExerciseFilters(repository: ExerciseRepository) {
  return () => repository.listFilterOptions();
}
