'use client';

import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tags, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TransactionType } from '@/types/category.types';

export default function AdminCategoriesPage() {
  const { categories, isLoading } = useCategories();
  const { createDefaultCategory, isCreatingCategory } = useAdmin();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Tag');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setSuccess('Kategori default sistem berhasil ditambahkan ke seluruh user.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menambahkan kategori');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Tags className="h-5 w-5 text-indigo-400" />
          <span>Master Kategori Sistem</span>
        </h2>
        <p className="text-xs text-slate-400">
          Kelola daftar kategori default global yang tersedia untuk seluruh pengguna
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add New Default Category Form */}
        <div className="lg:col-span-5">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base text-white">Tambah Kategori Global Baru</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Kategori ini akan otomatis muncul pada dropdown seluruh user
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    {success}
                  </div>
                )}

                <Input
                  label="Nama Kategori"
                  type="text"
                  placeholder="contoh: Pajak & Asuransi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Tipe Kategori</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        type === 'EXPENSE'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                      onClick={() => setType('EXPENSE')}
                    >
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      <span>Pengeluaran</span>
                    </button>
                    <button
                      type="button"
                      className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        type === 'INCOME'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                      onClick={() => setType('INCOME')}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Pemasukan</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Warna Hex</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-800 bg-slate-950 p-1 cursor-pointer"
                    />
                  </div>
                  <Input
                    label="Nama Icon (Lucide)"
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full font-bold"
                  isLoading={isCreatingCategory}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Simpan Kategori Sistem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-7">
          <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base text-white">Daftar Kategori Terdaftar</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Total {categories.length} kategori sistem & kustom
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <LoadingSpinner text="Memuat kategori..." className="h-48" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || '#10B981' }} />
                        <span className="font-semibold text-white">{c.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {c.type}
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
