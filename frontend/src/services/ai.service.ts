import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { TransactionRequest } from '@/types/transaction.types';

export const aiService = {
  async parseNlpEntry(text: string): Promise<TransactionRequest> {
    const res = await api.post<ApiResponse<TransactionRequest>>('/user/ai/nlp-entry', { text });
    return res.data.data;
  },

  async parseNlpBatch(text: string): Promise<TransactionRequest[]> {
    const res = await api.post<ApiResponse<TransactionRequest[]>>('/user/ai/nlp-batch', { text });
    return res.data.data;
  },
};
