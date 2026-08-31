import type { User, WeightUnit } from "../domain/user.entity";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  preferredUnit: WeightUnit;
  createdAt: Date;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredUnit: user.preferredUnit,
    createdAt: user.createdAt,
  };
}

export interface AuthResultDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
