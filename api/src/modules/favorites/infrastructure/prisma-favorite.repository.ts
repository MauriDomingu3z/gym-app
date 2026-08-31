import type { PrismaClient } from "@prisma/client";
import type { Exercise } from "../../exercises/domain/exercise.entity";
import type { Favorite } from "../domain/favorite.entity";
import type { FavoriteRepository } from "../domain/favorite.repository";

export class PrismaFavoriteRepository implements FavoriteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async isFavorite(userId: string, exerciseId: string): Promise<boolean> {
    const count = await this.prisma.favorite.count({ where: { userId, exerciseId } });
    return count > 0;
  }

  addFavorite(userId: string, exerciseId: string): Promise<Favorite> {
    return this.prisma.favorite.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      create: { userId, exerciseId },
      update: {},
    });
  }

  async removeFavorite(userId: string, exerciseId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { userId, exerciseId } });
  }

  async listFavoriteExercises(userId: string): Promise<Exercise[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { exercise: true },
    });
    return favorites.map((favorite) => favorite.exercise);
  }
}
