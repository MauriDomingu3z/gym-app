import { prisma } from "../../../shared/db/prismaClient";
import { env } from "../../../shared/config/env";
import { getProfile } from "../application/get-profile.use-case";
import { loginUser } from "../application/login-user.use-case";
import type { UsersModulePorts } from "../application/ports";
import { refreshSession } from "../application/refresh-session.use-case";
import { registerUser } from "../application/register-user.use-case";
import { updatePreferredUnit } from "../application/update-preferred-unit.use-case";
import { BcryptPasswordHasher } from "./bcrypt-password-hasher";
import { JwtTokenService } from "./jwt-token.service";
import { PrismaRefreshTokenRepository } from "./prisma-refresh-token.repository";
import { PrismaUserRepository } from "./prisma-user.repository";

const ports: UsersModulePorts = {
  userRepository: new PrismaUserRepository(prisma),
  refreshTokenRepository: new PrismaRefreshTokenRepository(prisma),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(env.JWT_ACCESS_SECRET),
};

export const usersModule = {
  ports,
  registerUser: registerUser(ports),
  loginUser: loginUser(ports),
  refreshSession: refreshSession(ports),
  getProfile: getProfile(ports),
  updatePreferredUnit: updatePreferredUnit(ports),
};
