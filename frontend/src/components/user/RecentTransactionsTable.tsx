'use client';

import React from 'react';
import { Transaction } from '@/types/transaction.types';
import { formatIDR, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { ArrowDownRight, ArrowUpRight, Coffee, Utensils, Car, ShoppingBag, Receipt, Film, HeartPulse, GraduationCap, Briefcase, Laptop, TrendingUp, Gift, Coins, Tag } from 'lucide-react';

const iconLookup: Record<string, any> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Coffee,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
};

export function RecentTransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Belum ada riwayat transaksi.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase text-muted-foreground border-b bg-muted/30">
          <tr>
            <th className="px-4 py-3 font-semibold">Transaksi</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Dompet</th>
            <th className="px-4 py-3 font-semibold">Tanggal</th>
            <th className="px-4 py-3 font-semibold text-right">Nominal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const IconComp = tx.categoryIcon ? (iconLookup[tx.categoryIcon] || Tag) : Tag;

            return (
              <tr key={tx.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}
                      style={{ backgroundColor: tx.categoryColor || (isIncome ? '#10B981' : '#F43F5E') }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground truncate max-w-[180px]">
                        {tx.description || tx.categoryName}
                      </p>
                      {tx.isRecurring && (
                        <span className="text-[10px] text-indigo-500 font-medium">Langganan Rutin</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-normal text-xs">
                    {tx.categoryName}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs font-medium">
                  {tx.walletName}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(tx.transactionDate)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span
                    className={`font-bold inline-flex items-center space-x-1 ${
                      isIncome ? 'text-emerald-500' : 'text-foreground'
                    }`}
                  >
                    {isIncome ? (
                      <>
                        <ArrowUpRight className="h-3.5 w-3.5 inline text-emerald-500 mr-0.5" />
                        <span>+{formatIDR(tx.amount)}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3.5 w-3.5 inline text-rose-500 mr-0.5" />
                        <span>-{formatIDR(tx.amount)}</span>
                      </>
                    )}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
