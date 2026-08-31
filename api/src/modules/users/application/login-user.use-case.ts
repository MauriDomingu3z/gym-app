import { UnauthorizedError } from "../../../shared/errors/AppError";
import { issueTokens } from "./issue-tokens";
import type { UsersModulePorts } from "./ports";
import type { AuthResultDTO } from "./user.dto";

export interface LoginUserInput {
  email: string;
  password: string;
}

export function loginUser(ports: UsersModulePorts) {
  return async (input: LoginUserInput): Promise<AuthResultDTO> => {
    const user = await ports.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Email o contraseña inválidos");
    }

    const passwordMatches = await ports.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError("Email o contraseña inválidos");
    }

    return issueTokens(ports, user);
  };
}
