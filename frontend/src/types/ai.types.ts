export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface AiScanReceiptResult {
  merchant: string;
  transactionDate: string;
  totalAmount: number;
  suggestedCategory: string;
  type: string;
  detectedPaymentMethod: string;
  items: ReceiptItem[];
  confidenceScore: number;
  notes: string;
  receiptImageUrl?: string;
}

export interface AdvisorRecommendation {
  category: string;
  action: string;
  impact: string;
}

export interface BocorHalusInsight {
  detectedTotal: number;
  insight: string;
}

export interface AiFinancialInsight {
  title: string;
  healthScore: number;
  summaryText: string;
  sentiment: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  bocorHalusAnalysis: BocorHalusInsight;
  recommendations: AdvisorRecommendation[];
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
