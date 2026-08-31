import type { FavoriteModulePorts } from "./ports";

/** Idempotente: sacar de favoritos algo que ya no lo era no es un error. */
export function removeFavorite(ports: FavoriteModulePorts) {
  return async (userId: string, exerciseId: string): Promise<void> => {
    await ports.favoriteRepository.removeFavorite(userId, exerciseId);
  };
}
