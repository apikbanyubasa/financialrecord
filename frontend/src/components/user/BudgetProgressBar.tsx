'use client';

import React from 'react';
import { Budget } from '@/types/budget.types';
import { Progress } from '@/components/ui/Progress';
import { formatIDR } from '@/lib/formatters';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function BudgetProgressBar({
  budget,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: string) => void;
}) {
  const percentage = budget.percentageUsed;
  let statusColor = '#10B981'; // Green
  let statusText = 'Aman';
  let badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

  if (percentage >= 100) {
    statusColor = '#EF4444'; // Red
    statusText = 'Over Budget!';
    badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  } else if (percentage >= 80) {
    statusColor = '#F59E0B'; // Yellow
    statusText = 'Mendekati Limit';
    badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }

  return (
    <div className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span
            className="h-3.5 w-3.5 rounded-full shrink-0"
            style={{ backgroundColor: budget.categoryColor || '#10B981' }}
          />
          <div>
            <h4 className="font-semibold text-sm text-foreground">{budget.categoryName}</h4>
            <p className="text-xs text-muted-foreground">
              Limit: {formatIDR(budget.monthlyLimit)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border mr-1 ${badgeClass}`}>
            {statusText} ({percentage.toFixed(0)}%)
          </span>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onEdit(budget)}
              title="Edit Limit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(budget.id)}
              title="Hapus Limit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Progress value={budget.currentSpent} max={budget.monthlyLimit} indicatorColor={statusColor} />

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>Terpakai: <strong className="text-foreground font-semibold">{formatIDR(budget.currentSpent)}</strong></span>
        <span>
          Sisa: <strong className={`font-semibold ${budget.remainingAmount < 0 ? 'text-destructive' : 'text-foreground'}`}>{formatIDR(budget.remainingAmount)}</strong>
        </span>
      </div>
    </div>
  );
}
