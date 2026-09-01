export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  monthlyLimit: number;
  currentSpent: number;
  remainingAmount: number;
  percentageUsed: number;
  periodMonthYear: string;
  isOverBudget: boolean;
  createdAt: string;
}

export interface BudgetRequest {
  categoryId: string;
  monthlyLimit: number;
  periodMonthYear: string;
}
