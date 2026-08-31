import type { NewUser, User, WeightUnit } from "./user.entity";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
  updatePreferredUnit(userId: string, preferredUnit: WeightUnit): Promise<User>;
}
