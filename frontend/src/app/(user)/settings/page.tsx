'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/formatters';
import { User, Mail, ShieldCheck, Calendar, LogOut, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Pengaturan Akun & Profil</h2>
        <p className="text-xs text-muted-foreground">
          Kelola informasi profil dan preferensi akun Anda
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-base">Informasi Profil Pengguna</CardTitle>
          <CardDescription className="text-xs">Data identitas akun yang terdaftar pada sistem</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-xl font-bold uppercase shadow-lg shadow-emerald-500/25">
              {profile?.fullName ? profile.fullName.substring(0, 2) : 'US'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{profile?.fullName || user?.fullName}</h3>
              <p className="text-xs text-muted-foreground">{profile?.email || user?.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                {profile?.role || user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60 text-xs">
            <div className="p-3 rounded-xl bg-accent/40 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Tanggal Bergabung
              </span>
              <p className="font-semibold text-foreground">{formatDate(profile?.createdAt)}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/40 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Status Keanggotaan
              </span>
              <p className="font-semibold text-emerald-500">Akun Aktif & Terverifikasi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Informasi Aplikasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs space-y-2 text-muted-foreground">
          <p><strong>Platform:</strong> FinancialRecord AI Enterprise v1.0.0</p>
          <p><strong>Backend Engine:</strong> Spring Boot 3.3.x (Java 21, Spring AI Gemini Flash)</p>
          <p><strong>Frontend:</strong> Next.js 14/15 App Router (TypeScript + TailwindCSS + Shadcn UI)</p>
          <p><strong>Database:</strong> PostgreSQL 16 dengan Migrasi Flyway</p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive">Keluar Sesi</CardTitle>
          <CardDescription className="text-xs">
            Mengakhiri sesi autentikasi pada peramban ini
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button variant="destructive" size="sm" onClick={logout} className="space-x-1.5 text-xs font-semibold">
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar dari Akun (Logout)</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
