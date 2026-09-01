'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { AddTransactionModal } from '@/components/user/AddTransactionModal';
import { NlpQuickEntryModal } from '@/components/user/NlpQuickEntryModal';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNlpModalOpen, setIsNlpModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner text="Memeriksa sesi autentikasi..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Fixed Left Sidebar */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="FinancialRecord"
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenNlpModal={() => setIsNlpModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <NlpQuickEntryModal
        isOpen={isNlpModalOpen}
        onClose={() => setIsNlpModalOpen(false)}
      />
    </div>
  );
}
