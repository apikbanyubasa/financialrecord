'use client';

import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
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
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Tag,
  Wallet,
} from 'lucide-react';

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);

  const { transactions, pageData, isLoading, deleteTransaction, isDeleting } = useTransactions({
    page,
    size: 25,
    type: typeFilter || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { categories } = useCategories();

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo akan disesuaikan kembali.')) {
      await deleteTransaction(id);
    }
  };

  const groupedDates = groupTransactionsByDate(transactions);

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
      <Card className="p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-muted/60">
            <button
              onClick={() => { setTypeFilter(''); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === '' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua
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
      </Card>

      {/* Chronological Timeline List */}
      {isLoading ? (
        <LoadingSpinner text="Memuat kronologi transaksi..." className="h-64" />
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
