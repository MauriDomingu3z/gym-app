import type { Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../../shared/errors/AppError";
import type { getExerciseBySlug } from "../application/get-exercise-by-slug.use-case";
import type { listExerciseFilters } from "../application/list-exercise-filters.use-case";
import type { listExercises } from "../application/list-exercises.use-case";

const listQuerySchema = z.object({
  muscle: z.string().optional(),
  equipment: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export function createExercisesController(deps: {
  listExercises: ReturnType<typeof listExercises>;
  getExerciseBySlug: ReturnType<typeof getExerciseBySlug>;
  listExerciseFilters: ReturnType<typeof listExerciseFilters>;
}) {
  return {
    async list(req: Request, res: Response) {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Query inválida");
      }
      const result = await deps.listExercises(parsed.data);
      res.json(result);
    },

    async getBySlug(req: Request, res: Response) {
      const exercise = await deps.getExerciseBySlug(req.params.slug as string);
      res.json(exercise);
    },

    async filters(_req: Request, res: Response) {
      const options = await deps.listExerciseFilters();
      res.json(options);
    },
  };
}
