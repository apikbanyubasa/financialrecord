'use client';

import React, { useState, useMemo } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { formatIDR } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BudgetProgressBar } from '@/components/user/BudgetProgressBar';
import { SetBudgetModal } from '@/components/user/SetBudgetModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Budget } from '@/types/budget.types';
import Link from 'next/link';
import {
  PieChart,
  Plus,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Wallet as WalletIcon,
  Layers,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';

export default function BudgetsPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [period, setPeriod] = useState(currentMonthStr);
  const { budgets, isLoading: isBudgetsLoading, deleteBudget } = useBudgets(period);
  const { transactions, isLoading: isTxLoading } = useTransactions({ size: 500 });

  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState<Budget | null>(null);
  const [presetCategory, setPresetCategory] = useState<{ id: string; name: string } | null>(null);

  // Group active expense pockets from real transactions
  const activeExpensePockets = useMemo(() => {
    const map = new Map<string, { id: string; name: string; totalSpent: number; count: number }>();
    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        const key = tx.categoryId || tx.categoryName || 'Umum';
        const name = tx.categoryName || 'Umum';
        const amt = Number(tx.amount) || 0;
        if (!map.has(key)) {
          map.set(key, { id: key, name: `Kantong ${name}`, totalSpent: 0, count: 0 });
        }
        const p = map.get(key)!;
        p.totalSpent += amt;
        p.count += 1;
      }
    });
    return Array.from(map.values());
  }, [transactions]);

  // Unbudgeted active pockets (pockets that have transactions but no budget set yet)
  const unbudgetedPockets = useMemo(() => {
    return activeExpensePockets.filter(
      (p) => !budgets.some((b) => b.categoryId === p.id || b.categoryName.toLowerCase() === p.name.replace('Kantong ', '').toLowerCase())
    );
  }, [activeExpensePockets, budgets]);

  // Overbudget and warning items
  const overbudgetItems = useMemo(() => budgets.filter((b) => b.isOverBudget || b.percentageUsed >= 100), [budgets]);
  const warningItems = useMemo(() => budgets.filter((b) => !b.isOverBudget && b.percentageUsed >= 80), [budgets]);
  const safeItems = useMemo(() => budgets.filter((b) => b.percentageUsed < 80), [budgets]);

  const totalLimit = budgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.currentSpent || 0), 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleDelete = async (id: string) => {
    if (confirm('Hapus limit budget untuk pos ini?')) {
      await deleteBudget(id);
    }
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudgetForEdit(budget);
    setPresetCategory(null);
    setIsSetModalOpen(true);
  };

  const handleQuickSetPocket = (pocketId: string, pocketName: string) => {
    setSelectedBudgetForEdit(null);
    setPresetCategory({ id: pocketId, name: pocketName });
    setIsSetModalOpen(true);
  };

  const isLoading = isBudgetsLoading || isTxLoading;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Limit & Target Budget Bulanan</h2>
            <Badge variant="emerald" className="text-[10px] uppercase font-bold tracking-wider">
              Connected to Kantong Pos
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kendalikan batas pengeluaran per kantong pos agar tidak melebihi alokasi dan dapatkan rekomendasi efisiensi AI
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 border rounded-lg px-2.5 py-1 bg-card text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => {
              setSelectedBudgetForEdit(null);
              setPresetCategory(null);
              setIsSetModalOpen(true);
            }}
            className="space-x-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Atur Limit Kategori</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Total Limit Anggaran ({period})</span>
            <p className="text-2xl font-black text-foreground mt-1">{formatIDR(totalLimit)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{budgets.length} pos dibatasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Total Realisasi Pengeluaran</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatIDR(totalSpent)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rasio terpakai: <strong>{overallPercentage.toFixed(1)}%</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Sisa Kuota Anggaran</span>
            <p className={`text-2xl font-black mt-1 ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatIDR(totalRemaining)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalRemaining >= 0 ? 'Masih dalam batas aman' : '⚠️ Melebihi target anggaran!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Smart Overbudget Alert & Recommendation Section */}
      {overbudgetItems.length > 0 && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                  <span>Peringatan Overbudget: {overbudgetItems.length} Pos Melebihi Target Limit!</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI mendeteksi lonjakan pengeluaran yang melebihi batas alokasi bulanan.
                </p>
              </div>
            </div>
            <Badge variant="rose" className="text-[10px] font-bold uppercase">
              Perlu Tindakan
            </Badge>
          </div>

          {/* AI Recommendation Details */}
          <div className="p-4 rounded-xl bg-background/90 border border-primary/20 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <Lightbulb className="h-4 w-4" />
              <span>Rekomendasi Penyesuaian AI untuk Penghematan & Realokasi:</span>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                <p className="font-semibold text-foreground flex items-center space-x-1.5 text-xs">
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                  <span>1. Pos yang Harus Segera Diminimalkan:</span>
                </p>
                <p className="mt-1 pl-5">
                  Pangkas pengeluaran pada pos sekunder seperti <strong>Kantong Jajan & Kopi</strong>, <strong>Gaya Hidup & Hiburan</strong>, atau belanja konsumtif minimal sebesar <strong>30% - 50%</strong> untuk menutupi kelebihan dana pada pos {overbudgetItems.map(o => o.categoryName).join(', ')}.
                </p>
              </div>

              {safeItems.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="font-semibold text-foreground flex items-center space-x-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span>2. Opsi Alih Kuota Dana Aman:</span>
                  </p>
                  <p className="mt-1 pl-5">
                    Anda memiliki sisa kuota aman pada <strong>{safeItems[0].categoryName}</strong> (tersisa {formatIDR(safeItems[0].remainingAmount)}). Anda dapat mengalihkan kuota tersebut untuk menyeimbangkan total pengeluaran bulan ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Setup for Unbudgeted Active Kantong Pos */}
      {unbudgetedPockets.length > 0 && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Kantong Pos Pengeluaran Aktif yang Belum Memiliki Limit ({unbudgetedPockets.length})
              </span>
            </div>
            <Link href="/wallets">
              <span className="text-[11px] font-semibold text-primary hover:underline flex items-center space-x-1">
                <span>Buka Kantong Pos</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {unbudgetedPockets.map((pocket) => (
              <div
                key={pocket.id}
                className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-bold text-foreground">{pocket.name}</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Terpakai: <strong className="text-foreground">{formatIDR(pocket.totalSpent)}</strong> ({pocket.count} transaksi)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSetPocket(pocket.id, pocket.name)}
                  className="h-7 text-[11px] px-2.5 font-bold hover:bg-primary/10 hover:text-primary"
                >
                  + Set Limit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Progress Bars List */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Status Batas Pengeluaran per Pos</CardTitle>
            <CardDescription className="text-xs">
              Pantau pos kantong yang aman, mendekati limit, atau telah overbudget
            </CardDescription>
          </div>
          <Link href="/wallets">
            <Button variant="ghost" size="sm" className="text-xs space-x-1">
              <span>Ke Halaman Kantong Pos</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <LoadingSpinner text="Memuat data budget & pos transaksi..." className="h-48" />
          ) : budgets.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground space-y-3">
              <PieChart className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold">Belum ada limit budget yang diatur untuk periode {period}.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBudgetForEdit(null);
                  setPresetCategory(null);
                  setIsSetModalOpen(true);
                }}
              >
                Atur Limit Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => (
                <BudgetProgressBar
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <SetBudgetModal
        isOpen={isSetModalOpen}
        onClose={() => {
          setIsSetModalOpen(false);
          setSelectedBudgetForEdit(null);
          setPresetCategory(null);
        }}
        currentPeriod={period}
        initialBudget={selectedBudgetForEdit}
        presetCategoryId={presetCategory?.id}
        presetCategoryName={presetCategory?.name}
      />
    </div>
  );
}
