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

export function CashflowChart({ data }: { data: CashflowDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Belum ada data cashflow untuk ditampilkan.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 border-border">
          <p className="font-semibold text-foreground border-b pb-1 mb-1">{label}</p>
          <div className="flex items-center justify-between space-x-4 text-emerald-500 font-medium">
            <span>Pemasukan:</span>
            <span>{formatIDR(payload[0]?.value)}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-rose-500 font-medium">
            <span>Pengeluaran:</span>
            <span>{formatIDR(payload[1]?.value)}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-cyan-500 font-semibold border-t pt-1">
            <span>Net Cashflow:</span>
            <span>{formatIDR(payload[0]?.value - payload[1]?.value)}</span>
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
              const parts = value.split('-');
              return `${parts[2]}/${parts[1]}`;
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
