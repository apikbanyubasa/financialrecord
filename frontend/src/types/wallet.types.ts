export type WalletType = 'BANK' | 'EWALLET' | 'CASH' | 'INVESTMENT';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletRequest {
  name: string;
  type: WalletType;
  initialBalance: number;
}
