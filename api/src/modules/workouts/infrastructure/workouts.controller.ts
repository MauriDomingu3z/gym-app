import type { Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../../shared/errors/AppError";
import type { addExerciseToSession } from "../application/add-exercise-to-session.use-case";
import type { finishSession } from "../application/finish-session.use-case";
import type { getActiveSession } from "../application/get-active-session.use-case";
import type { getDashboardSummary } from "../application/get-dashboard-summary.use-case";
import type { getExerciseHistory } from "../application/get-exercise-history.use-case";
import type { getLastSet } from "../application/get-last-set.use-case";
import type { logSet } from "../application/log-set.use-case";
import type { startSession } from "../application/start-session.use-case";

const addExerciseSchema = z.object({
  exerciseId: z.string().min(1, "exerciseId es requerido"),
});

const logSetSchema = z.object({
  weightKg: z.number().positive().optional(),
  reps: z.number().int().positive().optional(),
  durationSeconds: z.number().int().positive().optional(),
  restSeconds: z.number().int().nonnegative().optional(),
});

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50),
});

export function createWorkoutsController(deps: {
  getActiveSession: ReturnType<typeof getActiveSession>;
  startSession: ReturnType<typeof startSession>;
  finishSession: ReturnType<typeof finishSession>;
  addExerciseToSession: ReturnType<typeof addExerciseToSession>;
  logSet: ReturnType<typeof logSet>;
  getLastSet: ReturnType<typeof getLastSet>;
  getExerciseHistory: ReturnType<typeof getExerciseHistory>;
  getDashboardSummary: ReturnType<typeof getDashboardSummary>;
}) {
  return {
    async getActive(req: Request, res: Response) {
      const session = await deps.getActiveSession(req.userId as string);
      res.json(session);
    },

    async start(req: Request, res: Response) {
      const session = await deps.startSession(req.userId as string);
      res.status(201).json(session);
    },

    async finish(req: Request, res: Response) {
      const session = await deps.finishSession(req.userId as string, req.params.sessionId as string);
      res.json(session);
    },

    async addExercise(req: Request, res: Response) {
      const parsed = addExerciseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const workoutExercise = await deps.addExerciseToSession({
        userId: req.userId as string,
        sessionId: req.params.sessionId as string,
        exerciseId: parsed.data.exerciseId,
      });
      res.status(201).json(workoutExercise);
    },

    async logSet(req: Request, res: Response) {
      const parsed = logSetSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const set = await deps.logSet(req.userId as string, req.params.workoutExerciseId as string, parsed.data);
      res.status(201).json(set);
    },

    async lastSet(req: Request, res: Response) {
      const set = await deps.getLastSet(req.userId as string, req.params.exerciseId as string);
      res.json(set);
    },

    async history(req: Request, res: Response) {
      const parsed = historyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Query inválida");
      }
      const history = await deps.getExerciseHistory(
        req.userId as string,
        req.params.exerciseId as string,
        parsed.data.limit,
      );
      res.json(history);
    },

    async dashboard(req: Request, res: Response) {
      const summary = await deps.getDashboardSummary(req.userId as string);
      res.json(summary);
    },
  };
}
