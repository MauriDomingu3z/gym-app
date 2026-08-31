import { UnauthorizedError } from "../../../shared/errors/AppError";
import { issueTokens } from "./issue-tokens";
import type { UsersModulePorts } from "./ports";
import type { AuthResultDTO } from "./user.dto";

export function refreshSession(ports: UsersModulePorts) {
  return async (refreshToken: string): Promise<AuthResultDTO> => {
    const tokenHash = ports.tokenService.hashRefreshToken(refreshToken);
    const stored = await ports.refreshTokenRepository.findByHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token inválido o expirado");
    }

    const user = await ports.userRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedError("Refresh token inválido o expirado");
    }

    await ports.refreshTokenRepository.revoke(tokenHash);
    return issueTokens(ports, user);
  };
}
