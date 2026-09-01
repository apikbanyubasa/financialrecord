export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  isSystemDefault: boolean;
  createdAt?: string;
}

export interface CategoryRequest {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}
