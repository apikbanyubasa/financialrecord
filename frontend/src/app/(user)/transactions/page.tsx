'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { formatIDR, formatTimeOnly, groupTransactionsByDate } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EditTransactionModal } from '@/components/user/EditTransactionModal';
import { Transaction } from '@/types/transaction.types';
import {
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  Filter,
  Search,
  Calendar,
  CalendarDays,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  Tag,
  Wallet,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

type TimeFilterMode = 'ALL' | 'DAILY' | 'MONTHLY' | 'YEARLY';

export default function TransactionsPage() {
  useEffect(() => {
    document.title = 'Kronologi Transaksi | FinancialRecord';
  }, []);

  const currentDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentYearStr = useMemo(() => String(new Date().getFullYear()), []);
  const currentYearNum = useMemo(() => new Date().getFullYear(), []);
  const dynamicYears = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYearNum - i), [currentYearNum]);

  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(0);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  // Time Filter State
  const [timeFilterMode, setTimeFilterMode] = useState<TimeFilterMode>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>(currentDateStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Date Range Calculation for API
  const { startDate, endDate } = useMemo(() => {
    if (timeFilterMode === 'DAILY') {
      return {
        startDate: `${selectedDay}T00:00:00`,
        endDate: `${selectedDay}T23:59:59`,
      };
    }
    if (timeFilterMode === 'MONTHLY') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const dayStr = String(lastDay).padStart(2, '0');
      return {
        startDate: `${selectedMonth}-01T00:00:00`,
        endDate: `${selectedMonth}-${dayStr}T23:59:59`,
      };
    }
    if (timeFilterMode === 'YEARLY') {
      return {
        startDate: `${selectedYear}-01-01T00:00:00`,
        endDate: `${selectedYear}-12-31T23:59:59`,
      };
    }
    return { startDate: undefined, endDate: undefined };
  }, [timeFilterMode, selectedDay, selectedMonth, selectedYear]);

  const { transactions, pageData, isLoading, isError, refetch, deleteTransaction, isDeleting } = useTransactions({
    page,
    size: 25,
    type: typeFilter || undefined,
    categoryId: categoryFilter || undefined,
    startDate,
    endDate,
  });

  const handlePrevDay = () => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() - 1);
    setSelectedDay(d.toISOString().slice(0, 10));
    setPage(0);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDay);
    d.setDate(d.getDate() + 1);
    setSelectedDay(d.toISOString().slice(0, 10));
    setPage(0);
  };

  const handleToday = () => {
    setSelectedDay(currentDateStr);
    setPage(0);
  };

  const activeTimeDisplay = useMemo(() => {
    if (timeFilterMode === 'ALL') return 'Semua Waktu';
    if (timeFilterMode === 'DAILY') {
      try {
        const [y, m, d] = selectedDay.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        return selectedDay;
      }
    }
    if (timeFilterMode === 'MONTHLY') {
      try {
        const [y, m] = selectedMonth.split('-').map(Number);
        const dateObj = new Date(y, m - 1, 1);
        return dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      } catch {
        return selectedMonth;
      }
    }
    return `Tahun ${selectedYear}`;
  }, [timeFilterMode, selectedDay, selectedMonth, selectedYear]);

  const { categories } = useCategories();

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan kembali.')) {
      await deleteTransaction(id);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!debouncedSearch.trim()) return transactions;
    const q = debouncedSearch.toLowerCase().trim();
    return transactions.filter(
      (tx) =>
        (tx.description && tx.description.toLowerCase().includes(q)) ||
        (tx.categoryName && tx.categoryName.toLowerCase().includes(q)) ||
        (tx.walletName && tx.walletName.toLowerCase().includes(q)) ||
        String(tx.amount).includes(q)
    );
  }, [transactions, debouncedSearch]);

  const groupedDates = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Kronologi & Riwayat Transaksi</h2>
          <p className="text-xs text-muted-foreground">
            Daftar seluruh aktivitas pemasukan dan pengeluaran Anda yang tersusun rapi berdasarkan urutan waktu
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 space-y-3">
        {/* Row 1: Type Filter, Search Box & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-muted/60">
            <button
              onClick={() => { setTypeFilter(''); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === '' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua Tipe
            </button>
            <button
              onClick={() => { setTypeFilter('EXPENSE'); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'EXPENSE' ? 'bg-rose-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => { setTypeFilter('INCOME'); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'INCOME' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            {/* Search Input Box with Debounce */}
            <div className="relative min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary font-medium"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary font-medium"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
              >
                <option value="">Semua Pos Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'INCOME' ? 'Masuk' : 'Keluar'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Time Filters (Harian, Bulanan, Tahunan, Semua) */}
        <div className="pt-2.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Mode Switcher Pills */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/40 gap-1">
              <button
                onClick={() => { setTimeFilterMode('ALL'); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  timeFilterMode === 'ALL'
                    ? 'bg-background text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Semua</span>
              </button>

              <button
                onClick={() => { setTimeFilterMode('DAILY'); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  timeFilterMode === 'DAILY'
                    ? 'bg-background text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Harian</span>
              </button>

              <button
                onClick={() => { setTimeFilterMode('MONTHLY'); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  timeFilterMode === 'MONTHLY'
                    ? 'bg-background text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Bulanan</span>
              </button>

              <button
                onClick={() => { setTimeFilterMode('YEARLY'); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  timeFilterMode === 'YEARLY'
                    ? 'bg-background text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Tahunan</span>
              </button>
            </div>

            {/* Controls for Daily Mode */}
            {timeFilterMode === 'DAILY' && (
              <div className="flex items-center space-x-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handlePrevDay}
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-background border border-input text-xs font-bold">
                  <input
                    type="date"
                    value={selectedDay}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDay(e.target.value);
                        setPage(0);
                      }
                    }}
                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleNextDay}
                  title="Hari Berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {selectedDay !== currentDateStr && (
                  <button
                    onClick={handleToday}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    Hari Ini
                  </button>
                )}
              </div>
            )}

            {/* Controls for Monthly Mode */}
            {timeFilterMode === 'MONTHLY' && (
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-background border border-input text-xs font-bold">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedMonth(e.target.value);
                        setPage(0);
                      }
                    }}
                    className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer text-foreground"
                  />
                </div>

                {selectedMonth !== currentMonthStr && (
                  <button
                    onClick={() => { setSelectedMonth(currentMonthStr); setPage(0); }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    Bulan Ini
                  </button>
                )}
              </div>
            )}

            {/* Controls for Yearly Mode */}
            {timeFilterMode === 'YEARLY' && (
              <div className="flex items-center space-x-1.5">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPage(0);
                  }}
                  className="h-8 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                >
                  {dynamicYears.map((yr) => (
                    <option key={yr} value={String(yr)}>
                      Tahun {yr}
                    </option>
                  ))}
                </select>

                {selectedYear !== currentYearStr && (
                  <button
                    onClick={() => { setSelectedYear(currentYearStr); setPage(0); }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    Tahun Ini
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Period Display Badge */}
          <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-xl border border-border/40">
            <span className="text-[11px]">Filter Waktu:</span>
            <span className="font-bold text-foreground">{activeTimeDisplay}</span>
          </div>
        </div>
      </Card>

      {/* Chronological Timeline List */}
      {isLoading ? (
        <LoadingSpinner text="Memuat kronologi transaksi..." className="h-64" />
      ) : isError ? (
        <Card className="p-10 text-center space-y-4 max-w-md mx-auto my-12 border-rose-500/20 bg-rose-500/5">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">Gagal Memuat Riwayat Transaksi</h3>
            <p className="text-xs text-muted-foreground">
              Terjadi kendala saat mengambil data transaksi dari server. Silakan periksa koneksi Anda dan coba lagi.
            </p>
          </div>
          <Button onClick={() => refetch()} className="gap-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Coba Lagi
          </Button>
        </Card>
      ) : groupedDates.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground space-y-2">
          <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-semibold">Belum ada transaksi yang tercatat.</p>
          <p className="text-xs">Gunakan tombol "Ketik Cepat AI (NLP)" di header untuk mencatat aktivitas keuangan Anda.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedDates.map((group) => (
            <div key={group.dateKey} className="space-y-2.5">
              {/* Date Header with Daily Subtotal */}
              <div className="flex items-center justify-between px-2 py-1 bg-muted/40 rounded-xl border border-border/40">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xs text-foreground uppercase tracking-wide">
                    {group.displayLabel}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs font-semibold">
                  {group.totalExpense > 0 && (
                    <span className="text-rose-500">Keluar: -{formatIDR(group.totalExpense)}</span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-500">Masuk: +{formatIDR(group.totalIncome)}</span>
                  )}
                </div>
              </div>

              {/* Transactions in This Date */}
              <div className="space-y-2">
                {group.items.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <Card key={tx.id} className="hover:border-primary/40 transition-all p-3.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        {/* Left: Info & Time */}
                        <div className="flex items-center space-x-3.5">
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                              isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-sm text-foreground">
                                {tx.description || tx.categoryName}
                              </p>
                              <Badge variant="outline" className="text-[10px] font-normal py-0">
                                {tx.categoryName}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeOnly(tx.transactionDate)}</span>
                              </span>
                              {tx.walletName && (
                                <span className="flex items-center space-x-1">
                                  <Wallet className="h-3 w-3" />
                                  <span>{tx.walletName}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-black text-base ${
                              isIncome ? 'text-emerald-500' : 'text-foreground'
                            }`}
                          >
                            {isIncome ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`}
                          </span>

                          <div className="flex items-center space-x-1 border-l pl-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => setSelectedTxForEdit(tx)}
                              title="Edit Transaksi"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(tx.id)}
                              disabled={isDeleting}
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pageData && pageData.totalPages > 1 && (
        <div className="p-4 border rounded-xl bg-card flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Halaman {pageData.number + 1} dari {pageData.totalPages} ({pageData.totalElements} total transaksi)
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5"
              disabled={page >= pageData.totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={!!selectedTxForEdit}
        onClose={() => setSelectedTxForEdit(null)}
        transaction={selectedTxForEdit}
      />
    </div>
  );
}
