import { ConflictError } from "../../../shared/errors/AppError";
import { issueTokens } from "./issue-tokens";
import type { UsersModulePorts } from "./ports";
import type { AuthResultDTO } from "./user.dto";

export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
}

export function registerUser(ports: UsersModulePorts) {
  return async (input: RegisterUserInput): Promise<AuthResultDTO> => {
    const existing = await ports.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("Ya existe una cuenta con ese email");
    }

    const passwordHash = await ports.passwordHasher.hash(input.password);
    const user = await ports.userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    return issueTokens(ports, user);
  };
}
