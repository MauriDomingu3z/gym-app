import type { PasswordHasher } from "../domain/password-hasher";
import type { RefreshTokenRepository } from "../domain/refresh-token.repository";
import type { TokenService } from "../domain/token-service";
import type { UserRepository } from "../domain/user.repository";

export interface UsersModulePorts {
  userRepository: UserRepository;
  refreshTokenRepository: RefreshTokenRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}
