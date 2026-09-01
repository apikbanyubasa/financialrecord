'use client';

import React from 'react';
import { useAi } from '@/hooks/useAi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AiAdvisorChatBox } from '@/components/user/AiAdvisorChatBox';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatIDR, formatDate } from '@/lib/formatters';
import {
  Sparkles,
  RefreshCw,
  HeartPulse,
  Coffee,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function AdvisorPage() {
  const { insights, isInsightsLoading, refetchInsights } = useAi();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <span>AI Financial Advisor & Diagnosis Arus Kas</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Analisis cerdas pola pengeluaran dari pemasukan, deteksi bocor halus, dan rekomendasi aksi konkret
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchInsights()}
          className="space-x-1.5 text-xs font-semibold"
          disabled={isInsightsLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isInsightsLoading ? 'animate-spin' : ''}`} />
          <span>Perbarui Analisis AI</span>
        </Button>
      </div>

      {isInsightsLoading ? (
        <LoadingSpinner text="AI sedang menganalisis kesehatan keuangan Anda..." className="h-64" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Diagnosis & Actionable Cards */}
          <div className="lg:col-span-6 space-y-4">
            {/* Health Score & Diagnosis Card */}
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Skor Kesehatan Finansial
                    </span>
                    <h3 className="text-xl font-extrabold text-foreground mt-0.5">
                      {insights?.title || 'Evaluasi Arus Kas'}
                    </h3>
                  </div>
                  <div
                    className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center border font-black text-2xl shadow-sm ${getScoreColor(
                      insights?.healthScore || 75
                    )}`}
                  >
                    <span>{insights?.healthScore || 75}</span>
                    <span className="text-[9px] uppercase font-bold tracking-tighter">/ 100</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insights?.summaryText ||
                    'Pemasukan dan pengeluaran Anda bulan ini berada dalam rentang terkendali. Pertahankan disiplin pencatatan.'}
                </p>

                {insights?.generatedAt && (
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    Terakhir dievaluasi pada {formatDate(insights.generatedAt)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Bocor Halus Deep Dive */}
            {insights?.bocorHalusAnalysis && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Coffee className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm">Analisis "Bocor Halus" Tersembunyi</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-1 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {insights.bocorHalusAnalysis.insight}
                  </p>
                  <div className="p-2.5 rounded-xl bg-background/80 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estimasi Pengeluaran Mikro:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatIDR(insights.bocorHalusAnalysis.detectedTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Concrete Action Recommendations */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm">Rekomendasi Aksi Penghematan Cerdas</CardTitle>
                <CardDescription className="text-xs">
                  Langkah konkret yang dirancang AI agar tabungan Anda tumbuh optimal
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {insights?.recommendations?.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-accent/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{rec.category}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-foreground">{rec.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live AI Advisor Chatbox */}
          <div className="lg:col-span-6">
            <AiAdvisorChatBox />
          </div>
        </div>
      )}
    </div>
  );
}
