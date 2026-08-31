import { Router } from "express";
import { prisma } from "../../../shared/db/prismaClient";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { createAuthMiddleware } from "../../users/infrastructure/auth.middleware";
import { usersModule } from "../../users/infrastructure/composition";
import { addExerciseToSession } from "../application/add-exercise-to-session.use-case";
import { finishSession } from "../application/finish-session.use-case";
import { getActiveSession } from "../application/get-active-session.use-case";
import { getDashboardSummary } from "../application/get-dashboard-summary.use-case";
import { getExerciseHistory } from "../application/get-exercise-history.use-case";
import { getLastSet } from "../application/get-last-set.use-case";
import { logSet } from "../application/log-set.use-case";
import type { WorkoutModulePorts } from "../application/ports";
import { startSession } from "../application/start-session.use-case";
import { createWorkoutsController } from "./workouts.controller";
import { PrismaWorkoutRepository } from "./prisma-workout.repository";

const ports: WorkoutModulePorts = {
  workoutRepository: new PrismaWorkoutRepository(prisma),
};

const controller = createWorkoutsController({
  getActiveSession: getActiveSession(ports),
  startSession: startSession(ports),
  finishSession: finishSession(ports),
  addExerciseToSession: addExerciseToSession(ports),
  logSet: logSet(ports),
  getLastSet: getLastSet(ports),
  getExerciseHistory: getExerciseHistory(ports),
  getDashboardSummary: getDashboardSummary(ports),
});

const authMiddleware = createAuthMiddleware(usersModule.ports.tokenService);

export const workoutsRouter = Router();
workoutsRouter.use(authMiddleware);

workoutsRouter.get("/sessions/active", asyncHandler(controller.getActive));
workoutsRouter.post("/sessions", asyncHandler(controller.start));
workoutsRouter.post("/sessions/:sessionId/finish", asyncHandler(controller.finish));
workoutsRouter.post("/sessions/:sessionId/exercises", asyncHandler(controller.addExercise));
workoutsRouter.post("/workout-exercises/:workoutExerciseId/sets", asyncHandler(controller.logSet));
workoutsRouter.get("/exercises/:exerciseId/last-set", asyncHandler(controller.lastSet));
workoutsRouter.get("/exercises/:exerciseId/history", asyncHandler(controller.history));
workoutsRouter.get("/dashboard", asyncHandler(controller.dashboard));
