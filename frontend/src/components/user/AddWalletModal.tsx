'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallets } from '@/hooks/useWallets';
import { WalletType } from '@/types/wallet.types';

export function AddWalletModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { createWallet, isCreating } = useWallets();

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('BANK');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const balance = parseFloat(initialBalance) || 0;

    try {
      await createWallet({
        name: name.trim(),
        type,
        initialBalance: balance,
      });

      setName('');
      setInitialBalance('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menambahkan dompet baru');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Kantong Dompet Baru"
      description="Kelola rekening bank, e-wallet, atau uang tunai untuk pelacakan saldo yang akurat"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <Input
          label="Nama Dompet / Rekening"
          type="text"
          placeholder="contoh: Mandiri Utama, GoPay, Brankas Cash"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Tipe Dompet</label>
          <select
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-ring"
            value={type}
            onChange={(e) => setType(e.target.value as WalletType)}
          >
            <option value="BANK">Rekening Bank (BCA, Mandiri, BRI, dll)</option>
            <option value="EWALLET">E-Wallet (GoPay, OVO, ShopeePay, Dana)</option>
            <option value="CASH">Uang Tunai / Cash Dompet</option>
            <option value="INVESTMENT">Akun Investasi / Reksadana / Saham</option>
          </select>
        </div>

        <Input
          label="Saldo Awal (Rp)"
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
            Simpan Dompet
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
