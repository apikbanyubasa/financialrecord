'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, ScanLine, Bell } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddModal?: () => void;
  onOpenNlpModal?: () => void;
}

export function Header({ title, subtitle, onOpenAddModal, onOpenNlpModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {onOpenNlpModal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNlpModal}
            className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 font-semibold space-x-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ketik Cepat AI (NLP)</span>
          </Button>
        )}

        {onOpenAddModal && (
          <Button variant="gradient" size="sm" onClick={onOpenAddModal} className="space-x-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            <span>Catat Transaksi</span>
          </Button>
        )}

        <div className="h-5 w-px bg-border/60 mx-1" />
        <ThemeToggle />
      </div>
    </header>
  );
}
