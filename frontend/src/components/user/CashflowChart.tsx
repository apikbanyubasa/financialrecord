'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CashflowDataPoint } from '@/types/transaction.types';
import { formatIDR, formatShortIDR } from '@/lib/formatters';

const MONTH_LONG_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function CashflowChart({ data }: { data: CashflowDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Belum ada data transaksi pemasukan / pengeluaran pada rentang waktu ini.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let formattedLabel = label;
      if (label && typeof label === 'string') {
        if (/^\d{4}$/.test(label)) {
          // 4-digit Year, e.g. "2026"
          formattedLabel = `Tahun ${label}`;
        } else {
          const parts = label.split('-');
          if (parts.length === 3) {
            const mIdx = parseInt(parts[1], 10) - 1;
            formattedLabel = `Tanggal ${parts[2]} ${MONTH_LONG_NAMES[mIdx] || parts[1]} ${parts[0]}`;
          } else if (parts.length === 2) {
            const mIdx = parseInt(parts[1], 10) - 1;
            formattedLabel = `Bulan ${MONTH_LONG_NAMES[mIdx] || parts[1]} ${parts[0]}`;
          }
        }
      }

      const incomeVal = Number(payload[0]?.value) || 0;
      const expenseVal = Number(payload[1]?.value) || 0;
      const netVal = incomeVal - expenseVal;

      return (
        <div className="rounded-xl border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 border-border">
          <p className="font-semibold text-foreground border-b pb-1 mb-1">{formattedLabel}</p>
          <div className="flex items-center justify-between space-x-4 text-emerald-500 font-medium">
            <span>Pemasukan:</span>
            <span>{formatIDR(incomeVal)}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-rose-500 font-medium">
            <span>Pengeluaran:</span>
            <span>{formatIDR(expenseVal)}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 font-bold border-t pt-1">
            <span className="text-muted-foreground">Net Cashflow:</span>
            <span className={netVal >= 0 ? 'text-primary' : 'text-rose-500'}>
              {formatIDR(netVal)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              if (!value || typeof value !== 'string') return '';
              if (/^\d{4}$/.test(value)) {
                return value;
              }
              const parts = value.split('-');
              if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}`;
              }
              if (parts.length === 2) {
                const monthNum = parseInt(parts[1], 10);
                return MONTH_SHORT_NAMES[monthNum - 1] || value;
              }
              return value;
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => formatShortIDR(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            name="Pemasukan"
            dataKey="income"
            stroke="#10B981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            name="Pengeluaran"
            dataKey="expense"
            stroke="#F43F5E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
