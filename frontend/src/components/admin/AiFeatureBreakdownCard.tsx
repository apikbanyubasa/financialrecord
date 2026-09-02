'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FeatureUsageBreakdown } from '@/types/admin.types';
import { Sparkles, Cpu } from 'lucide-react';

const featureMeta: Record<string, { label: string; icon: any; desc: string }> = {
  NLP_INPUT: {
    label: 'Catat Cepat AI (NLP Multi-Item)',
    icon: Sparkles,
    desc: 'Ekstraksi otomatis nominal, jenis pos, & kategori dari teks bebas',
  },
};

export function AiFeatureBreakdownCard({ breakdowns }: { breakdowns?: FeatureUsageBreakdown[] }) {
  const activeBreakdowns = (breakdowns || []).filter((b) => b.featureType === 'NLP_INPUT');

  if (activeBreakdowns.length === 0) {
    return (
      <Card className="bg-slate-900/60 border-slate-800 text-slate-100 h-full">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base text-white">Konsumsi Token per Fitur AI</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Rincian pemanggilan fitur Catat Cepat NLP Multi-Item
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 text-center text-xs text-slate-400">
          Belum ada aktivitas pemanggilan model AI tercatat.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800 text-slate-100 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="text-base text-white">Konsumsi Token per Fitur AI</CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Rincian pemanggilan fitur Catat Cepat NLP Multi-Item
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 flex-1">
        {activeBreakdowns.map((b, idx) => {
          const meta = featureMeta[b.featureType] || {
            label: 'Catat Cepat AI (NLP Multi-Item)',
            icon: Sparkles,
            desc: 'Inferensi model Gemini',
          };
          const Icon = meta.icon;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">{meta.label}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{b.requestCount} request dieksekusi</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
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
