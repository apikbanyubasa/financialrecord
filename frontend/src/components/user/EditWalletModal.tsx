'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallets } from '@/hooks/useWallets';
import { Wallet, WalletType } from '@/types/wallet.types';

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
  const [type, setType] = useState<WalletType>('BANK');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wallet) {
      setName(wallet.name);
      setType(wallet.type);
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
          type,
          initialBalance: bal,
        },
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memperbarui data dompet');
    }
  };

  if (!wallet) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Kantong Dompet / Rekening"
      description={`Ubah rincian informasi dan saldo untuk ${wallet.name}`}
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
          label="Saldo (Rp)"
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
