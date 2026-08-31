import type { ExerciseFilter } from "../domain/exercise.entity";
import type { ExerciseRepository } from "../domain/exercise.repository";
import { toExerciseDTO } from "./exercise.dto";

export function listExercises(repository: ExerciseRepository) {
  return async (filter: ExerciseFilter) => {
    const page = await repository.findMany(filter);
    return { ...page, items: page.items.map(toExerciseDTO) };
  };
}
