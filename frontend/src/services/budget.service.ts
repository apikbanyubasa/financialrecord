import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { Budget, BudgetRequest } from '@/types/budget.types';

export const budgetService = {
  async getBudgets(period?: string): Promise<Budget[]> {
    const params = period ? { period } : {};
    const res = await api.get<ApiResponse<Budget[]>>('/user/budgets', { params });
    return res.data.data;
  },

  async setBudget(data: BudgetRequest): Promise<Budget> {
    const res = await api.post<ApiResponse<Budget>>('/user/budgets', data);
    return res.data.data;
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/user/budgets/${id}`);
  },
};
