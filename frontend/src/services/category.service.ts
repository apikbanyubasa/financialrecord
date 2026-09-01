import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { Category, CategoryRequest, TransactionType } from '@/types/category.types';

export const categoryService = {
  async getCategories(type?: TransactionType): Promise<Category[]> {
    const params = type ? { type } : {};
    const res = await api.get<ApiResponse<Category[]>>('/user/categories', { params });
    return res.data.data;
  },

  async createCustomCategory(data: CategoryRequest): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>('/user/categories', data);
    return res.data.data;
  },

  async deleteCustomCategory(id: string): Promise<void> {
    await api.delete(`/user/categories/${id}`);
  },
};
