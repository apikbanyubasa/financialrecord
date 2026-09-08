'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    logout,
    setUserState,
    refreshProfile,
    updateProfileState,
  } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (authData) => {
      setUserState(authData);
      queryClient.clear();
      if (authData.role === 'ROLE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (authData) => {
      setUserState(authData);
      queryClient.clear();
      router.push('/dashboard');
    },
  });

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    logout,
    refreshProfile,
    updateProfileState,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  };
}
