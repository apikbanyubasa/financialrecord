'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_NAV_ITEMS } from '@/lib/constants';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  Sparkles,
  Settings,
  LogOut,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Receipt,
  Wallet,
  PieChart,
  Sparkles,
  Settings,
};

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 z-20',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-border/60">
        <Link href="/dashboard" prefetch={true} className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              FinancialRecord
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">Personal Finance AI</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Menu Utama
        </div>
        {USER_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} prefetch={true}>
              <div
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center justify-between p-2 rounded-xl bg-accent/40 mb-2">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
              {user?.fullName ? user.fullName.substring(0, 2) : 'US'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-foreground">{user?.fullName || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Keluar (Logout)
        </Button>
      </div>
    </aside>
  );
}
