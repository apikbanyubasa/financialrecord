'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { AdminMetrics } from '@/types/admin.types';
import { formatIDR } from '@/lib/formatters';
import { Users, DollarSign, Activity, Cpu, Clock, CheckCircle } from 'lucide-react';

export function GlobalStatsSummaryCards({ metrics }: { metrics?: AdminMetrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Pengguna',
      value: metrics.totalUsers.toLocaleString(),
      subtext: `${metrics.activeUsers} akun aktif`,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Total Volume Uang',
      value: formatIDR(metrics.totalMoneyVolume),
      subtext: `${metrics.totalTransactions} total transaksi`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total Pemanggilan AI',
      value: metrics.totalAiRequests.toLocaleString(),
      subtext: `Biaya API: $${metrics.totalAiCostUsd.toFixed(4)} USD`,
      icon: Cpu,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Rata-rata Latensi AI',
      value: `${metrics.avgAiLatencyMs.toFixed(0)} ms`,
      subtext: 'Respon multimodal Gemini',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Card key={idx} className="bg-slate-900/60 border-slate-800 text-slate-100 hover:border-slate-700 transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{c.title}</p>
                <h3 className="text-xl font-bold tracking-tight text-white mt-1">{c.value}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{c.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.bgColor} ${c.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
