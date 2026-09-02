'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { AiFeatureBreakdownCard } from '@/components/admin/AiFeatureBreakdownCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/formatters';
import {
  Cpu,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function AdminAiMonitoringPage() {
  const [page, setPage] = useState(0);
  const { aiStats, isAiStatsLoading, aiLogsData, isAiLogsLoading } = useAdmin({ page, size: 20 });

  if (isAiStatsLoading) {
    return <LoadingSpinner text="Memuat data monitoring AI..." className="h-96" />;
  }

  const logs = aiLogsData?.content || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <span>AI Token & Cost Monitoring Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pantau konsumsi token, estimasi biaya API USD, latensi pemrosesan, dan log eksekusi model Google Gemini AI
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-indigo-400 font-bold">
            Model: gemini-1.5-flash
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400">Total Permintaan AI</span>
            <p className="text-2xl font-bold text-white mt-1">{aiStats?.totalRequests.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {aiStats?.successRatePercentage.toFixed(1)}% Success Rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400">Total Konsumsi Token</span>
            <p className="text-2xl font-bold text-indigo-400 font-mono mt-1">
              {aiStats?.totalTokens.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              In: {aiStats?.promptTokens.toLocaleString()} | Out: {aiStats?.completionTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400">Estimasi Biaya API</span>
            <p className="text-2xl font-bold text-purple-400 font-mono mt-1">
              ${aiStats?.totalCostUsd.toFixed(5)} <span className="text-xs text-slate-400">USD</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Tarif Gemini 1.5 Flash</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400">Rata-rata Latensi API</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {aiStats?.avgLatencyMs.toFixed(0)} <span className="text-xs text-slate-400">ms</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Kecepatan inferensi Gemini</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Breakdown */}
      <AiFeatureBreakdownCard breakdowns={aiStats?.featureBreakdowns} />

      {/* Detailed AI Call Logs Table */}
      <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
        <CardHeader className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base text-white">Log Riwayat Eksekusi AI</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Catatan per transaksi pemrosesan Catat Cepat Multi-Item NLP parsing via Google Gemini
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Telemetri Teknis Anonim (Tanpa Rekam Teks User)</span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isAiLogsLoading ? (
            <LoadingSpinner text="Memuat riwayat log AI..." className="h-48" />
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-indigo-400/50" />
              <p className="font-semibold text-white">Belum ada riwayat pemanggilan AI yang tercatat.</p>
              <p className="text-slate-400 text-[11px]">
                Log akan terisi secara real-time saat user melakukan pencatatan transaksi lewat tombol &quot;Ketik Cepat AI (NLP)&quot;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="uppercase text-[10px] text-slate-400 border-b border-slate-800 bg-slate-950/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Fitur Finansial</th>
                    <th className="px-4 py-3 font-semibold">Model Engine</th>
                    <th className="px-4 py-3 font-semibold">Tokens (Prompt/Completion)</th>
                    <th className="px-4 py-3 font-semibold">Estimasi Biaya</th>
                    <th className="px-4 py-3 font-semibold">Latensi</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Waktu Kejadian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-400" />
                          <span className="font-semibold text-white">
                            Catat Cepat Multi-Item NLP
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono">{log.modelName}</td>
                      <td className="px-4 py-3 font-mono">
                        {log.totalTokens} ({log.promptTokens}/{log.completionTokens})
                      </td>
                      <td className="px-4 py-3 font-mono text-purple-400">${Number(log.estimatedCostUsd).toFixed(6)}</td>
                      <td className="px-4 py-3">{log.latencyMs} ms</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination Footer */}
        {aiLogsData && aiLogsData.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Halaman {aiLogsData.number + 1} dari {aiLogsData.totalPages} ({aiLogsData.totalElements} total log)
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 border-slate-700 bg-slate-950"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 border-slate-700 bg-slate-950"
                disabled={page >= aiLogsData.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
