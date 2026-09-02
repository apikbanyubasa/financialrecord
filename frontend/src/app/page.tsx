'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAuth } from '@/hooks/useAuth';
import { formatIDR } from '@/lib/formatters';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Wallet,
  Receipt,
  PieChart,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Zap,
  ShieldCheck,
  PiggyBank,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  RotateCcw,
  Check,
  HelpCircle,
  Activity,
  Cpu,
  Coins,
  Utensils,
  Briefcase,
  Lock,
} from 'lucide-react';

// Sample NLP Presets for visitor interactive testing
const NLP_PRESETS = [
  {
    label: 'Jajan & Gaji Harian',
    text: 'beli kopi kenangan 25rb, makan siang warteg 22.000, gajian bulanan 8.500.000 ke rekening',
  },
  {
    label: 'Kebutuhan Rumah & Bensin',
    text: 'beli bensin motor 50rb pake cash, bayar paket data wifi 350rb, belanja sayur 45rb',
  },
  {
    label: 'Project Freelance & Tagihan',
    text: 'dapat transfer project freelance 3.000.000, bayar listrik pln 250.000, beli snack 15.000',
  },
];

interface ParsedNlpItem {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  category: string;
  amount: number;
}

export default function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  // --- Showcase Tabs State ---
  const [activeTab, setActiveTab] = useState<'nlp' | 'dashboard' | 'budgeting' | 'kantong-pos'>('nlp');

  // --- NLP Playground State ---
  const [nlpInput, setNlpInput] = useState(NLP_PRESETS[0].text);
  const [isProcessingNlp, setIsProcessingNlp] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedNlpItem[]>([
    {
      id: '1',
      type: 'EXPENSE',
      description: 'Kopi Kenangan',
      category: 'Kuliner & Minuman',
      amount: 25000,
    },
    {
      id: '2',
      type: 'EXPENSE',
      description: 'Makan Siang Warteg',
      category: 'Makanan & Kebutuhan',
      amount: 22000,
    },
    {
      id: '3',
      type: 'INCOME',
      description: 'Gajian Bulanan',
      category: 'Gaji Pokok & Upah',
      amount: 8500000,
    },
  ]);

  // Client-side smart NLP parser simulation for the playground
  const handleRunNlpSimulation = (textToParse?: string) => {
    const rawText = textToParse || nlpInput;
    if (!rawText.trim()) return;

    setIsProcessingNlp(true);

    setTimeout(() => {
      // Split by commas, newline, or 'dan'
      const parts = rawText.split(/,|\n|\bdan\b/gi).map((s) => s.trim()).filter(Boolean);
      const newItems: ParsedNlpItem[] = [];

      parts.forEach((part, index) => {
        const lower = part.toLowerCase();

        // Determine type
        const isIncome =
          lower.includes('gaji') ||
          lower.includes('dapat') ||
          lower.includes('terima') ||
          lower.includes('masuk') ||
          lower.includes('freelance') ||
          lower.includes('bonus') ||
          lower.includes('penjualan') ||
          lower.includes('untung');

        // Extract amount
        let amount = 25000;
        const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
        const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k\b)/);
        const numMatch = lower.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)/);

        if (jtMatch) {
          amount = parseFloat(jtMatch[1].replace(',', '.')) * 1_000_000;
        } else if (rbMatch) {
          amount = parseFloat(rbMatch[1].replace(',', '.')) * 1_000;
        } else if (numMatch) {
          const cleanNum = numMatch[1].replace(/[.,]/g, '');
          const val = parseInt(cleanNum, 10);
          if (!isNaN(val) && val > 0) amount = val;
        }

        // Determine description & category
        let description = part
          .replace(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|rb|ribu|k)/gi, '')
          .replace(/(?:ke|dari|pake|pakai|cash|rekening|bca|gopay|ovo)\b/gi, '')
          .trim();
        if (!description) description = `Transaksi ${index + 1}`;
        description = description.charAt(0).toUpperCase() + description.slice(1);

        let category = 'Pengeluaran Lainnya';
        if (isIncome) {
          category = lower.includes('freelance') ? 'Pendapatan Sampingan' : 'Gaji Pokok & Upah';
        } else {
          if (lower.includes('kopi') || lower.includes('snack') || lower.includes('makan') || lower.includes('warteg')) {
            category = 'Makanan & Minuman';
          } else if (lower.includes('bensin') || lower.includes('gojek') || lower.includes('grab') || lower.includes('parkir')) {
            category = 'Transportasi';
          } else if (lower.includes('wifi') || lower.includes('listrik') || lower.includes('pulsa') || lower.includes('pln')) {
            category = 'Tagihan & Utilitas';
          } else if (lower.includes('sayur') || lower.includes('belanja') || lower.includes('beras')) {
            category = 'Belanja Kebutuhan Pokok';
          }
        }

        newItems.push({
          id: String(Date.now() + index),
          type: isIncome ? 'INCOME' : 'EXPENSE',
          description,
          category,
          amount,
        });
      });

      if (newItems.length > 0) {
        setParsedResults(newItems);
      }
      setIsProcessingNlp(false);
    }, 450);
  };

  // --- Kantong Pos State ---
  const [pocketTab, setPocketTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  // --- FAQ State ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-emerald-500 selection:text-white">
      {/* Navbar with synced anchors */}
      <Navbar />

      {/* ========================================================= */}
      {/* HERO SECTION WITH INTERACTIVE LIVE PLAYGROUND */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-teal-500/10 blur-[110px] rounded-full pointer-events-none -z-10" />

        <div className="container max-w-7xl px-4 sm:px-8 mx-auto">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personal Finance AI Terpadu</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Kelola Uang Lebih Cerdas Tanpa Ribet dengan{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Natural Language AI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ketik pengeluaran dalam satu kalimat santai, kelompokkan ke dalam Kantong Pos dinamis, pantau arus kas per tahun, bulan, & hari, serta kendalikan target limit budget otomatis.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href={isAuthenticated ? '/dashboard' : '/register'}>
                <Button variant="gradient" size="lg" className="rounded-xl px-7 text-sm font-bold shadow-lg shadow-emerald-500/25">
                  <span>{isAuthenticated ? 'Buka Dashboard Saya' : 'Mulai Sekarang Gratis'}</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="#nlp-entry">
                <Button variant="outline" size="lg" className="rounded-xl px-6 text-sm font-semibold border-border/80 hover:bg-accent/60">
                  <Play className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  <span>Coba Live Simulator AI</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE PLAYGROUND SHOWCASE TABS */}
          {/* ========================================================= */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-black/5 dark:shadow-emerald-950/20">
              {/* Tab Selector Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-border/60 pb-4 mb-6">
                <button
                  onClick={() => setActiveTab('nlp')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'nlp'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>1. Catat Cepat AI</span>
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>2. Dashboard Arus Kas</span>
                </button>

                <button
                  onClick={() => setActiveTab('budgeting')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'budgeting'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>3. Limit & Target Budget</span>
                </button>

                <button
                  onClick={() => setActiveTab('kantong-pos')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === 'kantong-pos'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>4. Kantong Pos</span>
                </button>
              </div>

              {/* TAB 1: LIVE NLP PLAYGROUND */}
              {activeTab === 'nlp' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center space-x-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Ketik kalimat transaksi bebas Anda (Multi-item didukung):</span>
                      </label>
                      <span className="text-[11px] text-muted-foreground">Diproses oleh Google Gemini AI</span>
                    </div>

                    <div className="relative">
                      <textarea
                        value={nlpInput}
                        onChange={(e) => setNlpInput(e.target.value)}
                        placeholder="Contoh: beli bensin 50rb, makan siang 25.000, gajian freelance 2.500.000..."
                        rows={3}
                        className="w-full rounded-2xl border border-input bg-background/80 p-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none shadow-inner"
                      />
                      <Button
                        onClick={() => handleRunNlpSimulation()}
                        disabled={isProcessingNlp || !nlpInput.trim()}
                        className="absolute bottom-3 right-3 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      >
                        {isProcessingNlp ? (
                          <>
                            <RotateCcw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            <span>Menganalisis...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 mr-1" />
                            <span>Ekstrak Otomatis AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-muted-foreground">Coba Contoh Kalimat:</span>
                    {NLP_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setNlpInput(preset.text);
                          handleRunNlpSimulation(preset.text);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-border transition-colors font-medium text-left"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Parsed Output Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Hasil Ekstraksi Entitas AI ({parsedResults.length} Transaksi Terdeteksi):</span>
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Siap Disimpan Sekaligus
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {parsedResults.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl border border-border/70 bg-background/90 shadow-sm flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                item.type === 'INCOME'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {item.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[120px]">
                              {item.category}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-xs text-foreground truncate">{item.description}</p>
                            <p
                              className={`text-sm font-black mt-0.5 ${
                                item.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                              }`}
                            >
                              {item.type === 'INCOME' ? '+' : '-'} {formatIDR(item.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE DASHBOARD PREVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* 4 Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-card border border-border/60">
                      <span className="text-[11px] text-muted-foreground">Total Saldo Bersih:</span>
                      <p className="text-lg sm:text-xl font-black text-foreground mt-0.5">{formatIDR(4060000)}</p>
                      <p className="text-[10px] text-emerald-500 font-semibold mt-1">5 Kantong Pos Aktif</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5">
                      <span className="text-[11px] text-muted-foreground">Pemasukan Bulan Ini:</span>
                      <p className="text-lg sm:text-xl font-black text-emerald-500 mt-0.5">{formatIDR(5200000)}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-0.5" /> 2 Transaksi Masuk
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-card border border-rose-500/30 bg-rose-500/5">
                      <span className="text-[11px] text-muted-foreground">Pengeluaran Bulan Ini:</span>
                      <p className="text-lg sm:text-xl font-black text-rose-500 mt-0.5">{formatIDR(1140000)}</p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-0.5" /> Terkendali dalam limit
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-card border border-cyan-500/30 bg-cyan-500/5">
                      <span className="text-[11px] text-muted-foreground">Rasio Tabungan (Net):</span>
                      <p className="text-lg sm:text-xl font-black text-cyan-500 mt-0.5">78.1%</p>
                      <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">Kesehatan: Sangat Baik</p>
                    </div>
                  </div>

                  {/* Cashflow & Category Visualization Bar */}
                  <div className="p-4 rounded-2xl bg-card border border-border/60 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-emerald-500" />
                          Grafik Arus Kas (Per Tahun, Per Bulan, & Harian):
                        </span>
                        <span className="text-[11px] text-muted-foreground">September 2026</span>
                      </div>

                      {/* Simulated Chart Bars */}
                      <div className="h-28 flex items-end gap-1.5 pt-4 border-b border-border/50 pb-1">
                        {[35, 20, 45, 15, 60, 80, 25, 90, 40, 10, 50, 75, 95, 30].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                            <div
                              className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:opacity-80 transition-opacity"
                              style={{ height: `${val}%` }}
                            />
                            <span className="text-[8px] text-muted-foreground">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pemasukan Stabil
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-rose-500" /> Pengeluaran Terkontrol
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-2.5 border-t md:border-t-0 md:border-l border-border/60 md:pl-4 pt-2 md:pt-0">
                      <span className="text-xs font-bold block">Alokasi Pos Pengeluaran:</span>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Belanja Kebutuhan Pokok</span>
                            <span className="font-bold">Rp 700.000 (61%)</span>
                          </div>
                          <Progress value={61} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Tagihan & Utilitas</span>
                            <span className="font-bold">Rp 350.000 (31%)</span>
                          </div>
                          <Progress value={31} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>Makanan & Minuman</span>
                            <span className="font-bold">Rp 90.000 (8%)</span>
                          </div>
                          <Progress value={8} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIMIT & TARGET BUDGET SHOWCASE */}
              {activeTab === 'budgeting' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Item 1: Status Aman */}
                    <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Makanan & Kuliner</span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                          Aman (35%)
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Terpakai: Rp 350.000</span>
                          <span className="font-bold">Limit: Rp 1.000.000</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Sisa kuota aman Rp 650.000 hingga akhir bulan.
                      </p>
                    </div>

                    {/* Item 2: Status Waspada */}
                    <div className="p-4 rounded-2xl bg-card border border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Belanja Kebutuhan</span>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
                          Waspada (85%)
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Terpakai: Rp 850.000</span>
                          <span className="font-bold">Limit: Rp 1.000.000</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Sudah mencapai 85% batas anggaran bulanan.
                      </p>
                    </div>

                    {/* Item 3: Status Overbudget */}
                    <div className="p-4 rounded-2xl bg-card border border-rose-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Hiburan & Rekreasi</span>
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px]">
                          Overbudget (120%)
                        </Badge>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Terpakai: Rp 600.000</span>
                          <span className="font-bold">Limit: Rp 500.000</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <p className="text-[10px] text-rose-500 font-bold">
                        Melebihi limit sebesar Rp 100.000!
                      </p>
                    </div>
                  </div>

                  {/* AI Recommendation Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3 text-xs">
                    <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">Rekomendasi Penyeimbangan Anggaran Otomatis:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Sistem menyarankan pengalihan sisa kuota aman dari kategori Makanan ke pos Hiburan untuk menjaga total cashflow tetap surplus di akhir bulan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: KANTONG POS */}
              {activeTab === 'kantong-pos' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Tab Selector */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPocketTab('EXPENSE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          pocketTab === 'EXPENSE'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <ArrowDownRight className="h-3.5 w-3.5" />
                        <span>Kantong Pos Pengeluaran (3 Pos)</span>
                      </button>

                      <button
                        onClick={() => setPocketTab('INCOME')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          pocketTab === 'INCOME'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>Kantong Pos Pemasukan (2 Pos)</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      Dikelompokkan Otomatis dari Hasil AI
                    </span>
                  </div>

                  {pocketTab === 'EXPENSE' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">Pos Belanja Dapur</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-semibold">1 Transaksi</span>
                        </div>
                        <p className="text-lg font-black text-rose-500">Rp 700.000</p>
                        <p className="text-[11px] text-muted-foreground">Belanja bulanan supermarket</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">Pos Tagihan & Listrik</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-semibold">1 Transaksi</span>
                        </div>
                        <p className="text-lg font-black text-rose-500">Rp 350.000</p>
                        <p className="text-[11px] text-muted-foreground">Token PLN & WiFi Indihome</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">Pos Makanan Harian</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-semibold">2 Transaksi</span>
                        </div>
                        <p className="text-lg font-black text-rose-500">Rp 90.000</p>
                        <p className="text-[11px] text-muted-foreground">Makan siang & kuliner harian</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">Pos Gaji Pokok</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">1 Transaksi</span>
                        </div>
                        <p className="text-xl font-black text-emerald-500">Rp 5.000.000</p>
                        <p className="text-[11px] text-muted-foreground">Transfer payroll bulanan</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">Pos Project Freelance</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">1 Transaksi</span>
                        </div>
                        <p className="text-xl font-black text-emerald-500">Rp 200.000</p>
                        <p className="text-[11px] text-muted-foreground">Jasa desain & konsultasi</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: CATAT CEPAT AI (#nlp-entry) */}
      {/* ========================================================= */}
      <section id="nlp-entry" className="py-20 border-t border-border/60">
        <div className="container max-w-7xl px-4 sm:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Teknologi NLP Berbasis Gemini AI</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Tulis Bebas Seperti Chatting, AI yang Merapikannya ke Database
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Tidak perlu lagi memilih dropdown satu per satu saat mencatat pengeluaran. Cukup tuliskan kalimat sehari-hari dalam satu paragraf, AI akan mendeteksi nominal, jenis transaksi, dan kategori pos secara instan.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Multi-Item Sekaligus dalam 1 Input</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pisahkan dengan tanda koma, baris baru, atau kata sambung "dan" untuk mencatat 5-10 pengeluaran sekaligus dalam 3 detik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Pengenalan Format Angka Indonesia</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mendukung penulisan fleksibel seperti <strong>25rb</strong>, <strong>50k</strong>, <strong>1.5jt</strong>, <strong>3.000.000</strong>, atau nominal desimal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 border-b border-border/50 pb-3">
                  <Cpu className="h-4 w-4" />
                  <span>Alur Pemrosesan AI Realtime</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/60 text-xs font-mono text-foreground border border-border/50">
                  "beli bensin 50rb pake cash, bayar paket wifi 350rb, gajian project 2jt"
                </div>

                <div className="flex justify-center text-muted-foreground">
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">Gajian Project</p>
                      <p className="text-[10px] text-muted-foreground">Pendapatan Sampingan • Transfer</p>
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+ Rp 2.000.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-rose-500">Bayar Paket Wifi</p>
                      <p className="text-[10px] text-muted-foreground">Tagihan & Utilitas</p>
                    </div>
                    <span className="font-black text-rose-500 text-sm">- Rp 350.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-rose-500">Beli Bensin</p>
                      <p className="text-[10px] text-muted-foreground">Transportasi • Kas Tunai</p>
                    </div>
                    <span className="font-black text-rose-500 text-sm">- Rp 50.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: KANTONG POS KEUANGAN (#kantong-pos) */}
      {/* ========================================================= */}
      <section id="kantong-pos" className="py-20 border-t border-border/60 bg-muted/20">
        <div className="container max-w-7xl px-4 sm:px-8 mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Wallet className="h-3.5 w-3.5" />
              <span>Metode Amplop Pos Modern</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Pisahkan Dana Sesuai Posnya dengan Kantong Pos Keuangan
            </h2>
            <p className="text-sm text-muted-foreground">
              Pengelompokan otomatis pemasukan dan pengeluaran per periode bulanan, tahunan, atau sepanjang waktu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Filter Periode Lengkap</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lihat alokasi kantong pos khusus bulan tertentu, rekapitulasi tahunan 12 bulan, atau akumulasi total semua waktu secara akurat.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Kantong Pos Pemasukan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pisahkan pos gaji bulanan, bonus project sampingan, atau passive income dividen agar sumber dana terlihat transparan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Kantong Pos Pengeluaran</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kelompokkan pos kebutuhan pokok, cicilan, gaya hidup, dan investasi dengan detail transaksi yang dapat dibuka-tutup (*expandable*).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: LIMIT & TARGET BUDGET (#budgeting) */}
      {/* ========================================================= */}
      <section id="budgeting" className="py-20 border-t border-border/60">
        <div className="container max-w-7xl px-4 sm:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Smart Budget Limiter</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Kendalikan Gaya Hidup Sebelum Melewati Batas Anggaran
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Tetapkan batas limit pengeluaran bulanan per kategori pos. Sistem akan memantau persentase pemakaian dan memberikan indikator visual yang jelas:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Status Aman (&lt; 80%):</span>
                    <p className="text-muted-foreground mt-0.5">Pemakaian dana masih dalam batas sehat dan terkendali.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Status Peringatan (≥ 80%):</span>
                    <p className="text-muted-foreground mt-0.5">Pengeluaran mendekati limit, waspadai sisa hari dalam bulan berjalan.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/5 flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Status Overbudget (≥ 100%):</span>
                    <p className="text-muted-foreground mt-0.5">Anggaran terlampaui. AI akan memberikan saran penyeimbangan otomatis.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-card border border-border shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="font-bold text-sm">Simulasi Anggaran Bulan Ini</h4>
                  <span className="text-xs text-muted-foreground">3 Kategori Terpantau</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">Kebutuhan Pokok</span>
                      <span className="text-emerald-500 font-bold">55% (Aman)</span>
                    </div>
                    <Progress value={55} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Terpakai: Rp 1.100.000</span>
                      <span>Batas: Rp 2.000.000</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">Transportasi & Bensin</span>
                      <span className="text-amber-500 font-bold">88% (Peringatan)</span>
                    </div>
                    <Progress value={88} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Terpakai: Rp 440.000</span>
                      <span>Batas: Rp 500.000</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">Gaya Hidup & Hiburan</span>
                      <span className="text-rose-500 font-bold">110% (Overbudget)</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Terpakai: Rp 550.000</span>
                      <span>Batas: Rp 500.000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: FITUR LENGKAP (#features) */}
      {/* ========================================================= */}
      <section id="features" className="py-20 border-t border-border/60 bg-muted/20">
        <div className="container max-w-7xl px-4 sm:px-8 mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ekosistem Finansial Terpadu
            </h2>
            <p className="text-sm text-muted-foreground">
              Semua yang Anda butuhkan untuk mencapai kebebasan finansial dalam satu aplikasi modern.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Catat Cepat Multi-Item NLP</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pemrosesan bahasa alami cerdas berbasis Google Gemini untuk mencatat banyak transaksi dalam 1 baris input santai.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Arus Kas Per Tahun, Bulan, & Hari</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Grafik visualisasi tren pemasukan vs pengeluaran dengan filter dropdown tahun dan bulan yang fleksibel.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Kantong Pos Keuangan Dinamis</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pengelompokan cerdas transaksi masuk dan keluar ke dalam kantong pos terpisah untuk evaluasi arus dana yang jernih.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Limit Anggaran Bulanan</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tetapkan batas pengeluaran kategori dengan indikator visual Aman, Peringatan 80%, dan Overbudget 100%.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <PieChart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Donut Chart Distribusi Pengeluaran</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mengetahui persentase alokasi terbesar dari pemakaian uang Anda setiap bulan untuk bahan evaluasi finansial.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Keamanan Data & Privasi</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enkripsi JWT token aman, isolasi data per pengguna, dan arsitektur modern Spring Boot + Next.js.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-20 border-t border-border/60">
        <div className="container max-w-4xl px-4 sm:px-8 mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p className="text-xs text-muted-foreground">Jawaban atas pertanyaan seputar fitur FinancialRecord</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Bagaimana cara kerja fitur Catat Cepat AI (NLP)?',
                a: 'Anda hanya perlu mengetikkan kalimat pengeluaran secara bebas (misal: "beli kopi 25rb, makan siang 20.000, gajian 5jt"). Model AI Google Gemini akan mengekstrak nominal, jenis transaksi, dan mengelompokkan kategorinya secara otomatis.',
              },
              {
                q: 'Apa itu Kantong Pos Keuangan?',
                a: 'Kantong Pos Keuangan adalah metode amplop modern yang mengelompokkan riwayat pemasukan dan pengeluaran Anda ke dalam pos-pos terpisah. Anda bisa melihatnya per bulan, per tahun, atau semua waktu.',
              },
              {
                q: 'Bagaimana sistem Limit Budget bekerja?',
                a: 'Anda dapat menetapkan batas anggaran bulanan untuk kategori tertentu. Jika pemakaian mencapai 80%, sistem akan memberikan status Peringatan (Waspada). Jika melebihi 100%, sistem akan menandai Overbudget dan memberikan rekomendasi penyeimbangan.',
              },
              {
                q: 'Apakah saya bisa melihat grafik arus kas per tahun, bulan, dan hari?',
                a: 'Ya! Di halaman Dashboard tersedia grafik Arus Kas dengan 3 mode pilihan: Per Tahun (tren antar-tahun), Per Bulan (12 bulan di tahun yang dipilih), dan Harian (per tanggal di bulan yang dipilih).',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left font-bold text-xs sm:text-sm flex items-center justify-between hover:text-emerald-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${
                      openFaq === index ? 'rotate-180 text-emerald-500' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="mt-auto border-t border-border/40 py-10 bg-card/40">
        <div className="container max-w-7xl px-4 sm:px-8 mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
              FR
            </div>
            <span className="font-bold text-foreground">FinancialRecord</span>
            <span>— AI Personal Finance Management</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="#nlp-entry" className="hover:text-foreground transition-colors">Catat Cepat</Link>
            <Link href="#kantong-pos" className="hover:text-foreground transition-colors">Kantong Pos</Link>
            <Link href="#budgeting" className="hover:text-foreground transition-colors">Limit Budget</Link>
            <Link href="#features" className="hover:text-foreground transition-colors">Fitur Lengkap</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
