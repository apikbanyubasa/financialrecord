'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet.service';
import { WalletRequest } from '@/types/wallet.types';

export function useWallets() {
  const queryClient = useQueryClient();

  const walletsQuery = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletService.getWallets(),
  });

  const createMutation = useMutation({
    mutationFn: (data: WalletRequest) => walletService.createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WalletRequest }) => walletService.updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => walletService.deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const allWallets = walletsQuery.data || [];

  const incomeWallets = allWallets.filter(
    (w) => w.pocketType === 'INCOME'
  );

  const expenseWallets = allWallets.filter(
    (w) => w.pocketType !== 'INCOME'
  );

  const totalIncomeBalance = incomeWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const totalExpenseBalance = expenseWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const totalAllBalance = allWallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  return {
    wallets: allWallets,
    incomeWallets,
    expenseWallets,
    totalIncomeBalance,
    totalExpenseBalance,
    totalAllBalance,
    isLoading: walletsQuery.isLoading,
    isError: walletsQuery.isError,
    refetch: walletsQuery.refetch,

    createWallet: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateWallet: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteWallet: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
