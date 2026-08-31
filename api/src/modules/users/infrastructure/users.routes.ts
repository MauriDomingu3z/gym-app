import { Router } from "express";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { usersModule } from "./composition";
import { createAuthController } from "./auth.controller";
import { createAuthMiddleware } from "./auth.middleware";

const controller = createAuthController(usersModule);
const authMiddleware = createAuthMiddleware(usersModule.ports.tokenService);

export const authRouter = Router();
authRouter.post("/register", asyncHandler(controller.register));
authRouter.post("/login", asyncHandler(controller.login));
authRouter.post("/refresh", asyncHandler(controller.refresh));

export const usersRouter = Router();
usersRouter.get("/me", authMiddleware, asyncHandler(controller.me));
usersRouter.patch("/me", authMiddleware, asyncHandler(controller.updateMe));
