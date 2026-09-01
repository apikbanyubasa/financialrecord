'use client';

import React, { useState } from 'react';
import { useWallets } from '@/hooks/useWallets';
import { formatIDR } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddWalletModal } from '@/components/user/AddWalletModal';
import { EditWalletModal } from '@/components/user/EditWalletModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Wallet } from '@/types/wallet.types';
import {
  WalletCards,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  HeartHandshake,
  Coffee,
  ShieldCheck,
  PiggyBank,
} from 'lucide-react';

const pocketDescriptions: Record<string, { label: string; ratio: string; desc: string; icon: any; colorClass: string }> = {
  'Kantong Kebutuhan Pokok (Needs)': {
    label: 'Pos Kebutuhan Pokok',
    ratio: 'Alokasi ~50%',
    desc: 'Untuk makan sehari-hari, bensin, tagihan listrik/wifi, dan kebutuhan wajib bulanan.',
    icon: HeartHandshake,
    colorClass: 'text-blue-500 bg-blue-500/10',
  },
  'Kantong Gaya Hidup & Hiburan (Wants)': {
    label: 'Pos Gaya Hidup & Hiburan',
    ratio: 'Alokasi ~30%',
    desc: 'Untuk nongkrong kopi, kuliner santai, bioskop, shopping hobi, dan hiburan.',
    icon: Coffee,
    colorClass: 'text-amber-500 bg-amber-500/10',
  },
  'Kantong Tabungan & Masa Depan (Savings)': {
    label: 'Pos Tabungan & Investasi',
    ratio: 'Alokasi ~20%',
    desc: 'Untuk simpanan dana darurat, tabungan masa depan, dan investasi jangka panjang.',
    icon: PiggyBank,
    colorClass: 'text-emerald-500 bg-emerald-500/10',
  },
};

export function WalletsPage() {
  const { wallets, isLoading, deleteWallet } = useWallets();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWalletForEdit, setSelectedWalletForEdit] = useState<Wallet | null>(null);

  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kantong pos ini?')) {
      await deleteWallet(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Kantong Pos Alokasi Keuangan</h2>
          <p className="text-xs text-muted-foreground">
            Alokasikan dana Anda ke pos Kebutuhan Pokok (50%), Gaya Hidup (30%), dan Tabungan Masa Depan (20%)
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="space-x-1.5 font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pos Baru</span>
        </Button>
      </div>

      {/* Total Aggregated Balance Card */}
      <Card className="bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent border-emerald-500/30">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Dana di Seluruh Pos Alokasi
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mt-1">
              {formatIDR(totalBalance)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Terbagi secara proporsional di {wallets.length} kantong pos keuangan
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <WalletCards className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      {isLoading ? (
        <LoadingSpinner text="Memuat kantong pos..." className="h-64" />
      ) : wallets.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border rounded-2xl bg-card space-y-3">
          <p className="text-sm font-semibold">Belum ada kantong pos yang dibuat.</p>
          <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
            Buat Pos Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wallets.map((w) => {
            const meta = pocketDescriptions[w.name] || {
              label: 'Pos Keuangan Khusus',
              ratio: 'Alokasi Mandiri',
              desc: 'Pos alokasi yang disesuaikan secara personal untuk kebutuhan khusus Anda.',
              icon: ShieldCheck,
              colorClass: 'text-primary bg-primary/10',
            };
            const Icon = meta.icon;

            return (
              <Card key={w.id} className="hover:border-primary/40 transition-all flex flex-col justify-between p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${meta.colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {meta.ratio}
                        </span>
                      </div>
                      <CardTitle className="text-base mt-0.5">{w.name}</CardTitle>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => setSelectedWalletForEdit(w)}
                      title="Edit Saldo / Nama Pos"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(w.id)}
                      title="Hapus Pos"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {meta.desc}
                </p>

                <div className="pt-3 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground block font-medium">Sisa Alokasi Dana:</span>
                  <p className={`text-2xl font-black mt-0.5 ${w.balance < 0 ? 'text-rose-500' : 'text-primary'}`}>
                    {formatIDR(w.balance)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditWalletModal
        isOpen={!!selectedWalletForEdit}
        onClose={() => setSelectedWalletForEdit(null)}
        wallet={selectedWalletForEdit}
      />
    </div>
  );
}

export default WalletsPage;
