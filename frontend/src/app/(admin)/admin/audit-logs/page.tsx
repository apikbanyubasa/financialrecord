'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ShieldAlert, Activity, Sparkles, Wallet, PieChart, Users, Tags, Filter, Search } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface AuditLogEntry {
  id: string;
  action: 'USER_REGISTERED' | 'AI_NLP_PARSED' | 'BUDGET_LIMIT_SET' | 'WALLET_CREATED' | 'CATEGORY_CREATED' | 'ADMIN_LOGIN';
  details: string;
  userEmail: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs: AuditLogEntry[] = [
    {
      id: '1',
      action: 'AI_NLP_PARSED',
      details: 'Ekstraksi 3 item transaksi santai via Google Gemini NLP ("beli kopi 25rb, makan siang 20rb, gajian 5jt")',
      userEmail: 'user@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      action: 'BUDGET_LIMIT_SET',
      details: 'Pengaturan limit anggaran bulanan pos Makanan & Minuman sebesar Rp 1.000.000',
      userEmail: 'user@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: '3',
      action: 'WALLET_CREATED',
      details: 'Pembuatan kantong pos keuangan baru: "Pos Tabungan Masa Depan"',
      userEmail: 'user@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: '4',
      action: 'CATEGORY_CREATED',
      details: 'Penambahan kategori default sistem global: "Pajak & Asuransi"',
      userEmail: 'admin@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: '5',
      action: 'USER_REGISTERED',
      details: 'Pendaftaran akun pengguna baru terverifikasi: user@financialrecord.com (ROLE_USER)',
      userEmail: 'user@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: '6',
      action: 'ADMIN_LOGIN',
      details: 'Super administrator masuk ke sesi Executive Portal',
      userEmail: 'admin@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesSearch =
      !searchQuery.trim() ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'AI_NLP_PARSED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'BUDGET_LIMIT_SET':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'WALLET_CREATED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'CATEGORY_CREATED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'USER_REGISTERED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" />
            <span>Audit Logs & System Activity Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Catatan jejak audit sistem transaksi NLP AI, modifikasi limit budget, pembuatan kantong pos, dan aksi akun pengguna
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas atau user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Action Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Filter:
        </span>
        {[
          { key: 'ALL', label: 'Semua Aksi' },
          { key: 'AI_NLP_PARSED', label: 'Catat Cepat NLP' },
          { key: 'BUDGET_LIMIT_SET', label: 'Limit Budget' },
          { key: 'WALLET_CREATED', label: 'Kantong Pos' },
          { key: 'CATEGORY_CREATED', label: 'Master Kategori' },
          { key: 'USER_REGISTERED', label: 'User Register' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSelectedAction(btn.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedAction === btn.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base text-white">Log Jejak Aktivitas ({filteredLogs.length} Catatan)</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Audit trail sistem tersimpan aman dengan timestamp, email user, dan alamat IP pengakses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="uppercase text-[10px] text-slate-400 border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="px-5 py-3.5">Jenis Aksi</th>
                  <th className="px-5 py-3.5">Detail Aktivitas Finansial</th>
                  <th className="px-5 py-3.5">Akun Pengguna</th>
                  <th className="px-5 py-3.5">Alamat IP</th>
                  <th className="px-5 py-3.5">Waktu Kejadian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-200 font-medium">{log.details}</td>
                    <td className="px-5 py-3.5 text-indigo-400 font-mono text-[11px]">{log.userEmail}</td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono">{log.ipAddress}</td>
                    <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
