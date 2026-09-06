'use client';

import React from 'react';
import { UserProfile } from '@/types/auth.types';
import { formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, UserX, UserCheck, Loader2 } from 'lucide-react';

export function UserManagementTable({
  users,
  onToggleStatus,
  isToggling,
}: {
  users: UserProfile[];
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  isToggling?: boolean;
}) {
  if (!users || users.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Tidak ada data pengguna.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs uppercase text-slate-400 border-b border-slate-800 bg-slate-950/80">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Pengguna</th>
            <th className="px-5 py-3.5 font-semibold">Email</th>
            <th className="px-5 py-3.5 font-semibold">Role</th>
            <th className="px-5 py-3.5 font-semibold">Status Akun</th>
            <th className="px-5 py-3.5 font-semibold">Terdaftar Pada</th>
            <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {users.map((u) => {
            const isUserActive = Boolean(u.isActive ?? u.active ?? false);
            return (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs uppercase">
                      {u.fullName ? u.fullName.substring(0, 2) : 'US'}
                    </div>
                    <span className="font-semibold text-white">{u.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      u.role === 'ROLE_ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    {u.role === 'ROLE_ADMIN' ? 'ADMINISTRATOR' : 'USER'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isUserActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isUserActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  {u.role !== 'ROLE_ADMIN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-7 text-xs border-slate-700 ${
                        isUserActive
                          ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                          : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                      }`}
                      onClick={() => onToggleStatus(u.id, isUserActive)}
                      disabled={isToggling}
                    >
                      {isUserActive ? (
                        <>
                          <UserX className="h-3 w-3 mr-1" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Aktifkan
                        </>
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
