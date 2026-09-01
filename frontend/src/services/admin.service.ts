import { api } from './api';
import { ApiResponse, UserProfile } from '@/types/auth.types';
import { AdminMetrics, AiUsageLogItem, AiUsageStats } from '@/types/admin.types';
import { PageResponse } from '@/types/transaction.types';
import { Category, CategoryRequest } from '@/types/category.types';

export const adminService = {
  async getPlatformMetrics(): Promise<AdminMetrics> {
    const res = await api.get<ApiResponse<AdminMetrics>>('/admin/dashboard/metrics');
    return res.data.data;
  },

  async getAllUsers(params?: { page?: number; size?: number }): Promise<PageResponse<UserProfile>> {
    const res = await api.get<ApiResponse<PageResponse<UserProfile>>>('/admin/users', { params });
    return res.data.data;
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<UserProfile> {
    const res = await api.patch<ApiResponse<UserProfile>>(`/admin/users/${userId}/status`, null, {
      params: { isActive },
    });
    return res.data.data;
  },

  async getAiUsageStats(): Promise<AiUsageStats> {
    const res = await api.get<ApiResponse<AiUsageStats>>('/admin/ai-monitoring/stats');
    return res.data.data;
  },

  async getAiUsageLogs(params?: { page?: number; size?: number }): Promise<PageResponse<AiUsageLogItem>> {
    const res = await api.get<ApiResponse<PageResponse<AiUsageLogItem>>>('/admin/ai-monitoring/logs', { params });
    return res.data.data;
  },

  async createDefaultCategory(data: CategoryRequest): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/admin/categories/default', data);
    return res.data.data;
  },
};
