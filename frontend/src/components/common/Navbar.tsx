'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { WalletCards, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              FinancialRecord
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              AI Powered
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-muted-foreground">
          <Link href="#nlp-entry" className="hover:text-emerald-500 transition-colors">
            Catat Cepat AI
          </Link>
          <Link href="#kantong-pos" className="hover:text-emerald-500 transition-colors">
            Kantong Pos
          </Link>
          <Link href="#budgeting" className="hover:text-emerald-500 transition-colors">
            Limit Budget
          </Link>
          <Link href="#dashboard-preview" className="hover:text-emerald-500 transition-colors">
            Arus Kas
          </Link>
          <Link href="#features" className="hover:text-emerald-500 transition-colors">
            Fitur Lengkap
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'}>
              <Button variant="gradient" size="sm" className="space-x-1.5">
                <span>{isAdmin ? 'Portal Admin' : 'Dashboard Saya'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm">
                  Daftar Gratis
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
