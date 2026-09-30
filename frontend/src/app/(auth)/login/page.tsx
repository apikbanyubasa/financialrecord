'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { WalletCards, AlertCircle, Info, Sparkles } from 'lucide-react';
import { validateEmail, validatePassword, FormErrors } from '@/lib/validation';

function LoginFormContent() {
  const { login, isLoggingIn } = useAuth();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(password, false);
    if (passErr) errs.password = passErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message || 'Email atau password tidak valid';
      setServerError(msg);
      setErrors((prev) => ({ ...prev, password: 'Email atau password salah' }));
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrors({});
    setServerError(null);
  };

  return (
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isExpired && (
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Sesi login Anda telah berakhir atau belum aktif. Silakan masuk kembali.</span>
              </div>
            )}

            {serverError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              error={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              required
            />

            {/* Quick Demo Credentials Assistant */}
            <div className="p-2.5 rounded-xl bg-muted/60 border border-border/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  Akses Cepat (Akun Uji Coba):
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('user@financialrecord.com', 'user123')}
                  className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-background/80 border border-border text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50 transition-all text-center"
                >
                  Demo User
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@financialrecord.com', 'admin123')}
                  className="px-2.5 py-1.5 rounded-lg bg-background hover:bg-background/80 border border-border text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:border-indigo-500/50 transition-all text-center"
                >
                  Super Admin
                </button>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full font-bold" isLoading={isLoggingIn}>
              Masuk Sekarang
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-bold ml-1 hover:underline">
            Daftar Sekarang
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-emerald-950/15">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Memuat halaman...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
