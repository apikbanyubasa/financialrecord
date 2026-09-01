'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_ITEMS } from '@/lib/constants';
import {
  BarChart3,
  Users,
  Cpu,
  Tags,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const adminIconMap: Record<string, any> = {
  BarChart3,
  Users,
  Cpu,
  Tags,
  ShieldAlert,
};

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex flex-col w-64 border-r border-slate-800 bg-slate-950 text-slate-100 h-screen sticky top-0',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white">
              Admin Executive
            </h1>
            <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">System Governance</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Platform Management
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = adminIconMap[item.icon] || BarChart3;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                  <span>{item.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation Back to App & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Kembali ke User App
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Keluar (Logout)
        </Button>
      </div>
    </aside>
  );
}
