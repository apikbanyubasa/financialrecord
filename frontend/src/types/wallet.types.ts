export type WalletType = 'BANK' | 'EWALLET' | 'CASH' | 'INVESTMENT';
export type PocketType = 'INCOME' | 'EXPENSE' | 'ALL';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  pocketType?: PocketType;
  aiGenerated?: boolean;
  aiInsight?: string;
  icon?: string;
  color?: string;
  categoryName?: string;
  balance: number;
  totalIncome?: number;
  totalExpense?: number;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletRequest {
  name: string;
  type: WalletType;
  pocketType?: PocketType;
  aiGenerated?: boolean;
  aiInsight?: string;
  initialBalance: number;
}
