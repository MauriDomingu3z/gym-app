export type WeightUnit = 'kg' | 'lb';

export interface User {
  id: string;
  email: string;
  name: string | null;
  preferredUnit: WeightUnit;
  createdAt: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}
