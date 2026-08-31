import type { FavoriteModulePorts } from "./ports";

export function checkFavorite(ports: FavoriteModulePorts) {
  return async (userId: string, exerciseId: string): Promise<boolean> => {
    return ports.favoriteRepository.isFavorite(userId, exerciseId);
  };
}
