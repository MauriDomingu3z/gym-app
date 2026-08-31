import type { User } from "../domain/user.entity";
import type { UsersModulePorts } from "./ports";
import { toUserDTO, type AuthResultDTO } from "./user.dto";

export async function issueTokens(ports: UsersModulePorts, user: User): Promise<AuthResultDTO> {
  const accessToken = ports.tokenService.signAccessToken({ userId: user.id });
  const refreshToken = ports.tokenService.createRefreshToken();

  await ports.refreshTokenRepository.save({
    userId: user.id,
    tokenHash: refreshToken.tokenHash,
    expiresAt: refreshToken.expiresAt,
  });

  return { user: toUserDTO(user), accessToken, refreshToken: refreshToken.token };
}
