'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTransactions } from '@/hooks/useTransactions';
import { useWallets } from '@/hooks/useWallets';
import { useCategories } from '@/hooks/useCategories';
import { TransactionType } from '@/types/category.types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function AddTransactionModal({
  isOpen,
  onClose,
  initialType = 'EXPENSE',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}) {
  const { createTransaction, isCreating } = useTransactions();
  const { wallets } = useWallets();
  const [type, setType] = useState<TransactionType>(initialType);
  const { categories } = useCategories(type);

  const [walletId, setWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  useEffect(() => {
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Nominal transaksi harus lebih dari 0');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet terlebih dahulu');
      return;
    }
    if (!categoryId) {
      setError('Pilih kategori terlebih dahulu');
      return;
    }

    try {
      await createTransaction({
        walletId,
        categoryId,
        amount: parsedAmount,
        type,
        transactionDate: new Date(transactionDate).toISOString(),
        description: description.trim() || undefined,
        isRecurring,
      });

      // Reset form
      setAmount('');
      setDescription('');
      setIsRecurring(false);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan transaksi');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Baru"
      description="Tambahkan pemasukan atau alokasi pengeluaran ke dalam akun Anda"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: EXPENSE vs INCOME */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60">
          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setType('EXPENSE')}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Pengeluaran (Expense)</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setType('INCOME')}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Pemasukan (Income)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <Input
          label="Nominal Transaksi (Rp)"
          type="number"
          placeholder="contoh: 50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Dompet / Rekening</label>
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
        </div>

        <Input
          label="Deskripsi / Catatan"
          type="text"
          placeholder="contoh: Makan siang ayam bakar, Gaji bulanan, dll."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Tanggal & Waktu"
          type="datetime-local"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
        />

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <label htmlFor="recurring" className="text-xs text-muted-foreground cursor-pointer">
            Transaksi Rutin Bulanan (Subscription / Gaji Tetap)
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isCreating}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
