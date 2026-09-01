'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryBreakdownItem } from '@/types/transaction.types';
import { formatIDR } from '@/lib/formatters';

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#D97706'];

export function CategoryDonutChart({ data }: { data: CategoryBreakdownItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Belum ada pengeluaran tercatat bulan ini.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1 border-border">
          <p className="font-semibold text-foreground">{item.categoryName}</p>
          <p className="text-emerald-500 font-bold">{formatIDR(item.amount)}</p>
          <p className="text-muted-foreground">{item.percentage.toFixed(1)}% dari total pengeluaran</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="h-56 w-full md:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend List */}
      <div className="w-full md:w-1/2 space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-accent/40 transition-colors">
            <div className="flex items-center space-x-2 truncate">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }}
              />
              <span className="font-medium text-foreground truncate">{item.categoryName}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-semibold text-foreground mr-1.5">{formatIDR(item.amount)}</span>
              <span className="text-[11px] text-muted-foreground">({item.percentage.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
