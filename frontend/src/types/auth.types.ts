export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive?: boolean;
  active?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
