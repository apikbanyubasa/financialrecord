'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Users, ShieldCheck, UserCheck, UserX, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { usersData, isUsersLoading, toggleUserStatus, isToggling } = useAdmin({ page, size: 15 });

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'menonaktifkan (suspend)' : 'mengaktifkan kembali';
    if (confirm(`Apakah Anda yakin ingin ${actionText} akun pengguna ini?`)) {
      await toggleUserStatus({ userId, isActive: !currentStatus });
    }
  };

  const usersList = usersData?.content || [];
  const filteredUsers = usersList.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span>Manajemen Pengguna Platform</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola status akun, hak akses role administrator/user, dan pantau pengguna yang terdaftar di platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {isUsersLoading ? (
        <LoadingSpinner text="Memuat daftar pengguna platform..." className="h-64" />
      ) : (
        <div className="space-y-4">
          <UserManagementTable
            users={filteredUsers}
            onToggleStatus={handleToggleStatus}
            isToggling={isToggling}
          />

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>
                Halaman {usersData.number + 1} dari {usersData.totalPages} ({usersData.totalElements} total akun terdaftar)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                  disabled={page >= usersData.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
