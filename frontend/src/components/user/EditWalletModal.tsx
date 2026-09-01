'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallets } from '@/hooks/useWallets';
import { Wallet, PocketType } from '@/types/wallet.types';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function EditWalletModal({
  isOpen,
  onClose,
  wallet,
}: {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}) {
  const { updateWallet, isUpdating } = useWallets();

  const [name, setName] = useState('');
  const [pocketType, setPocketType] = useState<PocketType>('EXPENSE');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setPocketType(wallet.pocketType || 'EXPENSE');
      setBalance(String(wallet.balance));
      setError(null);
    }
  }, [wallet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setError(null);

    const bal = parseFloat(balance) || 0;

    try {
      await updateWallet({
        id: wallet.id,
        data: {
          name: name.trim(),
          type: wallet.type || 'BANK',
          pocketType,
          aiInsight: wallet.aiInsight,
          initialBalance: bal,
        },
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memperbarui data kantong');
    }
  };

  if (!wallet) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kantong Pos Keuangan"
      description={`Ubah rincian informasi dan nominal saldo untuk ${wallet.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pocket Type Toggle */}
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Saldo / Nominal Dana (Rp)"
          type="number"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
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
