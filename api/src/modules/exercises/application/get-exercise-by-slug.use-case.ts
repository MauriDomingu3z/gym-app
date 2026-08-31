import { NotFoundError } from "../../../shared/errors/AppError";
import type { ExerciseRepository } from "../domain/exercise.repository";
import { toExerciseDTO } from "./exercise.dto";

export function getExerciseBySlug(repository: ExerciseRepository) {
  return async (slug: string) => {
    const exercise = await repository.findBySlug(slug);
    if (!exercise) {
      throw new NotFoundError(`No existe un ejercicio con slug "${slug}"`);
    }
    return toExerciseDTO(exercise);
  };
}
