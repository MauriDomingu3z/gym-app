import type { Exercise } from "../../exercises/domain/exercise.entity";
import type { Favorite } from "./favorite.entity";

export interface FavoriteRepository {
  isFavorite(userId: string, exerciseId: string): Promise<boolean>;
  addFavorite(userId: string, exerciseId: string): Promise<Favorite>;
  removeFavorite(userId: string, exerciseId: string): Promise<void>;
  /** Ejercicios favoritos completos, más reciente primero — mismo shape que el catálogo. */
  listFavoriteExercises(userId: string): Promise<Exercise[]>;
}
