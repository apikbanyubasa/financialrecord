'use client';

import React, { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatIDR, formatMonthYear } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CashflowChart } from '@/components/user/CashflowChart';
import { CategoryDonutChart } from '@/components/user/CategoryDonutChart';
import { RecentTransactionsTable } from '@/components/user/RecentTransactionsTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CashflowDataPoint, CategoryBreakdownItem } from '@/types/transaction.types';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Calendar,
  BarChart3,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type ChartViewMode = 'YEARLY' | 'MONTHLY' | 'DAILY';

const MONTH_OPTIONS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const YEAR_OPTIONS = [2027, 2026, 2025, 2024, 2023, 2022];

export default function DashboardPage() {
  const {
    summary,
    transactions,
    isSummaryLoading,
    isLoading: isTxLoading,
    isError,
    refetchSummary,
    refetch,
  } = useTransactions({ size: 1000 });

  // Default month and year
  const now = useMemo(() => new Date(), []);
  const currentMonthValue = useMemo(() => String(now.getMonth() + 1).padStart(2, '0'), [now]);
  const currentYearValue = useMemo(() => String(now.getFullYear()), [now]);

  // --- Dropdown States & View Mode ---
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthValue);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearValue);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('MONTHLY');

  const selectedMonthName = useMemo(() => {
    return MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label || 'Bulan Ini';
  }, [selectedMonth]);

  const activePeriodPrefix = `${selectedYear}-${selectedMonth}`;

  // --- Filter Transactions for Active Period Metrics ---
  const { periodIncome, periodExpense, periodNetSavings, periodSavingsRate } = useMemo(() => {
    let sumInc = 0;
    let sumExp = 0;

    transactions.forEach((tx) => {
      if (!tx.transactionDate) return;

      let matches = false;
      if (chartViewMode === 'YEARLY') {
        matches = true; // All recorded years
      } else if (chartViewMode === 'MONTHLY') {
        matches = tx.transactionDate.startsWith(selectedYear);
      } else {
        // DAILY
        matches = tx.transactionDate.startsWith(activePeriodPrefix);
      }

      if (matches) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'INCOME') {
          sumInc += amt;
        } else {
          sumExp += amt;
        }
      }
    });

    const net = sumInc - sumExp;
    const rate = sumInc > 0 ? (net / sumInc) * 100 : 0;

    return {
      periodIncome: sumInc || summary?.totalIncomeThisMonth || 0,
      periodExpense: sumExp || summary?.totalExpenseThisMonth || 0,
      periodNetSavings: sumInc || sumExp ? net : summary?.netSavingsThisMonth || 0,
      periodSavingsRate: sumInc > 0 ? rate : summary?.savingsRatePercentage || 0,
    };
  }, [transactions, chartViewMode, selectedYear, activePeriodPrefix, summary]);

  // --- Dynamic Cashflow Trend Calculation (Yearly / Monthly / Daily) ---
  const dynamicCashflowTrend = useMemo<CashflowDataPoint[]>(() => {
    if (!transactions || transactions.length === 0) {
      return summary?.cashflowTrend || [];
    }

    const yearNum = parseInt(selectedYear, 10);
    const monthNum = parseInt(selectedMonth, 10);

    // MODE 1: PER TAHUN (Tren Perbandingan Antar-Tahun 2022 - 2027)
    if (chartViewMode === 'YEARLY') {
      const yearsList = [2022, 2023, 2024, 2025, 2026, 2027];
      const yearsData: CashflowDataPoint[] = yearsList.map((y) => ({
        date: String(y),
        income: 0,
        expense: 0,
      }));

      transactions.forEach((tx) => {
        if (!tx.transactionDate) return;
        const txYear = parseInt(tx.transactionDate.slice(0, 4), 10);
        const yIdx = yearsList.indexOf(txYear);
        if (yIdx !== -1) {
          const item = yearsData[yIdx];
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'INCOME') item.income += amt;
          else item.expense += amt;
        }
      });

      return yearsData;
    }

    // MODE 2: PER BULAN (12 Bulan di Tahun terpilih)
    if (chartViewMode === 'MONTHLY') {
      const monthsData: CashflowDataPoint[] = Array.from({ length: 12 }, (_, i) => {
        const mKey = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
        return { date: mKey, income: 0, expense: 0 };
      });

      transactions.forEach((tx) => {
        if (!tx.transactionDate || !tx.transactionDate.startsWith(selectedYear)) return;
        const mIdx = parseInt(tx.transactionDate.slice(5, 7), 10);
        if (mIdx >= 1 && mIdx <= 12) {
          const item = monthsData[mIdx - 1];
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'INCOME') item.income += amt;
          else item.expense += amt;
        }
      });

      return monthsData;
    }

    // MODE 3: HARIAN (Tgl 1 s/d Akhir Bulan terpilih)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const dayPoints: CashflowDataPoint[] = [];
    const dayMap = new Map<string, CashflowDataPoint>();

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${activePeriodPrefix}-${dayStr}`;
      const point: CashflowDataPoint = { date: dateKey, income: 0, expense: 0 };
      dayPoints.push(point);
      dayMap.set(dateKey, point);
    }

    transactions.forEach((tx) => {
      if (!tx.transactionDate || !tx.transactionDate.startsWith(activePeriodPrefix)) return;
      const dateKey = tx.transactionDate.slice(0, 10);
      if (dayMap.has(dateKey)) {
        const item = dayMap.get(dateKey)!;
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'INCOME') item.income += amt;
        else item.expense += amt;
      }
    });

    return dayPoints;
  }, [transactions, chartViewMode, selectedMonth, selectedYear, activePeriodPrefix, summary]);

  // --- Dynamic Category Expenses Breakdown based on Dropdown Period ---
  const dynamicCategoryExpenses = useMemo<CategoryBreakdownItem[]>(() => {
    if (!transactions || transactions.length === 0) {
      return summary?.categoryExpenses || [];
    }

    const filteredExpenses = transactions.filter((tx) => {
      if (tx.type !== 'EXPENSE' || !tx.transactionDate) return false;
      if (chartViewMode === 'YEARLY') return true;
      if (chartViewMode === 'MONTHLY') return tx.transactionDate.startsWith(selectedYear);
      return tx.transactionDate.startsWith(activePeriodPrefix);
    });

    const catMap = new Map<string, { categoryId: string; categoryName: string; amount: number; color?: string }>();
    let totalExpense = 0;

    filteredExpenses.forEach((tx) => {
      const key = tx.categoryId || tx.categoryName || 'Umum';
      const name = tx.categoryName || 'Umum';
      const amt = Number(tx.amount) || 0;
      totalExpense += amt;

      if (!catMap.has(key)) {
        catMap.set(key, {
          categoryId: key,
          categoryName: name,
          amount: 0,
          color: tx.categoryColor || undefined,
        });
      }
      catMap.get(key)!.amount += amt;
    });

    const defaultColors = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#6366F1'];
    return Array.from(catMap.values())
      .map((item, idx) => ({
        ...item,
        color: item.color || defaultColors[idx % defaultColors.length],
        percentage: totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, chartViewMode, selectedYear, activePeriodPrefix, summary]);

  const activePeriodLabel = useMemo(() => {
    if (chartViewMode === 'YEARLY') return 'Semua Tahun (2022 - 2027)';
    if (chartViewMode === 'MONTHLY') return `Tahun ${selectedYear}`;
    return `${selectedMonthName} ${selectedYear}`;
  }, [chartViewMode, selectedMonthName, selectedYear]);

  const isLoading = isSummaryLoading || isTxLoading;

  if (isLoading && !summary) {
    return <LoadingSpinner text="Memuat ringkasan keuangan Anda..." className="h-96" />;
  }

  if (isError && !summary) {
    return (
      <Card className="p-10 text-center space-y-4 max-w-md mx-auto my-16 border-rose-500/20 bg-rose-500/5">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-foreground">Gagal Memuat Ringkasan Keuangan</h3>
          <p className="text-xs text-muted-foreground">
            Terjadi kendala saat menyinkronkan data dengan server. Silakan periksa koneksi Anda dan coba lagi.
          </p>
        </div>
        <Button
          onClick={() => {
            refetchSummary();
            refetch();
          }}
          className="gap-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Coba Lagi
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Link href="/wallets">
          <Card className="hover:border-primary/40 transition-all cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Total Saldo Kas Bersih →
                </p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                  {formatIDR(summary?.totalBalance)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Buka Kantong Pos Keuangan
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <WalletCards className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Total Income */}
        <Card className="hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pemasukan ({activePeriodLabel})</p>
              <h3 className="text-2xl font-black tracking-tight text-emerald-500 mt-1">
                {formatIDR(periodIncome)}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> Total dana masuk
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="hover:border-rose-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pengeluaran ({activePeriodLabel})</p>
              <h3 className="text-2xl font-black tracking-tight text-rose-500 mt-1">
                {formatIDR(periodExpense)}
              </h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-0.5" /> Total dana keluar
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Net Savings & Rate */}
        <Card className="hover:border-cyan-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sisa Tabungan ({activePeriodLabel})</p>
              <h3 className={`text-2xl font-black tracking-tight mt-1 ${
                periodNetSavings >= 0 ? 'text-cyan-500' : 'text-rose-500'
              }`}>
                {formatIDR(periodNetSavings)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Rasio tabungan: <strong>{periodSavingsRate.toFixed(1)}%</strong>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <PiggyBank className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 2 MAIN CHARTS GRID WITH PER TAHUN, PER BULAN, DAN HARIAN */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashflow Trend AreaChart */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Arus Kas ({activePeriodLabel})</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Perbandingan langsung nominal pemasukan vs pengeluaran
                  </CardDescription>
                </div>

                {/* Mode Selector Tabs: Per Tahun | Per Bulan | Harian */}
                <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/40 gap-1">
                  <button
                    onClick={() => setChartViewMode('YEARLY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      chartViewMode === 'YEARLY'
                        ? 'bg-background text-primary shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Per Tahun
                  </button>

                  <button
                    onClick={() => setChartViewMode('MONTHLY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      chartViewMode === 'MONTHLY'
                        ? 'bg-background text-primary shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Per Bulan
                  </button>

                  <button
                    onClick={() => setChartViewMode('DAILY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      chartViewMode === 'DAILY'
                        ? 'bg-background text-primary shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Harian
                  </button>
                </div>
              </div>

              {/* Dropdown Pemilih Bulan & Tahun Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Filter Dropdown:</span>

                  {/* Dropdown Bulan (Visible only in Daily mode) */}
                  {chartViewMode === 'DAILY' && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs font-bold focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                    >
                      {MONTH_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Dropdown Tahun (Visible in Monthly and Daily mode) */}
                  {chartViewMode !== 'YEARLY' && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs font-bold focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                    >
                      {YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={String(yr)}>
                          Tahun {yr}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <span className="text-[11px] text-muted-foreground font-semibold">
                  {chartViewMode === 'YEARLY'
                    ? 'Menampilkan Perbandingan Arus Kas Tahun 2022 - 2027'
                    : chartViewMode === 'MONTHLY'
                    ? `Menampilkan 12 Bulan (Jan - Des) di Tahun ${selectedYear}`
                    : `Menampilkan ${dynamicCashflowTrend.length} Hari di ${selectedMonthName} ${selectedYear}`}
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <CashflowChart data={dynamicCashflowTrend} />
            </CardContent>
          </Card>
        </div>

        {/* Expense Category Donut Chart */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <div>
                <CardTitle className="text-base">Perincian Alokasi Pengeluaran</CardTitle>
                <CardDescription className="text-xs">
                  Distribusi pemakaian dana ({activePeriodLabel})
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CategoryDonutChart data={dynamicCategoryExpenses} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Aktivitas Transaksi Terbaru</CardTitle>
            <CardDescription className="text-xs">
              Catatan pemasukan dan rincian pengeluaran yang baru saja tercatat
            </CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs space-x-1">
              <span>Buka Kronologi Lengkap</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <RecentTransactionsTable transactions={summary?.recentTransactions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
