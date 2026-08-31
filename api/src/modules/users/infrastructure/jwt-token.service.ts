import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../shared/errors/AppError";
import type { AccessTokenPayload, TokenService } from "../domain/token-service";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export class JwtTokenService implements TokenService {
  constructor(private readonly accessTokenSecret: string) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, { expiresIn: ACCESS_TOKEN_TTL });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError("Token inválido o expirado");
    }
  }

  createRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
    const token = crypto.randomBytes(40).toString("hex");
    return {
      token,
      tokenHash: this.hashRefreshToken(token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    };
  }

  hashRefreshToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
