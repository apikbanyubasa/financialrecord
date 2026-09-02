'use client';

import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tags, Plus, ArrowDownRight, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import { TransactionType } from '@/types/category.types';

const COLOR_PRESETS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
  '#EF4444', '#06B6D4', '#6366F1', '#14B8A6', '#84CC16',
];

export default function AdminCategoriesPage() {
  const { categories, isLoading } = useCategories();
  const { createDefaultCategory, isCreatingCategory } = useAdmin();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Tag');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) return;

    try {
      await createDefaultCategory({
        name: name.trim(),
        type,
        color,
        icon,
      });

      setName('');
      setSuccess(`Kategori global "${name.trim()}" berhasil ditambahkan dan tersedia untuk seluruh user.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menambahkan kategori');
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Tags className="h-5 w-5 text-indigo-400" />
            <span>Master Kategori Sistem Global</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola daftar kategori template bawaan sistem yang otomatis tersedia pada form transaksi dan kantong pos seluruh pengguna
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add New Default Category Form */}
        <div className="lg:col-span-5">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-400" />
                <span>Tambah Kategori Global Baru</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Kategori ini akan otomatis muncul pada dropdown seluruh user
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Nama Kategori</label>
                  <input
                    type="text"
                    placeholder="contoh: Pajak & Asuransi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Tipe Arus Dana</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        type === 'EXPENSE'
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                      onClick={() => setType('EXPENSE')}
                    >
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      <span>Pengeluaran</span>
                    </button>
                    <button
                      type="button"
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        type === 'INCOME'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                      onClick={() => setType('INCOME')}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Pemasukan</span>
                    </button>
                  </div>
                </div>

                {/* Color presets & Custom */}
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Pilihan Warna Aksen</label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full transition-transform ${
                          color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-8 w-12 rounded-lg border border-slate-800 bg-slate-950 p-1 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{color}</span>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Preview Tampilan User</span>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-xs text-white">{name.trim() || 'Nama Kategori'}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {type === 'INCOME' ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full font-bold text-xs"
                  isLoading={isCreatingCategory}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Simpan Kategori Global
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-7">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base text-white">Daftar Kategori Terdaftar ({filteredCategories.length})</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Kategori aktif yang dapat dipilih pengguna platform
                </CardDescription>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterType('EXPENSE')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterType === 'EXPENSE' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setFilterType('INCOME')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterType === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pemasukan
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {isLoading ? (
                <LoadingSpinner text="Memuat kategori..." className="h-48" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCategories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: c.color || '#10B981' }} />
                        <span className="font-semibold text-white truncate">{c.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          c.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {c.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
