'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAi } from '@/hooks/useAi';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useWallets } from '@/hooks/useWallets';
import { AiScanReceiptResult } from '@/types/ai.types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { formatIDR } from '@/lib/formatters';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Store,
  Calendar,
  CreditCard,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ReceiptUploadDropzone() {
  const router = useRouter();
  const { scanReceipt, isScanning } = useAi();
  const { createTransaction, isCreating } = useTransactions();
  const { categories } = useCategories('EXPENSE');
  const { wallets } = useWallets();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<AiScanReceiptResult | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setScanResult(null);
        setIsSaved(false);
        setErrorMessage(null);

        try {
          const result = await scanReceipt(file);
          setScanResult(result);

          // Auto-match category
          const matchedCat = categories.find(
            (c) =>
              c.name.toLowerCase() === result.suggestedCategory?.toLowerCase() ||
              result.suggestedCategory?.toLowerCase().includes(c.name.toLowerCase())
          );
          if (matchedCat) {
            setSelectedCategoryId(matchedCat.id);
          } else if (categories.length > 0) {
            setSelectedCategoryId(categories[0].id);
          }

          // Auto-match wallet
          if (wallets.length > 0) {
            setSelectedWalletId(wallets[0].id);
          }
        } catch (err: any) {
          setErrorMessage(err?.response?.data?.message || 'Gagal memproses struk dengan AI.');
        }
      }
    },
    [scanReceipt, categories, wallets]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSaveTransaction = async () => {
    if (!scanResult || !selectedWalletId || !selectedCategoryId) return;

    try {
      await createTransaction({
        walletId: selectedWalletId,
        categoryId: selectedCategoryId,
        amount: scanResult.totalAmount,
        type: 'EXPENSE',
        transactionDate: scanResult.transactionDate || new Date().toISOString(),
        description: `${scanResult.merchant} (${scanResult.items?.length || 0} item)`,
        receiptImageUrl: scanResult.receiptImageUrl,
      });
      setIsSaved(true);
      setTimeout(() => {
        router.push('/transactions');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Gagal menyimpan transaksi.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Upload Dropzone Area */}
      <div className="lg:col-span-6 space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[320px] ${
            isDragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border/80 hover:border-primary/50 bg-card/40'
          }`}
        >
          <input {...getInputProps()} />

          {previewUrl ? (
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="relative max-h-64 overflow-hidden rounded-xl border shadow-md">
                <img src={previewUrl} alt="Preview Struk" className="max-h-64 object-contain" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Klik atau seret gambar lain untuk mengganti
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Upload Struk atau Screenshot</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Format JPG, PNG, atau WebP (maks 10MB). AI akan otomatis membaca nominal, toko, dan tanggal.
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                Pilih File dari Perangkat
              </Button>
            </div>
          )}
        </div>

        {isScanning && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center space-x-3 animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                AI Vision sedang menganalisis struk...
              </p>
              <p className="text-muted-foreground">Mengekstrak merchant, total nominal, dan rincian belanjaan.</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center space-x-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* AI Extraction Preview & Form */}
      <div className="lg:col-span-6">
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-base">Hasil Ekstraksi OCR AI</CardTitle>
              </div>
              {scanResult && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Confidence: {(scanResult.confidenceScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Verifikasi data hasil scan sebelum dimasukkan ke dalam catatan transaksi.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1 space-y-4">
            {scanResult ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-accent/40 space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Store className="h-3.5 w-3.5" /> Merchant / Toko
                    </span>
                    <p className="font-bold text-sm text-foreground">{scanResult.merchant || '-'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CreditCard className="h-3.5 w-3.5" /> Total Nominal
                    </span>
                    <p className="font-black text-base text-emerald-600 dark:text-emerald-400">
                      {formatIDR(scanResult.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                {scanResult.items && scanResult.items.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-foreground">Rincian Item yang Terdeteksi:</span>
                    <div className="max-h-36 overflow-y-auto border rounded-xl divide-y text-xs">
                      {scanResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between p-2 hover:bg-accent/20">
                          <span className="truncate pr-2">{item.name} <strong className="text-muted-foreground">x{item.qty}</strong></span>
                          <span className="font-semibold shrink-0">{formatIDR(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selectors for Saving */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Pilih Dompet</label>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                    >
                      {wallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({formatIDR(w.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">Kategori Pengeluaran</label>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="gradient"
                    className="w-full font-semibold"
                    disabled={isCreating || isSaved}
                    isLoading={isCreating}
                    onClick={handleSaveTransaction}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Tersimpan! Mengalihkan...
                      </>
                    ) : (
                      <>
                        <span>Simpan Transaksi Pengeluaran</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-52 text-center text-xs text-muted-foreground space-y-2">
                <FileText className="h-10 w-10 text-muted-foreground/40" />
                <p>Silakan upload gambar struk di sebelah kiri untuk melihat hasil ekstraksi otomatis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
