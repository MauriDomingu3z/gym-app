import path from "node:path";
import cors from "cors";
import express, { type Express } from "express";
import { attribution } from "../config/attribution";
import { exercisesRouter } from "../../modules/exercises/infrastructure/exercises.routes";
import { favoritesRouter } from "../../modules/favorites/infrastructure/favorites.routes";
import { authRouter, usersRouter } from "../../modules/users/infrastructure/users.routes";
import { workoutsRouter } from "../../modules/workouts/infrastructure/workouts.routes";
import { docsRouter } from "./docs.routes";
import { errorMiddleware } from "./errorMiddleware";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/static", express.static(path.resolve(process.cwd(), "public")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/attribution", (_req, res) => {
    res.json(attribution);
  });

  app.use("/api/exercises", exercisesRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/workouts", workoutsRouter);
  app.use("/api/favorites", favoritesRouter);

  app.use("/docs", docsRouter);

  app.use(errorMiddleware);

  return app;
}
