/**
 * Client-side validation utilities for instant form feedback.
 * Adheres to enterprise security & UX standards.
 */

export interface FormErrors {
  [field: string]: string | undefined;
}

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email wajib diisi';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Format email tidak valid (contoh: nama@domain.com)';
  }
  return null;
}

export function validatePassword(password: string, isRegistration = false): string | null {
  if (!password) {
    return 'Password wajib diisi';
  }
  if (isRegistration) {
    if (password.length < 8) {
      return 'Password minimal 8 karakter';
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return 'Password harus mengandung kombinasi huruf dan angka';
    }
  }
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Nama lengkap wajib diisi';
  }
  if (name.trim().length < 2) {
    return 'Nama minimal 2 karakter';
  }
  if (name.trim().length > 100) {
    return 'Nama maksimal 100 karakter';
  }
  return null;
}

export function validatePositiveAmount(amount: string | number, fieldName = 'Nominal'): string | null {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} harus berupa angka lebih dari 0`;
  }
  return null;
}
