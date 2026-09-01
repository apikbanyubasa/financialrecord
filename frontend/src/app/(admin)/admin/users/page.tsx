'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const { usersData, isUsersLoading, toggleUserStatus, isToggling } = useAdmin({ page, size: 15 });

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const actionText = currentStatus ? 'menonaktifkan (suspend)' : 'mengaktifkan kembali';
    if (confirm(`Apakah Anda yakin ingin ${actionText} akun pengguna ini?`)) {
      await toggleUserStatus({ userId, isActive: !currentStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <span>Manajemen Pengguna Platform</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kelola status akun, hak akses role, dan pantau pengguna yang terdaftar
          </p>
        </div>
      </div>

      {isUsersLoading ? (
        <LoadingSpinner text="Memuat daftar pengguna..." className="h-64" />
      ) : (
        <div className="space-y-4">
          <UserManagementTable
            users={usersData?.content || []}
            onToggleStatus={handleToggleStatus}
            isToggling={isToggling}
          />

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>
                Halaman {usersData.number + 1} dari {usersData.totalPages} ({usersData.totalElements} total akun)
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 border-slate-700 bg-slate-950"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 border-slate-700 bg-slate-950"
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
