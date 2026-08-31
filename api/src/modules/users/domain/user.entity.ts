export type WeightUnit = "kg" | "lb";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  preferredUnit: WeightUnit;
  createdAt: Date;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  name?: string;
}
