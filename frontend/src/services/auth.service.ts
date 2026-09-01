import { api } from './api';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@/types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const authData = res.data.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
    }
    return authData;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const authData = res.data.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
    }
    return authData;
  },

  async getMe(): Promise<UserProfile> {
    const res = await api.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  },

  getCurrentUser(): AuthResponse | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
};
