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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  logout: () => {},
  setUserState: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session with server via HttpOnly cookie
    authService
      .getMe()
      .then((p) => {
        setProfile(p);
        setUser({
          id: p.id,
          email: p.email,
          fullName: p.fullName,
          role: p.role,
          token: '',
        });
      })
      .catch(() => {
        // Not authenticated or session expired
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
