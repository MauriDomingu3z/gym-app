import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../../shared/errors/AppError";
import type { TokenService } from "../domain/token-service";

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Falta el token de autenticación");
    }

    const token = header.slice("Bearer ".length);
    const payload = tokenService.verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  };
}
