'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse, UserProfile } from '@/types/auth.types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: AuthResponse | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => void;
  setUserState: (user: AuthResponse | null) => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updated: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  logout: () => {},
  setUserState: () => {},
  refreshProfile: async () => {},
  updateProfileState: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentProfile = async () => {
    try {
      const p = await authService.getMe();
      setProfile(p);
      setUser({
        id: p.id,
        email: p.email,
        fullName: p.fullName,
        role: p.role,
        token: '',
      });
      return p;
    } catch {
      setUser(null);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Check session with server via HttpOnly cookie
    fetchCurrentProfile().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const logout = () => {
    setUser(null);
    setProfile(null);
    authService.logout();
  };

  const setUserState = (newUser: AuthResponse | null) => {
    setUser(newUser);
    if (newUser) {
      fetchCurrentProfile();
    }
  };

  const refreshProfile = async () => {
    await fetchCurrentProfile();
  };

  const updateProfileState = (updated: UserProfile) => {
    setProfile(updated);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            fullName: updated.fullName,
            email: updated.email,
          }
        : null
    );
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated,
        isAdmin,
        logout,
        setUserState,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
