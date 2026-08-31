export interface AccessTokenPayload {
  userId: string;
}

export interface TokenService {
  signAccessToken(payload: AccessTokenPayload): string;
  verifyAccessToken(token: string): AccessTokenPayload;
  createRefreshToken(): { token: string; tokenHash: string; expiresAt: Date };
  hashRefreshToken(token: string): string;
}
