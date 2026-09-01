'use client';

import React, { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { formatIDR } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BudgetProgressBar } from '@/components/user/BudgetProgressBar';
import { SetBudgetModal } from '@/components/user/SetBudgetModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Budget } from '@/types/budget.types';
import { PieChart, Plus, Calendar } from 'lucide-react';

export function BudgetsPage() {
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [period, setPeriod] = useState(currentMonthStr);
  const { budgets, isLoading, deleteBudget } = useBudgets(period);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState<Budget | null>(null);

  const totalLimit = budgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.currentSpent || 0), 0);
  const totalRemaining = totalLimit - totalSpent;
  const overallPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleDelete = async (id: string) => {
    if (confirm('Hapus limit budget untuk kategori ini?')) {
      await deleteBudget(id);
    }
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudgetForEdit(budget);
    setIsSetModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Limit & Target Budget Bulanan</h2>
          <p className="text-xs text-muted-foreground">
            Kendalikan batas pengeluaran per kategori agar tidak melebihi alokasi yang direncanakan
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 border rounded-lg px-2.5 py-1 bg-card text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => {
              setSelectedBudgetForEdit(null);
              setIsSetModalOpen(true);
            }}
            className="space-x-1.5 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Atur Limit Kategori</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Total Limit Anggaran ({period})</span>
            <p className="text-2xl font-black text-foreground mt-1">{formatIDR(totalLimit)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{budgets.length} kategori dibatasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Total Realisasi Pengeluaran</span>
            <p className="text-2xl font-black text-rose-500 mt-1">{formatIDR(totalSpent)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rasio terpakai: <strong>{overallPercentage.toFixed(1)}%</strong>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground font-medium">Sisa Kuota Anggaran</span>
            <p className={`text-2xl font-black mt-1 ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatIDR(totalRemaining)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalRemaining >= 0 ? 'Masih dalam batas aman' : 'Melebihi target anggaran!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress Bars List */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base">Status Pengeluaran per Kategori</CardTitle>
          <CardDescription className="text-xs">
            Pantau kategori yang sudah mendekati atau melebihi batas limit bulanan
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <LoadingSpinner text="Memuat data budget..." className="h-48" />
          ) : budgets.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground space-y-3">
              <PieChart className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-semibold">Belum ada limit budget yang diatur untuk periode {period}.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBudgetForEdit(null);
                  setIsSetModalOpen(true);
                }}
              >
                Atur Limit Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => (
                <BudgetProgressBar
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <SetBudgetModal
        isOpen={isSetModalOpen}
        onClose={() => {
          setIsSetModalOpen(false);
          setSelectedBudgetForEdit(null);
        }}
        currentPeriod={period}
        initialBudget={selectedBudgetForEdit}
      />
    </div>
  );
}

export default BudgetsPage;
