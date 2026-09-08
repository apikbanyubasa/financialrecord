import { api } from './api';
import {
  ApiResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from '@/types/auth.types';

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const res = await api.get<ApiResponse<UserProfile>>('/user/profile');
    return res.data.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const res = await api.put<ApiResponse<UserProfile>>('/user/profile', data);
    return res.data.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put<ApiResponse<void>>('/user/profile/password', data);
  },

  async resetUserData(password: string): Promise<void> {
    await api.post<ApiResponse<void>>('/user/profile/reset-data', { password });
  },

  async deleteAccount(data: DeleteAccountRequest): Promise<void> {
    await api.delete<ApiResponse<void>>('/user/profile', { data });
  },
};
