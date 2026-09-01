'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useWallets } from '@/hooks/useWallets';
import { Transaction, TransactionType } from '@/types/transaction.types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
}: {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}) {
  const { updateTransaction, isUpdating } = useTransactions();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { categories } = useCategories(type);
  const { wallets } = useWallets();

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategoryId(transaction.categoryId);
      setWalletId(transaction.walletId);
      setDescription(transaction.description || '');
      setError(null);
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus lebih dari 0');
      return;
    }

    try {
      await updateTransaction({
        id: transaction.id,
        data: {
          amount: numAmount,
          type,
          categoryId: categoryId || categories[0]?.id,
          walletId: walletId || wallets[0]?.id,
          description: description.trim(),
          transactionDate: transaction.transactionDate,
          isRecurring: transaction.isRecurring,
        },
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memperbarui transaksi');
    }
  };

  if (!transaction) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Rincian Transaksi"
      description="Ubah nominal, kategori, dompet, atau catatan transaksi ini."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'border border-input bg-background text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setType('EXPENSE')}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'border border-input bg-background text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setType('INCOME')}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Pemasukan</span>
            </button>
          </div>
        </div>

        {/* Nominal Amount */}
        <Input
          label="Nominal (Rp)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        {/* Category & Wallet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Kategori</label>
            <select
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Kantong Dompet</label>
            <select
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-ring"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <Input
          label="Deskripsi / Catatan"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isUpdating}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
