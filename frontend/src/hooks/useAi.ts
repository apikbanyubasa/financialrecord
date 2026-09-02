'use client';

import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';

export function useAi() {
  const nlpMutation = useMutation({
    mutationFn: (text: string) => aiService.parseNlpEntry(text),
  });

  const nlpBatchMutation = useMutation({
    mutationFn: (text: string) => aiService.parseNlpBatch(text),
  });

  return {
    parseNlpEntry: nlpMutation.mutateAsync,
    isParsingNlp: nlpMutation.isPending,

    parseNlpBatch: nlpBatchMutation.mutateAsync,
    isParsingNlpBatch: nlpBatchMutation.isPending,
  };
}
