export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  preferredUnit: 'kg' | 'lb';
  createdAt: string;
}

export interface AuthResult {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
