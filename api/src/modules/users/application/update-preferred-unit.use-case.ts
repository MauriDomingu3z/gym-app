import type { WeightUnit } from "../domain/user.entity";
import type { UsersModulePorts } from "./ports";
import { toUserDTO, type UserDTO } from "./user.dto";

export function updatePreferredUnit(ports: UsersModulePorts) {
  return async (userId: string, preferredUnit: WeightUnit): Promise<UserDTO> => {
    const user = await ports.userRepository.updatePreferredUnit(userId, preferredUnit);
    return toUserDTO(user);
  };
}
