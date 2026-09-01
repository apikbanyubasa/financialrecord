'use client';

import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { formatIDR } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CashflowChart } from '@/components/user/CashflowChart';
import { CategoryDonutChart } from '@/components/user/CategoryDonutChart';
import { RecentTransactionsTable } from '@/components/user/RecentTransactionsTable';
import { BocorHalusCard } from '@/components/user/BocorHalusCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ScanLine,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { summary, isSummaryLoading } = useTransactions();

  if (isSummaryLoading) {
    return <LoadingSpinner text="Memuat ringkasan keuangan Anda..." className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="hover:border-primary/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Saldo Dompet</p>
              <h3 className="text-2xl font-black tracking-tight text-foreground mt-1">
                {formatIDR(summary?.totalBalance)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                {summary?.wallets?.length || 0} kantong aktif
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <WalletCards className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Income */}
        <Card className="hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pemasukan Bulan Ini</p>
              <h3 className="text-2xl font-black tracking-tight text-emerald-500 mt-1">
                {formatIDR(summary?.totalIncomeThisMonth)}
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
              <p className="text-xs font-medium text-muted-foreground">Pengeluaran Bulan Ini</p>
              <h3 className="text-2xl font-black tracking-tight text-rose-500 mt-1">
                {formatIDR(summary?.totalExpenseThisMonth)}
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
              <p className="text-xs font-medium text-muted-foreground">Sisa Tabungan (Net)</p>
              <h3 className={`text-2xl font-black tracking-tight mt-1 ${
                (summary?.netSavingsThisMonth || 0) >= 0 ? 'text-cyan-500' : 'text-rose-500'
              }`}>
                {formatIDR(summary?.netSavingsThisMonth)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Rasio tabungan: <strong>{summary?.savingsRatePercentage?.toFixed(1) || 0}%</strong>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <PiggyBank className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bocor Halus Alert Bar */}
      <BocorHalusCard
        totalAmount={summary?.bocorHalusTotal || 0}
        count={summary?.bocorHalusCount || 0}
      />

      {/* 2 Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cashflow Trend AreaChart */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Arus Kas Harian (14 Hari Terakhir)</CardTitle>
                  <CardDescription className="text-xs">
                    Perbandingan langsung nominal pemasukan vs pengeluaran
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CashflowChart data={summary?.cashflowTrend || []} />
            </CardContent>
          </Card>
        </div>

        {/* Expense Category Donut Chart */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <div>
                <CardTitle className="text-base">Perincian Alokasi Pengeluaran</CardTitle>
                <CardDescription className="text-xs">
                  Distribusi pemakaian dana berdasarkan kategori
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CategoryDonutChart data={summary?.categoryExpenses || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Wallets Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground">Kantong Dana & Rekening</h3>
          <Link href="/wallets" className="text-xs text-primary font-semibold hover:underline">
            Kelola Semua Dompet &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary?.wallets?.map((wallet) => (
            <div
              key={wallet.id}
              className="p-4 rounded-2xl border bg-card/70 hover:border-primary/40 transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {wallet.type}
                </span>
                <h4 className="font-bold text-sm text-foreground mt-0.5">{wallet.name}</h4>
                <p className="text-base font-black text-primary mt-1">{formatIDR(wallet.balance)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <WalletCards className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            <CardDescription className="text-xs">
              10 catatan transaksi pemasukan dan pengeluaran terakhir
            </CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="text-xs">
              Lihat Riwayat Lengkap
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
