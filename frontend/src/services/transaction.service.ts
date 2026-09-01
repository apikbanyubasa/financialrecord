import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { DashboardSummary, PageResponse, Transaction, TransactionRequest } from '@/types/transaction.types';

export const transactionService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await api.get<ApiResponse<DashboardSummary>>('/user/dashboard/summary');
    return res.data.data;
  },

  async getTransactions(params?: {
    page?: number;
    size?: number;
    type?: string;
    categoryId?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PageResponse<Transaction>> {
    const res = await api.get<ApiResponse<PageResponse<Transaction>>>('/user/transactions', { params });
    return res.data.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await api.get<ApiResponse<Transaction>>(`/user/transactions/${id}`);
    return res.data.data;
  },

  async createTransaction(data: TransactionRequest): Promise<Transaction> {
    const res = await api.post<ApiResponse<Transaction>>('/user/transactions', data);
    return res.data.data;
  },

  async createTransactionsBatch(data: TransactionRequest[]): Promise<Transaction[]> {
    const res = await api.post<ApiResponse<Transaction[]>>('/user/transactions/batch', data);
    return res.data.data;
  },

  async updateTransaction(id: string, data: TransactionRequest): Promise<Transaction> {
    const res = await api.put<ApiResponse<Transaction>>(`/user/transactions/${id}`, data);
    return res.data.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/user/transactions/${id}`);
  },
};
