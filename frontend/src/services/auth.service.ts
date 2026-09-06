import { api } from './api';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@/types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const authData = res.data.data;
    if (typeof window !== 'undefined' && authData) {
      // Store only non-sensitive display meta, never the JWT token (which is in HttpOnly cookie)
      localStorage.setItem('user_meta', JSON.stringify({
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      }));
    }
    return authData;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const authData = res.data.data;
    if (typeof window !== 'undefined' && authData) {
      localStorage.setItem('user_meta', JSON.stringify({
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      }));
    }
    return authData;
  },

  async getMe(): Promise<UserProfile> {
    const res = await api.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_meta');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  },

  getSavedUserMeta(): Partial<AuthResponse> | null {
    if (typeof window !== 'undefined') {
      const meta = localStorage.getItem('user_meta');
      return meta ? JSON.parse(meta) : null;
    }
    return null;
  },
};
