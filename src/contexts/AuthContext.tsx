"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityLog } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validUsers: Record<string, string> = {
    "Davi": "jesuscura10",
    "Carol": "SAAVPCSPFC",
    "Lorenzo": "123456",
    "Thiago": "123456",
    "Miguel": "123456",
    "Italo": "123456",
    "Leandro": "123456",
    "Valquíria": "123456",
    "Sthefany": "123456",
}

export const USERS = Object.keys(validUsers);
export const ADMIN_USERS = ["Davi", "Leandro", "Valquíria", "Sthefany"];

const addActivityLog = (username: string, action: 'login' | 'logout') => {
    const newLog: ActivityLog = {
        id: crypto.randomUUID(),
        username,
        action,
        timestamp: new Date().toISOString(),
    };
    try {
        const existingLogsRaw = localStorage.getItem('activityLog');
        const existingLogs: ActivityLog[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
        localStorage.setItem('activityLog', JSON.stringify([newLog, ...existingLogs]));
    } catch (error) {
        console.error("Failed to save activity log:", error);
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for auth state in localStorage on initial load
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser && validUsers[loggedInUser]) {
        setIsAuthenticated(true);
        setUsername(loggedInUser);
    }
    setLoading(false);
  }, []);

  const login = (user: string, pass: string): boolean => {
    if (validUsers[user] && validUsers[user] === pass) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', user);
      setIsAuthenticated(true);
      setUsername(user);
      addActivityLog(user, 'login');
      router.push('/kanban');
      return true;
    }
    return false;
  };

  const logout = () => {
    const currentUser = localStorage.getItem('username');
    if(currentUser) {
        addActivityLog(currentUser, 'logout');
    }
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
