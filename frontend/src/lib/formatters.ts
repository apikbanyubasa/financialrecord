import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction } from '@/types/transaction.types';

export function formatIDR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortIDR(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}Rb`;
  }
  return formatIDR(amount);
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
  } catch {
    return String(dateString);
  }
}

export function formatTimeOnly(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'HH:mm', { locale: id }) + ' WIB';
  } catch {
    return '-';
  }
}

export function formatShortDate(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMM yyyy', { locale: id });
  } catch {
    return String(dateString);
  }
}

export function formatJoinedDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'Baru Bergabung';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'd MMMM yyyy', { locale: id });
  } catch {
    return String(dateString);
  }
}

export function formatPercentage(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

export function formatMonthYear(monthStr: string | undefined): string {
  if (!monthStr) return '-';
  try {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return format(date, 'MMMM yyyy', { locale: id });
  } catch {
    return monthStr;
  }
}


export interface DateGroupedTransactions {
  dateKey: string;
  displayLabel: string;
  fullDateLabel: string;
  totalIncome: number;
  totalExpense: number;
  items: Transaction[];
}

export function groupTransactionsByDate(transactions: Transaction[]): DateGroupedTransactions[] {
  const map: Record<string, { displayLabel: string; fullDateLabel: string; items: Transaction[] }> = {};

  for (const tx of transactions) {
    if (!tx.transactionDate) continue;
    try {
      const date = typeof tx.transactionDate === 'string' ? parseISO(tx.transactionDate) : tx.transactionDate;
      const dateKey = format(date, 'yyyy-MM-dd');

      let displayLabel = format(date, 'EEEE, dd MMMM yyyy', { locale: id });
      if (isToday(date)) {
        displayLabel = 'Hari Ini (' + format(date, 'dd MMM yyyy', { locale: id }) + ')';
      } else if (isYesterday(date)) {
        displayLabel = 'Kemarin (' + format(date, 'dd MMM yyyy', { locale: id }) + ')';
      }

      const fullDateLabel = format(date, 'dd MMMM yyyy', { locale: id });

      if (!map[dateKey]) {
        map[dateKey] = {
          displayLabel,
          fullDateLabel,
          items: [],
        };
      }
      map[dateKey].items.push(tx);
    } catch {
      // ignore
    }
  }

  // Convert to sorted array (latest date first)
  const keys = Object.keys(map).sort((a, b) => b.localeCompare(a));

  return keys.map((key) => {
    const entry = map[key];
    const totalIncome = entry.items
      .filter((i) => i.type === 'INCOME')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const totalExpense = entry.items
      .filter((i) => i.type === 'EXPENSE')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    return {
      dateKey: key,
      displayLabel: entry.displayLabel,
      fullDateLabel: entry.fullDateLabel,
      totalIncome,
      totalExpense,
      items: entry.items,
    };
  });
}
