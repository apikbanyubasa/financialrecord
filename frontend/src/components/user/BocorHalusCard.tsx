'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Coffee, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatIDR } from '@/lib/formatters';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function BocorHalusCard({
  totalAmount,
  count,
}: {
  totalAmount: number;
  count: number;
}) {
  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card to-card relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Coffee className="h-32 w-32 text-amber-500" />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Deteksi "Bocor Halus"</CardTitle>
              <CardDescription className="text-xs">Pengeluaran kecil harian (≤ Rp 50.000)</CardDescription>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {count} Transaksi
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2 space-y-3">
        <div>
          <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            {formatIDR(totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Terkumpul dari biaya admin bank, kopi saset, parkir, & jajan kecil bulan ini.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground">
            Bisa dialihkan ke instrumen reksa dana bulanan.
          </p>
          <Link href="/advisor">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 px-2 space-x-1">
              <span>Lihat Solusi AI</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
