import { TransactionType } from './category.types';
import { Wallet } from './wallet.types';

export interface Transaction {
  id: string;
  walletId: string;
  walletName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description?: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface TransactionRequest {
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  description?: string;
  isRecurring?: boolean;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon?: string;
  color?: string;
  amount: number;
  percentage: number;
}

export interface CashflowDataPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  netSavingsThisMonth: number;
  savingsRatePercentage: number;
  categoryExpenses: CategoryBreakdownItem[];
  categoryIncomes: CategoryBreakdownItem[];
  cashflowTrend: CashflowDataPoint[];
  wallets: Wallet[];
  recentTransactions: Transaction[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}
