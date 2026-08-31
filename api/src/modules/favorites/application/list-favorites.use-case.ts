import { toExerciseDTO, type ExerciseDTO } from "../../exercises/application/exercise.dto";
import type { FavoriteModulePorts } from "./ports";

export function listFavorites(ports: FavoriteModulePorts) {
  return async (userId: string): Promise<ExerciseDTO[]> => {
    const exercises = await ports.favoriteRepository.listFavoriteExercises(userId);
    return exercises.map(toExerciseDTO);
  };
}
