'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { WalletCards } from 'lucide-react';
import { validateFullName, validateEmail, validatePassword, FormErrors } from '@/lib/validation';

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errs: FormErrors = {};

    const nameErr = validateFullName(fullName);
    if (nameErr) errs.fullName = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(password, true);
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
      await register({ fullName: fullName.trim(), email: email.trim(), password });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message || 'Registrasi gagal. Silakan coba lagi.';
      setServerError(msg);

      // Map backend validation errors to fields if available
      const details = err?.response?.data?.error?.details || err?.response?.data?.data;
      if (typeof details === 'object' && details !== null) {
        setErrors((prev) => ({
          ...prev,
          email: details.email,
          password: details.password,
          fullName: details.fullName,
        }));
      }
    }
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
          <h2 className="text-2xl font-bold tracking-tight">Buat Akun Baru</h2>
          <p className="text-xs text-muted-foreground">Mulai langkah cerdas mengelola keuangan Anda hari ini</p>
        </div>

        <Card className="border-border/80 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Daftar Akun Gratis</CardTitle>
            <CardDescription className="text-xs">
              Lengkapi formulir di bawah ini untuk memulai
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {serverError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  {serverError}
                </div>
              )}

              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="Budi Pratama"
                value={fullName}
                error={errors.fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                required
              />

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
                label="Password (min. 8 karakter & kombinasi)"
                type="password"
                placeholder="••••••••"
                value={password}
                error={errors.password}
                helperText="Minimal 8 karakter kombinasi huruf dan angka"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                required
              />

              <Button type="submit" variant="gradient" className="w-full font-bold" isLoading={isRegistering}>
                Daftar & Masuk
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border/50 py-4 text-xs text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-bold ml-1 hover:underline">
              Masuk di sini
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
