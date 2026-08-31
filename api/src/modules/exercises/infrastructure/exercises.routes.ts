import { Router } from "express";
import { prisma } from "../../../shared/db/prismaClient";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { createAuthMiddleware } from "../../users/infrastructure/auth.middleware";
import { usersModule } from "../../users/infrastructure/composition";
import { getExerciseBySlug } from "../application/get-exercise-by-slug.use-case";
import { listExerciseFilters } from "../application/list-exercise-filters.use-case";
import { listExercises } from "../application/list-exercises.use-case";
import { createExercisesController } from "./exercises.controller";
import { PrismaExerciseRepository } from "./prisma-exercise.repository";

const repository = new PrismaExerciseRepository(prisma);

const controller = createExercisesController({
  listExercises: listExercises(repository),
  getExerciseBySlug: getExerciseBySlug(repository),
  listExerciseFilters: listExerciseFilters(repository),
});

const authMiddleware = createAuthMiddleware(usersModule.ports.tokenService);

export const exercisesRouter = Router();
exercisesRouter.use(authMiddleware);

exercisesRouter.get("/filters", asyncHandler(controller.filters));
exercisesRouter.get("/:slug", asyncHandler(controller.getBySlug));
exercisesRouter.get("/", asyncHandler(controller.list));
