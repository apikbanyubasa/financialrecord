'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallets } from '@/hooks/useWallets';
import { PocketType } from '@/types/wallet.types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function AddWalletModal({
  isOpen,
  onClose,
  initialPocketType = 'EXPENSE',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPocketType?: PocketType;
}) {
  const { createWallet, isCreating } = useWallets();

  const [name, setName] = useState('');
  const [pocketType, setPocketType] = useState<PocketType>(initialPocketType);
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPocketType(initialPocketType);
    }
  }, [isOpen, initialPocketType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const balance = parseFloat(initialBalance) || 0;

    try {
      await createWallet({
        name: name.trim(),
        type: 'BANK',
        pocketType,
        aiGenerated: false,
        aiInsight: 'Dibuat secara manual oleh pengguna',
        initialBalance: balance,
      });

      setName('');
      setInitialBalance('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menambahkan kantong pos baru');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Kantong Pos Baru"
      description="Buat pos penerimaan uang atau pos alokasi pengeluaran Anda"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pocket Type Toggle: INCOME vs EXPENSE */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/60">
          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              pocketType === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setPocketType('INCOME')}
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Pos Pemasukan</span>
          </button>
          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
              pocketType === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setPocketType('EXPENSE')}
          >
            <ArrowDownRight className="h-4 w-4" />
            <span>Pos Pengeluaran</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <Input
          label="Nama Kantong Pos"
          type="text"
          placeholder={
            pocketType === 'INCOME'
              ? 'contoh: Kantong Gaji Pokok, Hasil Freelance, Omset Toko'
              : 'contoh: Kantong Makanan & Minuman, Transportasi, Tagihan'
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Nominal Saldo Awal (Rp)"
          type="number"
          placeholder="0"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          required
        />

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isCreating}>
            Simpan Kantong
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
