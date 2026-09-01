import { api } from './api';
import { ApiResponse } from '@/types/auth.types';
import { Wallet, WalletRequest } from '@/types/wallet.types';

export const walletService = {
  async getWallets(): Promise<Wallet[]> {
    const res = await api.get<ApiResponse<Wallet[]>>('/user/wallets');
    return res.data.data;
  },

  async getWalletById(id: string): Promise<Wallet> {
    const res = await api.get<ApiResponse<Wallet>>(`/user/wallets/${id}`);
    return res.data.data;
  },

  async createWallet(data: WalletRequest): Promise<Wallet> {
    const res = await api.post<ApiResponse<Wallet>>('/user/wallets', data);
    return res.data.data;
  },

  async updateWallet(id: string, data: WalletRequest): Promise<Wallet> {
    const res = await api.put<ApiResponse<Wallet>>(`/user/wallets/${id}`, data);
    return res.data.data;
  },

  async deleteWallet(id: string): Promise<void> {
    await api.delete(`/user/wallets/${id}`);
  },
};
