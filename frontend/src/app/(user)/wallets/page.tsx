'use client';

import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { formatIDR, formatTimeOnly } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { NlpQuickEntryModal } from '@/components/user/NlpQuickEntryModal';
import { SetBudgetModal } from '@/components/user/SetBudgetModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PocketType } from '@/types/wallet.types';
import { Transaction } from '@/types/transaction.types';
import { Budget } from '@/types/budget.types';
import Link from 'next/link';
import {
  Wallet as WalletIcon,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Coffee,
  MoreHorizontal,
  Camera,
  Layers,
  CheckCircle2,
  Calendar,
  ChevronRight,
  AlertTriangle,
  SlidersHorizontal,
  PieChart,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';

const iconComponents: Record<string, any> = {
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Coffee,
  MoreHorizontal,
  Wallet: WalletIcon,
};

interface TransactionPocket {
  id: string;
  name: string;
  categoryName: string;
  pocketType: PocketType;
  icon?: string;
  color?: string;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
  aiInsight: string;
}

export default function WalletsPage() {
  const currentPeriod = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const { transactions, summary, isLoading: isTxLoading } = useTransactions({ size: 500 });
  const { budgets, isLoading: isBudgetsLoading } = useBudgets(currentPeriod);

  const [activeTab, setActiveTab] = useState<PocketType>('INCOME');
  const [isNlpModalOpen, setIsNlpModalOpen] = useState(false);
  const [expandedPocketId, setExpandedPocketId] = useState<string | null>(null);

  // Budget Modal State
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedPocketForBudget, setSelectedPocketForBudget] = useState<{ id: string; name: string } | null>(null);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState<Budget | null>(null);

  // Group real transactions into active Pockets dynamically
  const { incomePockets, expensePockets, totalIncome, totalExpense, netBalance } = useMemo(() => {
    const incomeMap = new Map<string, TransactionPocket>();
    const expenseMap = new Map<string, TransactionPocket>();

    let sumIncome = 0;
    let sumExpense = 0;

    transactions.forEach((tx) => {
      const isIncome = tx.type === 'INCOME';
      const catKey = tx.categoryId || tx.categoryName || 'Umum';
      const catName = tx.categoryName || 'Umum';
      const amount = Number(tx.amount) || 0;

      if (isIncome) {
        sumIncome += amount;
        if (!incomeMap.has(catKey)) {
          incomeMap.set(catKey, {
            id: catKey,
            name: `Kantong ${catName}`,
            categoryName: catName,
            pocketType: 'INCOME',
            icon: tx.categoryIcon || 'Briefcase',
            color: tx.categoryColor || '#10B981',
            totalAmount: 0,
            transactionCount: 0,
            transactions: [],
            aiInsight: `Dideteksi AI dari transaksi penerimaan ${catName}`,
          });
        }
        const p = incomeMap.get(catKey)!;
        p.totalAmount += amount;
        p.transactionCount += 1;
        p.transactions.push(tx);
      } else {
        sumExpense += amount;
        if (!expenseMap.has(catKey)) {
          expenseMap.set(catKey, {
            id: catKey,
            name: `Kantong ${catName}`,
            categoryName: catName,
            pocketType: 'EXPENSE',
            icon: tx.categoryIcon || 'Utensils',
            color: tx.categoryColor || '#EF4444',
            totalAmount: 0,
            transactionCount: 0,
            transactions: [],
            aiInsight: `Dideteksi AI dari pos pengeluaran ${catName}`,
          });
        }
        const p = expenseMap.get(catKey)!;
        p.totalAmount += amount;
        p.transactionCount += 1;
        p.transactions.push(tx);
      }
    });

    const incList = Array.from(incomeMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    const expList = Array.from(expenseMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      incomePockets: incList,
      expensePockets: expList,
      totalIncome: sumIncome || summary?.totalIncomeThisMonth || 0,
      totalExpense: sumExpense || summary?.totalExpenseThisMonth || 0,
      netBalance: (sumIncome || summary?.totalIncomeThisMonth || 0) - (sumExpense || summary?.totalExpenseThisMonth || 0),
    };
  }, [transactions, summary]);

  // Overbudget and AI Recommendation Analysis
  const { overbudgetPockets, warningPockets, safePockets } = useMemo(() => {
    const over: { pocket: TransactionPocket; budget: Budget; overAmount: number; pct: number }[] = [];
    const warn: { pocket: TransactionPocket; budget: Budget; pct: number }[] = [];
    const safe: { pocket: TransactionPocket; budget: Budget; remaining: number }[] = [];

    expensePockets.forEach((pocket) => {
      const budget = budgets.find(
        (b) => b.categoryId === pocket.id || b.categoryName.toLowerCase() === pocket.categoryName.toLowerCase()
      );
      if (budget && budget.monthlyLimit > 0) {
        const pct = (pocket.totalAmount / budget.monthlyLimit) * 100;
        if (pocket.totalAmount > budget.monthlyLimit) {
          over.push({
            pocket,
            budget,
            overAmount: pocket.totalAmount - budget.monthlyLimit,
            pct,
          });
        } else if (pct >= 80) {
          warn.push({ pocket, budget, pct });
        } else {
          safe.push({ pocket, budget, remaining: budget.monthlyLimit - pocket.totalAmount });
        }
      }
    });

    return { overbudgetPockets: over, warningPockets: warn, safePockets: safe };
  }, [expensePockets, budgets]);

  const displayedPockets = activeTab === 'INCOME' ? incomePockets : expensePockets;

  const handleOpenSetBudget = (pocket: TransactionPocket, existingBudget?: Budget) => {
    setSelectedPocketForBudget({ id: pocket.id, name: pocket.categoryName });
    setSelectedBudgetForEdit(existingBudget || null);
    setIsBudgetModalOpen(true);
  };

  const getPocketIcon = (iconName?: string, isIncome: boolean = false) => {
    if (iconName && iconComponents[iconName]) {
      const Comp = iconComponents[iconName];
      return <Comp className="h-5 w-5" />;
    }
    return isIncome ? <Briefcase className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />;
  };

  const isLoading = isTxLoading || isBudgetsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Kantong Pos Keuangan</h2>
            <Badge variant="emerald" className="text-[10px] uppercase font-bold tracking-wider">
              AI Transaction-Driven
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pos pemasukan & pengeluaran yang otomatis terkelompok dari riwayat transaksi AI beserta kontrol limit target
          </p>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income Pockets */}
        <Card
          onClick={() => setActiveTab('INCOME')}
          className={`cursor-pointer border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent transition-all hover:scale-[1.01] ${
            activeTab === 'INCOME' ? 'ring-2 ring-emerald-500/50 shadow-md' : ''
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <ArrowUpRight className="h-4 w-4" />
                <span>Total Dana Pemasukan</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                {incomePockets.length} Pos Aktif
              </span>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {formatIDR(totalIncome)}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akumulasi sumber penerimaan yang telah diproses
            </p>
          </CardContent>
        </Card>

        {/* Total Expense Pockets */}
        <Card
          onClick={() => setActiveTab('EXPENSE')}
          className={`cursor-pointer border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent transition-all hover:scale-[1.01] ${
            activeTab === 'EXPENSE' ? 'ring-2 ring-rose-500/50 shadow-md' : ''
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                <ArrowDownRight className="h-4 w-4" />
                <span>Total Alokasi Pengeluaran</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                {expensePockets.length} Pos Aktif
              </span>
            </div>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {formatIDR(totalExpense)}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Akumulasi belanja & pos pengeluaran yang terpakai
            </p>
          </CardContent>
        </Card>

        {/* Net Total Balance */}
        <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center space-x-1">
                <Layers className="h-4 w-4 text-primary" />
                <span>Total Arus Kas Terproses</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {incomePockets.length + expensePockets.length} Total Pos
              </span>
            </div>
            <h3 className={`text-2xl font-black mt-2 ${netBalance < 0 ? 'text-rose-500' : 'text-foreground'}`}>
              {formatIDR(netBalance)}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Selisih penerimaan vs pengeluaran terhitung
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Smart Overbudget Alert & Allocation Recommendations */}
      {activeTab === 'EXPENSE' && overbudgetPockets.length > 0 && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-transparent space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                  <span>Peringatan: {overbudgetPockets.length} Pos Pengeluaran Melebihi Target Limit!</span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pengeluaran aktual telah melampaui alokasi batas bulanan yang direncanakan.
                </p>
              </div>
            </div>
            <Badge variant="rose" className="text-[10px] font-bold uppercase">
              Action Required
            </Badge>
          </div>

          {/* List of Overbudget Pockets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {overbudgetPockets.map(({ pocket, budget, overAmount, pct }) => (
              <div
                key={pocket.id}
                className="p-3 rounded-xl bg-background/80 border border-rose-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-foreground">{pocket.name}</span>
                  <div className="text-[11px] text-muted-foreground flex items-center space-x-2 mt-0.5">
                    <span>Realisasi: <strong className="text-rose-600">{formatIDR(pocket.totalAmount)}</strong></span>
                    <span>•</span>
                    <span>Limit: {formatIDR(budget.monthlyLimit)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-black text-rose-600 block">
                    +{formatIDR(overAmount)}
                  </span>
                  <span className="text-[10px] font-bold text-rose-500/80">({pct.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Smart Recommendation Box */}
          <div className="p-4 rounded-xl bg-background/90 border border-primary/20 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <Lightbulb className="h-4 w-4" />
              <span>Rekomendasi Penyesuaian AI untuk Menyeimbangkan Arus Kas:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed pl-1">
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>
                  <strong>Minimalkan Pos Non-Esensial / Jajan:</strong> Tekan pengeluaran pada pos <em>Jajan, Kopi (Bocor Halus)</em>, dan <em>Gaya Hidup/Hiburan</em> sebesar <strong>30% - 50%</strong> hingga akhir bulan.
                </span>
              </li>
              {safePockets.length > 0 && (
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>
                    <strong>Realokasi dari Kantong Aman:</strong> Anda memiliki sisa kuota aman pada{' '}
                    <strong>{safePockets[0].pocket.name}</strong> (tersisa {formatIDR(safePockets[0].remaining)}). Anda dapat mengalihkan sebagian kuotanya untuk menutup kelebihan ini.
                  </span>
                </li>
              )}
              <li className="flex items-start space-x-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  <strong>Evaluasi Ulang Limit:</strong> Jika pengeluaran pada pos pokok ini memang bersifat mendesak, sesuaikan batas limit bulanan melalui tombol <em>Edit Limit</em> pada kartu kantong.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab Navigation: Pemasukan vs Pengeluaran */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Kantong Pemasukan</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === 'INCOME' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {incomePockets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Kantong Pengeluaran</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === 'EXPENSE' ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {expensePockets.length}
            </span>
          </button>
        </div>

        {activeTab === 'EXPENSE' && (
          <Link href="/budgets">
            <Button variant="outline" size="sm" className="text-xs space-x-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Kelola Semua Limit Budget</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Wallets Grid / Empty States */}
      {isLoading ? (
        <LoadingSpinner text="Memuat pos transaksi & data budget..." className="h-64" />
      ) : displayedPockets.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-border/80 p-10 text-center space-y-4 bg-card/50">
          <div
            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${
              activeTab === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}
          >
            <WalletIcon className="h-7 w-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-foreground">
              Belum Ada Kantong {activeTab === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'} yang Terproses
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeTab === 'INCOME'
                ? 'Catat transaksi penerimaan seperti gaji bulanan, transfer freelance, atau keuntungan bisnis menggunakan AI. AI akan mendeteksi dan membuat pos pemasukan Anda secara otomatis.'
                : 'Catat pengeluaran belanja harian, kopi, makan siang, atau tagihan bulanan menggunakan AI. AI akan mengelompokkan pos pengeluaran Anda secara otomatis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsNlpModalOpen(true)}
              className="space-x-1.5 font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Input Transaksi dengan AI</span>
            </Button>

            <Link href="/transactions/scan">
              <Button variant="outline" size="sm" className="space-x-1.5">
                <Camera className="h-3.5 w-3.5" />
                <span>Scan Struk</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Pocket Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPockets.map((pocket) => {
            const isIncomeTab = activeTab === 'INCOME';
            const isExpanded = expandedPocketId === pocket.id;

            // Budget lookup for expense pocket
            const matchingBudget = !isIncomeTab
              ? budgets.find(
                  (b) => b.categoryId === pocket.id || b.categoryName.toLowerCase() === pocket.categoryName.toLowerCase()
                )
              : null;

            const monthlyLimit = matchingBudget?.monthlyLimit || 0;
            const percentageUsed = monthlyLimit > 0 ? (pocket.totalAmount / monthlyLimit) * 100 : 0;
            const isOverBudget = monthlyLimit > 0 && pocket.totalAmount > monthlyLimit;
            const isNearLimit = monthlyLimit > 0 && percentageUsed >= 80 && !isOverBudget;
            const remainingBudget = monthlyLimit > 0 ? monthlyLimit - pocket.totalAmount : 0;

            let progressColor = '#10B981';
            if (isOverBudget) progressColor = '#EF4444';
            else if (isNearLimit) progressColor = '#F59E0B';

            return (
              <Card
                key={pocket.id}
                className={`transition-all flex flex-col justify-between p-5 space-y-4 bg-card hover:shadow-md ${
                  isOverBudget
                    ? 'border-rose-500/60 ring-2 ring-rose-500/20 bg-rose-500/[0.02]'
                    : isNearLimit
                    ? 'border-amber-500/50'
                    : 'hover:border-primary/40'
                }`}
              >
                {/* Card Top: Category Icon, Name & Budget Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-3 rounded-2xl shrink-0 ${
                          isIncomeTab
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                        style={{
                          backgroundColor: pocket.color ? `${pocket.color}15` : undefined,
                          color: pocket.color || undefined,
                        }}
                      >
                        {getPocketIcon(pocket.icon, isIncomeTab)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isIncomeTab
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncomeTab ? 'Pos Pemasukan' : 'Pos Pengeluaran'}
                          </span>
                          <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>AI Detected</span>
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-foreground mt-0.5 leading-snug">
                          {pocket.name}
                        </h4>
                      </div>
                    </div>

                    {/* Pocket Control Actions */}
                    {!isIncomeTab && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 px-2 text-[11px] space-x-1 ${
                          isOverBudget
                            ? 'border-rose-500 text-rose-600 hover:bg-rose-500/10'
                            : 'hover:bg-primary/10 hover:text-primary'
                        }`}
                        onClick={() => handleOpenSetBudget(pocket, matchingBudget)}
                      >
                        <SlidersHorizontal className="h-3 w-3" />
                        <span>{matchingBudget ? 'Ubah Limit' : 'Atur Limit'}</span>
                      </Button>
                    )}
                  </div>

                  {/* AI Insight Tag / Note */}
                  {pocket.aiInsight && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed flex items-start space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{pocket.aiInsight}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Balance & Budget Progress */}
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {isIncomeTab ? 'Total Dana Terkumpul:' : 'Total Dana Terpakai:'}
                    </span>
                    <span className="text-[10px] font-bold text-foreground px-2 py-0.5 rounded-full bg-muted">
                      {pocket.transactionCount} Transaksi
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <p
                      className={`text-2xl font-black ${
                        isIncomeTab
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isOverBudget
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-foreground'
                      }`}
                    >
                      {formatIDR(pocket.totalAmount)}
                    </p>

                    {/* Budget limit indicator badge */}
                    {!isIncomeTab && monthlyLimit > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isOverBudget
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : isNearLimit
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isOverBudget ? '⚠️ Over Budget' : isNearLimit ? 'Mendekati Limit' : 'Aman'} (
                        {percentageUsed.toFixed(0)}%)
                      </span>
                    )}
                  </div>

                  {/* Expense Pocket Budget Limit Bar */}
                  {!isIncomeTab && (
                    <div className="space-y-1.5 pt-1">
                      {monthlyLimit > 0 ? (
                        <>
                          <Progress value={pocket.totalAmount} max={monthlyLimit} indicatorColor={progressColor} />
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              Limit: <strong>{formatIDR(monthlyLimit)}</strong>
                            </span>
                            <span>
                              {isOverBudget ? (
                                <strong className="text-rose-600 dark:text-rose-400">
                                  Lebih {formatIDR(Math.abs(remainingBudget))}
                                </strong>
                              ) : (
                                <span>
                                  Sisa: <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(remainingBudget)}</strong>
                                </span>
                              )}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="p-2 rounded-lg bg-muted/40 border border-dashed border-border flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Belum ada batas limit</span>
                          <button
                            onClick={() => handleOpenSetBudget(pocket)}
                            className="text-primary font-bold hover:underline"
                          >
                            + Pasang Limit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle Transaction List in Pocket */}
                  <div className="pt-2 border-t border-border/40">
                    <button
                      onClick={() => setExpandedPocketId(isExpanded ? null : pocket.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors"
                    >
                      <span>
                        {isExpanded ? 'Sembunyikan Rincian' : `Lihat ${pocket.transactions.length} Transaksi`}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-200">
                        {pocket.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-2 rounded-lg bg-muted/50 border border-border/40 flex items-center justify-between text-[11px]"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-foreground truncate">
                                {tx.description || pocket.categoryName}
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                <span>{formatTimeOnly(tx.transactionDate)}</span>
                              </p>
                            </div>
                            <span
                              className={`font-black shrink-0 ${
                                isIncomeTab
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isIncomeTab ? '+' : '-'}
                              {formatIDR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setSelectedPocketForBudget(null);
          setSelectedBudgetForEdit(null);
        }}
        currentPeriod={currentPeriod}
        presetCategoryId={selectedPocketForBudget?.id}
        presetCategoryName={selectedPocketForBudget?.name}
        initialBudget={selectedBudgetForEdit}
      />

      {/* NLP Quick Entry Modal */}
      <NlpQuickEntryModal
        isOpen={isNlpModalOpen}
        onClose={() => setIsNlpModalOpen(false)}
      />
    </div>
  );
}
