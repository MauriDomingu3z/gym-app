import { Router } from "express";
import { prisma } from "../../../shared/db/prismaClient";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { createAuthMiddleware } from "../../users/infrastructure/auth.middleware";
import { usersModule } from "../../users/infrastructure/composition";
import { addFavorite } from "../application/add-favorite.use-case";
import { checkFavorite } from "../application/check-favorite.use-case";
import { listFavorites } from "../application/list-favorites.use-case";
import type { FavoriteModulePorts } from "../application/ports";
import { removeFavorite } from "../application/remove-favorite.use-case";
import { createFavoritesController } from "./favorites.controller";
import { PrismaFavoriteRepository } from "./prisma-favorite.repository";

const ports: FavoriteModulePorts = {
  favoriteRepository: new PrismaFavoriteRepository(prisma),
};

const controller = createFavoritesController({
  listFavorites: listFavorites(ports),
  addFavorite: addFavorite(ports),
  removeFavorite: removeFavorite(ports),
  checkFavorite: checkFavorite(ports),
});

const authMiddleware = createAuthMiddleware(usersModule.ports.tokenService);

export const favoritesRouter = Router();
favoritesRouter.use(authMiddleware);

favoritesRouter.get("/", asyncHandler(controller.list));
favoritesRouter.post("/", asyncHandler(controller.add));
favoritesRouter.delete("/:exerciseId", asyncHandler(controller.remove));
favoritesRouter.get("/:exerciseId/status", asyncHandler(controller.status));
