'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { formatJoinedDate } from '@/lib/formatters';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Info,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  SlidersHorizontal,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Server,
  Database,
  Cpu,
  Save,
  Check,
} from 'lucide-react';

type SettingsTab = 'PROFILE' | 'SECURITY' | 'SYSTEM' | 'DANGER';

export default function SettingsPage() {
  const { user, profile, logout, updateProfileState, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');

  // --- Profile Form State ---
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // --- Password Form State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);



  // --- Danger Zone Modals ---
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isResettingData, setIsResettingData] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Initialize form fields when profile or user changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
    } else if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [profile, user]);



  // Compute initials accurately (e.g. "Apik Banyubasa" -> "AB", "User" -> "US")
  const getUserInitials = (name?: string) => {
    if (!name) return 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = profile?.fullName || user?.fullName || 'Pengguna';
  const displayEmail = profile?.email || user?.email || '-';
  const displayRole = profile?.role || user?.role || 'ROLE_USER';
  const displayInitials = getUserInitials(displayName);
  const joinedDate = profile?.createdAt || (user as any)?.createdAt;

  // Check if profile form is dirty
  const isProfileDirty =
    (fullName.trim() !== (profile?.fullName || user?.fullName || '')) ||
    (email.trim().toLowerCase() !== (profile?.email || user?.email || '').toLowerCase());

  // --- Handlers ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (!fullName.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setProfileErrorMsg('Alamat email tidak valid');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updated = await profileService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      });
      updateProfileState(updated);
      setProfileSuccessMsg('Profil dan data akun berhasil diperbarui!');
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    } catch (err: any) {
      setProfileErrorMsg(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Gagal memperbarui profil. Pastikan email belum digunakan oleh akun lain.'
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg('Masukkan password saat ini');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErrorMsg('Password baru minimal harus 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi password baru tidak cocok');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordErrorMsg('Password baru tidak boleh sama dengan password saat ini');
      return;
    }

    setIsChangingPassword(true);
    try {
      await profileService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccessMsg('Kata sandi berhasil diperbarui! Silakan gunakan password baru ini pada login berikutnya.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 6000);
    } catch (err: any) {
      setPasswordErrorMsg(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Gagal mengubah password. Pastikan password saat ini yang Anda masukkan benar.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };


  const handleResetUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    if (!resetPassword) {
      setResetErrorMsg('Masukkan password akun Anda untuk konfirmasi');
      return;
    }

    setIsResettingData(true);
    try {
      await profileService.resetUserData(resetPassword);
      setResetPassword('');
      setIsResetModalOpen(false);
      setResetSuccessMsg('Seluruh riwayat transaksi telah dibersihkan dan saldo pos direset ke Rp 0.');
      setTimeout(() => setResetSuccessMsg(null), 7000);
    } catch (err: any) {
      setResetErrorMsg(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Password konfirmasi salah. Gagal mereset data.'
      );
    } finally {
      setIsResettingData(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteErrorMsg(null);

    if (!deletePassword) {
      setDeleteErrorMsg('Masukkan password akun Anda');
      return;
    }
    if (deletePhrase.trim().toUpperCase() !== 'HAPUS AKUN SAYA') {
      setDeleteErrorMsg('Ketik persis frase "HAPUS AKUN SAYA" untuk mengonfirmasi');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await profileService.deleteAccount({
        password: deletePassword,
        confirmationPhrase: deletePhrase.trim(),
      });
      setIsDeleteModalOpen(false);
      alert('Akun Anda telah dinonaktifkan. Terima kasih telah menggunakan FinancialRecord.');
      logout();
    } catch (err: any) {
      setDeleteErrorMsg(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Gagal menghapus akun. Pastikan password yang Anda masukkan benar.'
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card to-emerald-950/15 border border-border/80 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
            <span>Pengaturan Akun & Profil</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola identitas profil pengguna, kredensial keamanan, preferensi aplikasi, dan tata kelola akun Anda
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Akun Aktif & Terverifikasi
          </span>
        </div>
      </div>

      {/* Global Profile Identity Overview Card */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center text-xl sm:text-2xl font-black uppercase shadow-lg shadow-emerald-500/20 border-2 border-emerald-400/30">
                  {displayInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-card shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
                    {displayName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                    {displayRole === 'ROLE_ADMIN' ? 'Administrator' : 'Standard User'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {displayEmail}
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-emerald-500" /> Bergabung: {formatJoinedDate(joinedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Pill */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive space-x-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <div className="flex items-center overflow-x-auto p-1.5 rounded-2xl bg-muted/70 border border-border/60 gap-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'PROFILE'
              ? 'bg-background text-primary shadow-sm border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profil Pengguna</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'SECURITY'
              ? 'bg-background text-primary shadow-sm border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Keamanan & Password</span>
        </button>


        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'SYSTEM'
              ? 'bg-background text-primary shadow-sm border border-primary/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Info Sistem</span>
        </button>

        <button
          onClick={() => setActiveTab('DANGER')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'DANGER'
              ? 'bg-destructive/10 text-destructive shadow-sm border border-destructive/30'
              : 'text-muted-foreground hover:text-destructive'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Zona Bahaya</span>
        </button>
      </div>

      {/* Global Success / Reset Notifications */}
      {resetSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PROFIL PENGGUNA (EDIT PROFILE CRUD)                               */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Informasi Data Pribadi</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbarui identitas nama lengkap dan email akun terdaftar Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-2xl">
              {profileSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Apik Banyubasa"
                    required
                    className="h-10"
                    helperText="Nama ini akan ditampilkan pada greeting dashboard, riwayat transaksi, dan laporan."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    Alamat Email Terdaftar <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="h-10"
                    helperText="Digunakan untuk otentikasi login masuk ke dalam aplikasi."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-accent/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Tanggal Registrasi
                    </span>
                    <p className="font-bold text-xs text-foreground">{formatJoinedDate(joinedDate)}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-accent/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Hak Akses Akun
                    </span>
                    <p className="font-bold text-xs text-foreground uppercase">{displayRole}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-border/60">
                <Button
                  type="submit"
                  variant="gradient"
                  isLoading={isUpdatingProfile}
                  disabled={!isProfileDirty || isUpdatingProfile}
                  className="px-6 font-bold text-xs space-x-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Perubahan Profil</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KEAMANAN & UBAH PASSWORD                                          */}
      {/* ========================================================================= */}
      {activeTab === 'SECURITY' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Keamanan Kredensial & Ubah Kata Sandi</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Tingkatkan keamanan akun Anda dengan memperbarui kata sandi secara berkala (standar BCrypt 12 rounds)
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-5 max-w-2xl">
              {passwordSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Password Saat Ini <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    required
                    className="pr-10 h-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Password Baru <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                    className="pr-10 h-10"
                    helperText="Gunakan kombinasi huruf besar, angka, dan simbol untuk keamanan maksimal."
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">
                  Konfirmasi Password Baru <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                    className="pr-10 h-10"
                    error={
                      confirmPassword && newPassword !== confirmPassword
                        ? 'Konfirmasi password tidak cocok'
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end border-t border-border/60">
                <Button
                  type="submit"
                  variant="gradient"
                  isLoading={isChangingPassword}
                  disabled={
                    isChangingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    newPassword.length < 8 ||
                    newPassword !== confirmPassword
                  }
                  className="px-6 font-bold text-xs space-x-2"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Perbarui Kata Sandi</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}



      {/* ========================================================================= */}
      {/* TAB 4: INFORMASI SISTEM & ENGINE                                         */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM' && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <span>Arsitektur & Spesifikasi Platform</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Status spesifikasi infrastruktur server dan teknologi yang memberdayakan FinancialRecord
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                  <Server className="h-4 w-4" />
                  <span>Backend Core Engine</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Spring Boot 3.3.x</p>
                <p className="text-xs text-muted-foreground">
                  Dijalankan pada Java 21 LTS dengan Spring Security Zero-Trust HttpOnly Cookie Authentication dan Rate Limiting Bucket4j.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-500 font-bold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Engine NLP</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Google Gemini 1.5 Flash</p>
                <p className="text-xs text-muted-foreground">
                  Ekstraksi transaksi otomatis multi-item natural language parsing dengan schema JSON terstruktur dan tracking biaya token.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2 text-blue-500 font-bold text-xs">
                  <Database className="h-4 w-4" />
                  <span>Database Layer</span>
                </div>
                <p className="text-sm font-semibold text-foreground">PostgreSQL 16</p>
                <p className="text-xs text-muted-foreground">
                  Didukung migrasi versi Flyway, Soft Delete Pattern, Composite B-Tree Indexing, dan integritas transaksi ACID.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-1.5 shadow-sm">
                <div className="flex items-center space-x-2 text-purple-500 font-bold text-xs">
                  <Cpu className="h-4 w-4" />
                  <span>Frontend Architecture</span>
                </div>
                <p className="text-sm font-semibold text-foreground">Next.js 14/15 App Router</p>
                <p className="text-xs text-muted-foreground">
                  TypeScript, TailwindCSS, TanStack React Query, dan Recharts visualizer responsif.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ZONA BAHAYA (DANGER ZONE)                                         */}
      {/* ========================================================================= */}
      {activeTab === 'DANGER' && (
        <div className="space-y-6">
          {/* Card 1: Reset Transaction Data */}
          <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Seluruh Riwayat Transaksi</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Hapus seluruh catatan transaksi dan kembalikan saldo dompet/pos Anda ke Rp 0 untuk memulai pembukuan baru
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResetErrorMsg(null);
                    setResetPassword('');
                    setIsResetModalOpen(true);
                  }}
                  className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold"
                >
                  Reset Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 text-xs text-muted-foreground">
              Tindakan ini akan mengarsipkan (soft-delete) seluruh transaksi Anda sebelumnya. Akun dan daftar kantong pos Anda tetap utuh.
            </CardContent>
          </Card>

          {/* Card 2: Deactivate / Delete Account */}
          <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-destructive/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus / Nonaktifkan Akun Pengguna</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Nonaktifkan akun Anda secara permanen dari seluruh platform FinancialRecord
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteErrorMsg(null);
                    setDeletePassword('');
                    setDeletePhrase('');
                    setIsDeleteModalOpen(true);
                  }}
                  className="text-xs font-bold"
                >
                  Hapus Akun
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 text-xs text-muted-foreground">
              Setelah dinonaktifkan, Anda tidak dapat login lagi menggunakan akun ini. Seluruh sesi login akan diakhiri seketika.
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: KONFIRMASI RESET DATA TRANSAKSI                                  */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Konfirmasi Reset Riwayat Transaksi"
        description="Tindakan ini akan menghapus seluruh rekaman transaksi Anda dan mengembalikan saldo kantong ke Rp 0."
      >
        <form onSubmit={handleResetUserData} className="space-y-4">
          {resetErrorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{resetErrorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Masukkan Password Akun Anda untuk Konfirmasi
            </label>
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Password akun Anda"
              required
              className="h-10"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isResettingData}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              isLoading={isResettingData}
              disabled={!resetPassword || isResettingData}
            >
              Ya, Reset Seluruh Data
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: KONFIRMASI HAPUS / NONAKTIFKAN AKUN                              */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Penonaktifan Akun"
        description="Perhatian: Tindakan ini akan menonaktifkan akun Anda secara permanen. Anda akan langsung dikeluarkan dari sistem."
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          {deleteErrorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{deleteErrorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              1. Masukkan Password Akun Anda
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Password akun"
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              2. Ketik <span className="text-destructive font-mono font-bold select-all">HAPUS AKUN SAYA</span> di bawah ini:
            </label>
            <Input
              type="text"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              placeholder="HAPUS AKUN SAYA"
              required
              className="h-10"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeletingAccount}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              isLoading={isDeletingAccount}
              disabled={
                !deletePassword ||
                deletePhrase.trim().toUpperCase() !== 'HAPUS AKUN SAYA' ||
                isDeletingAccount
              }
            >
              Hapus Akun Permanen
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
