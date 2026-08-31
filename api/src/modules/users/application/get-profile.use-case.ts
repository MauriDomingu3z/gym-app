import { NotFoundError } from "../../../shared/errors/AppError";
import type { UsersModulePorts } from "./ports";
import { toUserDTO, type UserDTO } from "./user.dto";

export function getProfile(ports: UsersModulePorts) {
  return async (userId: string): Promise<UserDTO> => {
    const user = await ports.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }
    return toUserDTO(user);
  };
}
