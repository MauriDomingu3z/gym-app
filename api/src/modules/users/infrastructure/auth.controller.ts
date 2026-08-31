import type { Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../../../shared/errors/AppError";
import type { getProfile } from "../application/get-profile.use-case";
import type { loginUser } from "../application/login-user.use-case";
import type { refreshSession } from "../application/refresh-session.use-case";
import type { registerUser } from "../application/register-user.use-case";
import type { updatePreferredUnit } from "../application/update-preferred-unit.use-case";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken es requerido"),
});

const updatePreferredUnitSchema = z.object({
  preferredUnit: z.enum(["kg", "lb"]),
});

export function createAuthController(deps: {
  registerUser: ReturnType<typeof registerUser>;
  loginUser: ReturnType<typeof loginUser>;
  refreshSession: ReturnType<typeof refreshSession>;
  getProfile: ReturnType<typeof getProfile>;
  updatePreferredUnit: ReturnType<typeof updatePreferredUnit>;
}) {
  return {
    async register(req: Request, res: Response) {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const result = await deps.registerUser(parsed.data);
      res.status(201).json(result);
    },

    async login(req: Request, res: Response) {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const result = await deps.loginUser(parsed.data);
      res.json(result);
    },

    async refresh(req: Request, res: Response) {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const result = await deps.refreshSession(parsed.data.refreshToken);
      res.json(result);
    },

    async me(req: Request, res: Response) {
      const profile = await deps.getProfile(req.userId as string);
      res.json(profile);
    },

    async updateMe(req: Request, res: Response) {
      const parsed = updatePreferredUnitSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.issues[0]?.message ?? "Body inválido");
      }
      const profile = await deps.updatePreferredUnit(req.userId as string, parsed.data.preferredUnit);
      res.json(profile);
    },
  };
}
