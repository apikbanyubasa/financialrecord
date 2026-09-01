'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { CategoryRequest } from '@/types/category.types';

export function useAdmin(params?: { page?: number; size?: number }) {
  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminService.getPlatformMetrics(),
  });

  const aiStatsQuery = useQuery({
    queryKey: ['admin-ai-stats'],
    queryFn: () => adminService.getAiUsageStats(),
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminService.getAllUsers(params),
  });

  const aiLogsQuery = useQuery({
    queryKey: ['admin-ai-logs', params],
    queryFn: () => adminService.getAiUsageLogs(params),
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminService.toggleUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });

  const createDefaultCategoryMutation = useMutation({
    mutationFn: (data: CategoryRequest) => adminService.createDefaultCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    metrics: metricsQuery.data,
    isMetricsLoading: metricsQuery.isLoading,

    aiStats: aiStatsQuery.data,
    isAiStatsLoading: aiStatsQuery.isLoading,

    usersData: usersQuery.data,
    isUsersLoading: usersQuery.isLoading,

    aiLogsData: aiLogsQuery.data,
    isAiLogsLoading: aiLogsQuery.isLoading,

    toggleUserStatus: toggleUserStatusMutation.mutateAsync,
    isToggling: toggleUserStatusMutation.isPending,

    createDefaultCategory: createDefaultCategoryMutation.mutateAsync,
    isCreatingCategory: createDefaultCategoryMutation.isPending,
  };
}
