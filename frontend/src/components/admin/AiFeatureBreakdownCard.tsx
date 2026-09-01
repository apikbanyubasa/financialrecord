'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FeatureUsageBreakdown } from '@/types/admin.types';
import { ScanLine, MessageSquare, Sparkles } from 'lucide-react';

const featureIcons: Record<string, any> = {
  RECEIPT_OCR: ScanLine,
  NLP_INPUT: Sparkles,
  ADVISOR_CHAT: MessageSquare,
};

export function AiFeatureBreakdownCard({ breakdowns }: { breakdowns?: FeatureUsageBreakdown[] }) {
  if (!breakdowns || breakdowns.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="text-base text-white">Konsumsi Token per Fitur AI</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Rincian pemanggilan fitur Vision OCR, NLP Parser, dan Chat Advisor
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {breakdowns.map((b, idx) => {
          const Icon = featureIcons[b.featureType] || Sparkles;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white uppercase tracking-wider">{b.featureType}</h4>
                  <p className="text-[11px] text-slate-400">{b.requestCount} requests dieksekusi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xs text-emerald-400">${b.costUsd.toFixed(5)} USD</p>
                <p className="text-[10px] text-slate-400 font-mono">{b.totalTokens.toLocaleString()} tokens</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
