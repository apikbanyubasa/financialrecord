'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useAi() {
  const queryClient = useQueryClient();

  const insightsQuery = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiService.getFinancialInsights(),
  });

  const scanMutation = useMutation({
    mutationFn: (file: File) => aiService.scanReceipt(file),
  });

  const nlpMutation = useMutation({
    mutationFn: (text: string) => aiService.parseNlpEntry(text),
  });

  const nlpBatchMutation = useMutation({
    mutationFn: (text: string) => aiService.parseNlpBatch(text),
  });

  const chatMutation = useMutation({
    mutationFn: (prompt: string) => aiService.chatWithAdvisor(prompt),
  });

  return {
    insights: insightsQuery.data,
    isInsightsLoading: insightsQuery.isLoading,
    refetchInsights: insightsQuery.refetch,

    scanReceipt: scanMutation.mutateAsync,
    isScanning: scanMutation.isPending,
    scanError: scanMutation.error,

    parseNlpEntry: nlpMutation.mutateAsync,
    isParsingNlp: nlpMutation.isPending,

    parseNlpBatch: nlpBatchMutation.mutateAsync,
    isParsingNlpBatch: nlpBatchMutation.isPending,

    chatWithAdvisor: chatMutation.mutateAsync,
    isChatting: chatMutation.isPending,
  };
}
