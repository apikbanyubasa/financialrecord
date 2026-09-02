'use client';

import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { GlobalStatsSummaryCards } from '@/components/admin/GlobalStatsSummaryCards';
import { AiFeatureBreakdownCard } from '@/components/admin/AiFeatureBreakdownCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Cpu,
  ArrowRight,
  Activity,
  Wallet,
  PieChart,
  Sparkles,
  BarChart3,
  CheckCircle2,
  SlidersHorizontal,
  Tags,
  ShieldAlert,
} from 'lucide-react';
import { formatIDR } from '@/lib/formatters';

export default function AdminDashboardPage() {
  const { metrics, isMetricsLoading, aiStats, isAiStatsLoading } = useAdmin();

  if (isMetricsLoading || isAiStatsLoading) {
    return <LoadingSpinner text="Memuat metrik platform admin..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Platform Executive Overview</h2>
          </div>
          <p className="text-xs text-slate-400">
            Monitoring perputaran dana pengguna, status fitur Catat Cepat NLP, Kantong Pos, dan performa model AI Gemini
          </p>
        </div>

        {/* System Health Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Spring Boot API: Online</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Gemini Flash AI: Ready</span>
          </div>
        </div>
      </div>

      {/* Global Aggregate KPI Metrics */}
      <GlobalStatsSummaryCards metrics={metrics} />

      {/* Core User Feature Health & AI Token Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Features Health & Status */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    <span>Status Ekosistem Fitur Finansial User</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Kesiapan modul transaksi, AI parsing, kantong pos, dan limit budget
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {/* Feature 1: NLP Quick Entry */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Catat Cepat Multi-Item NLP</h4>
                    <p className="text-[11px] text-slate-400">Google Gemini 1.5 Flash Engine</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Aktif & Siap
                  </span>
                </div>
              </div>

              {/* Feature 2: Kantong Pos Keuangan */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Kantong Pos Keuangan (Pockets)</h4>
                    <p className="text-[11px] text-slate-400">Filter Bulanan, Tahunan (12 Bulan), & Semua Waktu</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Tersinkronisasi
                  </span>
                </div>
              </div>

              {/* Feature 3: Limit Budgeting */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Smart Budget Limiter</h4>
                    <p className="text-[11px] text-slate-400">Status Aman, Peringatan (80%), & Overbudget (100%)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Monitoring Aktif
                  </span>
                </div>
              </div>

              {/* Feature 4: Dynamic Cashflow Charts */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Arus Kas (Per Tahun, Per Bulan, Harian)</h4>
                    <p className="text-[11px] text-slate-400">Recharts Area & Donut Category Engine</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Operational
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Feature Breakdown */}
        <div className="lg:col-span-5">
          <AiFeatureBreakdownCard breakdowns={aiStats?.featureBreakdowns} />
        </div>
      </div>

      {/* Quick Admin Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/users">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Manajemen User
                  </h4>
                  <p className="text-[10px] text-slate-400">Kelola status & hak akses</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/ai-monitoring">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                    AI Token Monitor
                  </h4>
                  <p className="text-[10px] text-slate-400">Pantau biaya & latensi</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Tags className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Master Kategori
                  </h4>
                  <p className="text-[10px] text-slate-400">Atur kategori global</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/audit-logs">
          <Card className="bg-slate-900/60 border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Audit Logs
                  </h4>
                  <p className="text-[10px] text-slate-400">Jejak aktivitas sistem</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
