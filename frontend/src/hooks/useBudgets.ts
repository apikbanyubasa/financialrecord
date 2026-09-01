'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budget.service';
import { BudgetRequest } from '@/types/budget.types';

export function useBudgets(period?: string) {
  const queryClient = useQueryClient();

  const budgetsQuery = useQuery({
    queryKey: ['budgets', period],
    queryFn: () => budgetService.getBudgets(period),
  });

  const setMutation = useMutation({
    mutationFn: (data: BudgetRequest) => budgetService.setBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    budgets: budgetsQuery.data || [],
    isLoading: budgetsQuery.isLoading,
    isError: budgetsQuery.isError,
    refetch: budgetsQuery.refetch,

    setBudget: setMutation.mutateAsync,
    isSetting: setMutation.isPending,

    deleteBudget: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
