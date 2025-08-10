"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for auth state in localStorage on initial load
    const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
    const savedUser = localStorage.getItem('username');
    if (loggedIn && savedUser) {
        setIsAuthenticated(true);
        setUsername(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (user: string, pass: string): boolean => {
    if ((user === 'Davi' && pass === 'jesuscura10') || (user === 'Lorenzo' && pass === '123456')) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', user);
      setIsAuthenticated(true);
      setUsername(user);
      router.push('/kanban');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
    router.push('/login');
  };

  const value = { isAuthenticated, username, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
