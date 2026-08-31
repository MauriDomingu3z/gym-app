import type { FavoriteModulePorts } from "./ports";

/** Idempotente: favoritear algo que ya es favorito no es un error. */
export function addFavorite(ports: FavoriteModulePorts) {
  return async (userId: string, exerciseId: string): Promise<void> => {
    await ports.favoriteRepository.addFavorite(userId, exerciseId);
  };
}
