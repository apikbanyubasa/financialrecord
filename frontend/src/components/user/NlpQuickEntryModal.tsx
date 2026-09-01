'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useAi } from '@/hooks/useAi';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useWallets } from '@/hooks/useWallets';
import { TransactionRequest } from '@/types/transaction.types';
import { Sparkles, ArrowRight, CheckCircle2, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { formatIDR } from '@/lib/formatters';

export function NlpQuickEntryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { parseNlpBatch, isParsingNlpBatch } = useAi();
  const { createTransactionsBatch, isCreatingBatch } = useTransactions();
  const { categories } = useCategories();
  const { wallets } = useWallets();

  const [text, setText] = useState('');
  const [parsedItems, setParsedItems] = useState<TransactionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setParsedItems([]);

    try {
      const results = await parseNlpBatch(text.trim());
      // Default category and wallet resolution
      const sanitized = results.map((item) => {
        let catId = item.categoryId;
        if (!catId && categories.length > 0) {
          const matchCat = categories.find((c) => c.type === item.type) || categories[0];
          catId = matchCat.id;
        }
        let walId = item.walletId || (wallets.length > 0 ? wallets[0].id : undefined);

        return {
          ...item,
          categoryId: catId,
          walletId: walId,
        };
      });

      setParsedItems(sanitized);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memproses teks dengan AI.');
    }
  };

  const handleItemChange = (index: number, field: keyof TransactionRequest, value: any) => {
    setParsedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleType = (index: number) => {
    setParsedItems((prev) => {
      const updated = [...prev];
      const newType = updated[index].type === 'EXPENSE' ? 'INCOME' : 'EXPENSE';
      const relevantCat = categories.find((c) => c.type === newType) || categories[0];
      updated[index] = {
        ...updated[index],
        type: newType,
        categoryId: relevantCat ? relevantCat.id : updated[index].categoryId,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (parsedItems.length === 0) return;
    setError(null);

    // Validate that every item has valid amount
    for (const item of parsedItems) {
      if (!item.amount || item.amount <= 0) {
        setError(`Nominal untuk '${item.description}' harus lebih dari 0`);
        return;
      }
    }

    try {
      await createTransactionsBatch(parsedItems);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setParsedItems([]);
        setText('');
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan transaksi.');
    }
  };

  const totalExpense = parsedItems
    .filter((i) => i.type === 'EXPENSE')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalIncome = parsedItems
    .filter((i) => i.type === 'INCOME')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Cepat Pemasukan & Pengeluaran AI"
      description="Ketik aktivitas keuangan Anda secara bebas. AI akan langsung membedah dan mengelompokkan pos pemasukan serta rincian pengeluaran secara cerdas."
    >
      <div className="space-y-4 max-h-[80vh] flex flex-col">
        <form onSubmit={handleParse} className="space-y-3">
          <div>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              placeholder="Contoh ketik bebas:
beli nasi uduk 10.000
beli minum 5.000
dapat gajian 1.000.000"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground">
              Otomatis dipilah ke Pos Pemasukan / Pengeluaran ✨
            </span>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              isLoading={isParsingNlpBatch}
              disabled={!text.trim()}
              className="space-x-1.5 font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              <span>Proses dengan AI</span>
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        {/* Parsed Result List */}
        {parsedItems.length > 0 && (
          <div className="space-y-3 pt-2 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Terdeteksi {parsedItems.length} Rincian Transaksi:
              </span>
              <div className="flex items-center space-x-2 text-[11px]">
                {totalExpense > 0 && (
                  <span className="font-bold text-rose-500">Keluar: {formatIDR(totalExpense)}</span>
                )}
                {totalIncome > 0 && (
                  <span className="font-bold text-emerald-500">Masuk: {formatIDR(totalIncome)}</span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {parsedItems.map((item, idx) => {
                const isIncome = item.type === 'INCOME';
                const relevantCategories = categories.filter((c) => c.type === item.type);

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border bg-card/90 shadow-sm border-border/80 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleType(idx)}
                          className={`font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                          title="Klik untuk ubah jenis"
                        >
                          {isIncome ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}</span>
                        </button>

                        <input
                          type="text"
                          className="font-bold text-foreground bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none text-xs px-1"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`font-black text-sm ${isIncome ? 'text-emerald-500' : 'text-foreground'}`}>
                          {formatIDR(item.amount)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-0.5 font-medium">
                        Pengelompokan Pos Kategori ({isIncome ? 'Pemasukan' : 'Pengeluaran'}):
                      </label>
                      <select
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary font-medium"
                        value={item.categoryId || (relevantCategories[0]?.id || '')}
                        onChange={(e) => handleItemChange(idx, 'categoryId', e.target.value)}
                      >
                        {relevantCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="default"
              size="sm"
              className="w-full font-bold h-10 shadow-md shadow-primary/20 mt-3"
              disabled={isCreatingBatch || isSaved || parsedItems.length === 0}
              isLoading={isCreatingBatch}
              onClick={handleSaveAll}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Semua Berhasil Disimpan!
                </>
              ) : (
                <>
                  <span>Simpan Semua ({parsedItems.length} Transaksi)</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
