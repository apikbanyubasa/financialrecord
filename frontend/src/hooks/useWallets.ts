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

  return {
    wallets: walletsQuery.data || [],
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
