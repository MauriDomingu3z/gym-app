import type { FavoriteRepository } from "../domain/favorite.repository";

export interface FavoriteModulePorts {
  favoriteRepository: FavoriteRepository;
}
