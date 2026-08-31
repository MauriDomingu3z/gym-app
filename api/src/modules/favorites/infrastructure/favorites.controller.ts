import type { Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../../shared/errors/AppError";
import type { addFavorite } from "../application/add-favorite.use-case";
import type { checkFavorite } from "../application/check-favorite.use-case";
import type { listFavorites } from "../application/list-favorites.use-case";
import type { removeFavorite } from "../application/remove-favorite.use-case";

const addFavoriteSchema = z.object({
  exerciseId: z.string().min(1, "exerciseId es requerido"),
});

export function createFavoritesController(deps: {
  listFavorites: ReturnType<typeof listFavorites>;
  addFavorite: ReturnType<typeof addFavorite>;
  removeFavorite: ReturnType<typeof removeFavorite>;
  checkFavorite: ReturnType<typeof checkFavorite>;
}) {
  return {
    async list(req: Request, res: Response) {
      const favorites = await deps.listFavorites(req.userId as string);
      res.json(favorites);
    },

    async add(req: Request, res: Response) {
      const parsed = addFavoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      await deps.addFavorite(req.userId as string, parsed.data.exerciseId);
      res.status(201).end();
    },

    async remove(req: Request, res: Response) {
      await deps.removeFavorite(req.userId as string, req.params.exerciseId as string);
      res.status(204).end();
    },

    async status(req: Request, res: Response) {
      const isFavorite = await deps.checkFavorite(req.userId as string, req.params.exerciseId as string);
      res.json({ isFavorite });
    },
  };
}
