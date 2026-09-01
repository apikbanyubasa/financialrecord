export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalTransactions: number;
  totalMoneyVolume: number;
  totalAiRequests: number;
  totalAiCostUsd: number;
  avgAiLatencyMs: number;
}

export interface FeatureUsageBreakdown {
  featureType: string;
  requestCount: number;
  totalTokens: number;
  costUsd: number;
}

export interface AiUsageStats {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  successRatePercentage: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  featureBreakdowns: FeatureUsageBreakdown[];
}

export interface AiUsageLogItem {
  id: string;
  userId?: string;
  featureType: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  status: string;
  errorMessage?: string;
  createdAt: string;
}
