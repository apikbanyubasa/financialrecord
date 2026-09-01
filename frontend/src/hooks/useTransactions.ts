'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { TransactionRequest } from '@/types/transaction.types';

export function useTransactions(params?: {
  page?: number;
  size?: number;
  type?: string;
  categoryId?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getTransactions(params),
  });

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => transactionService.getDashboardSummary(),
  });

  const createMutation = useMutation({
    mutationFn: (data: TransactionRequest) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (data: TransactionRequest[]) => transactionService.createTransactionsBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    transactions: transactionsQuery.data?.content || [],
    pageData: transactionsQuery.data,
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    refetch: transactionsQuery.refetch,

    summary: summaryQuery.data,
    isSummaryLoading: summaryQuery.isLoading,
    refetchSummary: summaryQuery.refetch,

    createTransaction: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    createTransactionsBatch: createBatchMutation.mutateAsync,
    isCreatingBatch: createBatchMutation.isPending,

    updateTransaction: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
