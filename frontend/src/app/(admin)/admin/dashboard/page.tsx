'use client';

import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { GlobalStatsSummaryCards } from '@/components/admin/GlobalStatsSummaryCards';
import { AiFeatureBreakdownCard } from '@/components/admin/AiFeatureBreakdownCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ShieldCheck, Users, Cpu, ArrowRight, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { metrics, isMetricsLoading, aiStats, isAiStatsLoading } = useAdmin();

  if (isMetricsLoading || isAiStatsLoading) {
    return <LoadingSpinner text="Memuat metrik platform admin..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Overview & Metrics</h2>
          <p className="text-xs text-slate-400">
            Monitoring total perputaran dana, konsumsi token AI, dan aktivitas pengguna platform
          </p>
        </div>
      </div>

      {/* Global Stat Cards */}
      <GlobalStatsSummaryCards metrics={metrics} />

      {/* AI Token & Feature Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white">Ringkasan Pemakaian AI Platform</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Statistik keberhasilan dan konsumsi token model multimodal
                  </CardDescription>
                </div>
                <Link href="/admin/ai-monitoring">
                  <Button variant="outline" size="sm" className="h-7 text-xs border-slate-700 text-indigo-400 hover:bg-slate-800">
                    <span>Lihat Detail Logs</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Token Terpakai:</span>
                <span className="font-bold text-sm text-white font-mono">{aiStats?.totalTokens.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Success Rate:</span>
                <span className="font-bold text-sm text-emerald-400">{aiStats?.successRatePercentage.toFixed(1)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Biaya USD:</span>
                <span className="font-bold text-sm text-purple-400 font-mono">${aiStats?.totalCostUsd.toFixed(5)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <AiFeatureBreakdownCard breakdowns={aiStats?.featureBreakdowns} />
        </div>
      </div>
    </div>
  );
}
