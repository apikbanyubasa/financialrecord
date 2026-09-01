'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ShieldAlert, Activity } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default function AdminAuditLogsPage() {
  const mockAuditLogs = [
    {
      id: '1',
      action: 'USER_REGISTERED',
      details: 'Pendaftaran akun baru: user@financialrecord.com',
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      action: 'AI_OCR_SCAN',
      details: 'Ekstraksi struk belanja via Gemini 1.5 Flash (Fore Coffee Rp 52.000)',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '3',
      action: 'ADMIN_LOGIN',
      details: 'Super administrator masuk ke sesi portal',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '4',
      action: 'CATEGORY_CREATED',
      details: 'Penambahan kategori default sistem: Pajak & Asuransi',
      ipAddress: '127.0.0.1',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-indigo-400" />
          <span>Audit Logs & System Activity</span>
        </h2>
        <p className="text-xs text-slate-400">
          Catatan riwayat audit keamanan dan aktivitas sistem penting platform
        </p>
      </div>

      <Card className="bg-slate-900/60 border-slate-800 text-slate-100">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base text-white">Log Jejak Aktivitas Terkini</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Audit trail tersimpan dengan timestamp dan alamat IP pengakses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="uppercase text-[10px] text-slate-400 border-b border-slate-800 bg-slate-950/80">
                <tr>
                  <th className="px-5 py-3.5">Aksi Sistem</th>
                  <th className="px-5 py-3.5">Detail Aktivitas</th>
                  <th className="px-5 py-3.5">Alamat IP</th>
                  <th className="px-5 py-3.5">Waktu Kejadian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{log.details}</td>
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
