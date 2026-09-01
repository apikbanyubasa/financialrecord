import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { AiFinancialInsight, AiScanReceiptResult } from '@/types/ai.types';
import { TransactionRequest } from '@/types/transaction.types';

export const aiService = {
  async scanReceipt(file: File): Promise<AiScanReceiptResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<AiScanReceiptResult>>('/user/ai/scan-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async parseNlpEntry(text: string): Promise<TransactionRequest> {
    const res = await api.post<ApiResponse<TransactionRequest>>('/user/ai/nlp-entry', { text });
    return res.data.data;
  },

  async parseNlpBatch(text: string): Promise<TransactionRequest[]> {
    const res = await api.post<ApiResponse<TransactionRequest[]>>('/user/ai/nlp-batch', { text });
    return res.data.data;
  },

  async getFinancialInsights(): Promise<AiFinancialInsight> {
    const res = await api.get<ApiResponse<AiFinancialInsight>>('/user/ai/insights');
    return res.data.data;
  },

  async chatWithAdvisor(prompt: string): Promise<string> {
    const res = await api.post<ApiResponse<{ reply: string }>>('/user/ai/chat', { prompt });
    return res.data.data.reply;
  },
};
