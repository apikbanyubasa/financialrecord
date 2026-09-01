'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { CategoryRequest, TransactionType } from '@/types/category.types';

export function useCategories(type?: TransactionType) {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoryService.getCategories(type),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryRequest) => categoryService.createCustomCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCustomCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    refetch: categoriesQuery.refetch,

    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
