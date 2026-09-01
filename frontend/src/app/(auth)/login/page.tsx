'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { WalletCards, Lock, Mail, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    try {
      await login({ email, password });
    } catch (err: any) {
      setCustomError(err?.response?.data?.message || 'Email atau password tidak valid');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-emerald-950/15">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <WalletCards className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              FinancialRecord
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs text-muted-foreground">Masuk untuk mengelola pemasukan & perincian pengeluaran Anda</p>
        </div>

        <Card className="border-border/80 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Masuk ke Akun</CardTitle>
            <CardDescription className="text-xs">
              Masukkan email dan password terdaftar Anda
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {customError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  {customError}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="gradient" className="w-full font-bold" isLoading={isLoggingIn}>
                Masuk Sekarang
              </Button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground text-center">
                Akun Demo Cepat (1-Klik):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs space-x-1.5 h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => fillDemoAccount('user@financialrecord.com', 'user123')}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Demo User</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs space-x-1.5 h-8 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  onClick={() => fillDemoAccount('admin@financialrecord.com', 'admin123')}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Super Admin</span>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-bold ml-1 hover:underline">
              Daftar Sekarang
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
