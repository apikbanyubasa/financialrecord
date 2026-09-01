'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useBudgets } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { Budget } from '@/types/budget.types';

export function SetBudgetModal({
  isOpen,
  onClose,
  currentPeriod,
  initialBudget,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPeriod: string;
  initialBudget?: Budget | null;
}) {
  const { setBudget, isSetting } = useBudgets(currentPeriod);
  const { categories } = useCategories('EXPENSE');

  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBudget) {
      setCategoryId(initialBudget.categoryId);
      setMonthlyLimit(String(initialBudget.monthlyLimit));
      setError(null);
    } else {
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
      setMonthlyLimit('');
      setError(null);
    }
  }, [initialBudget, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Limit budget bulanan harus lebih dari 0');
      return;
    }
    if (!categoryId) {
      setError('Pilih kategori pengeluaran terlebih dahulu');
      return;
    }

    try {
      await setBudget({
        categoryId,
        monthlyLimit: limit,
        periodMonthYear: currentPeriod,
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menyimpan budget limit');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Limit Budget Kategori' : 'Atur Limit Budget Kategori'}
      description={`Tentukan batas pengeluaran maksimum untuk periode ${currentPeriod}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-foreground block mb-1">Kategori Pengeluaran</label>
          <select
            className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-ring"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!initialBudget}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Batas Maksimum / Limit Bulanan (Rp)"
          type="number"
          placeholder="contoh: 1500000"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          required
        />

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isSetting}>
            {initialBudget ? 'Perbarui Limit' : 'Simpan Limit'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
