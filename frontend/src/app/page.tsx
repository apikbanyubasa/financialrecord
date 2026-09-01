'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Coffee,
  CheckCircle2,
  WalletCards,
  Receipt,
  Cpu,
  BarChart3,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide shadow-sm animate-pulse-subtle">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Personal Finance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Kendalikan Arus Kas,{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Hentikan Bocor Halus
            </span>{' '}
            dengan AI
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Catat pengeluaran instan lewat <strong>Scan Struk AI</strong> atau ketik santai. Dapatkan visualisasi mendalam kemana perginya pemasukan Anda serta rekomendasi cerdas dari AI Advisor.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto text-base font-bold shadow-xl shadow-emerald-500/25 space-x-2">
                <span>Mulai Sekarang — Gratis</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold border-border/80">
                Masuk ke Akun
              </Button>
            </Link>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="pt-12 max-w-4xl mx-auto">
            <div className="rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-accent/40 border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Total Pemasukan Bulan Ini
                  </span>
                  <p className="text-2xl font-black text-emerald-500">Rp 12.500.000</p>
                  <p className="text-[11px] text-muted-foreground">+8.5% dari bulan lalu</p>
                </div>
                <div className="p-4 rounded-2xl bg-accent/40 border border-border/50 space-y-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <PieChart className="h-3.5 w-3.5 text-rose-500" /> Total Pengeluaran
                  </span>
                  <p className="text-2xl font-black text-rose-500">Rp 7.850.000</p>
                  <p className="text-[11px] text-muted-foreground">Rasio tabungan: 37.2%</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                    <Coffee className="h-3.5 w-3.5" /> Bocor Halus Terdeteksi
                  </span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">Rp 640.000</p>
                  <p className="text-[11px] text-muted-foreground">22x jajan kopi & admin bank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-border/60 bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Fitur Cerdas untuk Finansial Bebas Ribet
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Dibangun dari masalah nyata: malas mencatat, tidak sadar pengeluaran kecil, dan bingung cara menabung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border bg-card/80 hover:border-emerald-500/40 transition-all space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ScanLine className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">AI Multimodal Receipt OCR</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cukup foto struk belanja Indomaret, nota restoran, atau screenshot transfer. AI secara otomatis mengekstrak nominal, toko, dan rincian item.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border bg-card/80 hover:border-emerald-500/40 transition-all space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Natural Language Quick Entry</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ketik santai seperti chat WhatsApp: <em>"Beli bensin 50rb pake Cash"</em>. AI memahami dan langsung memetakan ke kategori dan dompet yang pas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border bg-card/80 hover:border-emerald-500/40 transition-all space-y-4 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Deteksi & Solusi "Bocor Halus"</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Melacak akumulasi pengeluaran mikro di bawah Rp 50.000 yang sering tak terasa, serta memberikan simulasi jika dialihkan ke instrumen investasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-background to-emerald-950/20 border-t border-border/40">
        <div className="container max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Siap Mengambil Kendali Penuh Finansial Anda?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Bergabunglah sekarang dan rasakan kemudahan mencatat keuangan cerdas dengan bantuan AI mutakhir.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button variant="gradient" size="lg" className="font-bold text-base shadow-xl shadow-emerald-500/30">
                Buat Akun Gratis Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/30 text-xs text-muted-foreground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <WalletCards className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-foreground">FinancialRecord</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/login" className="hover:text-foreground">Masuk</Link>
            <Link href="/register" className="hover:text-foreground">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
