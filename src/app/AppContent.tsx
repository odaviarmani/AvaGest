
"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, ADMIN_USERS } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Bell, History, DatabaseBackup, Archive } from 'lucide-react';
import FriendlyBot from '@/components/helper/FriendlyBot';

const userThemes: Record<string, { primary: string, primaryForeground: string, ring: string }> = {
    'Davi':      { primary: '221 44% 40%', primaryForeground: '210 20% 98%', ring: '221 44% 40%' }, // Navy Blue
    'Carol':     { primary: '262 52% 47%', primaryForeground: '210 20% 98%', ring: '262 52% 47%' }, // Purple
    'Lorenzo':   { primary: '145 63% 49%', primaryForeground: '145 63% 15%', ring: '145 63% 49%' }, // Light Green
    'Thiago':    { primary: '25 95% 53%',  primaryForeground: '0 0% 98%',   ring: '25 95% 53%' }, // Orange
    'Miguel':    { primary: '195 91% 48%', primaryForeground: '210 20% 98%', ring: '195 91% 48%' }, // Cyan Blue
    'Italo':     { primary: '147 65% 31%', primaryForeground: '210 20% 98%', ring: '147 65% 31%' }, // Dark Green
    'Leandro':   { primary: '215 80% 55%', primaryForeground: '210 20% 98%', ring: '215 80% 55%' }, // Royal Blue
    'Valquíria': { primary: '320 70% 50%', primaryForeground: '210 20% 98%', ring: '320 70% 50%' }, // Hot Pink
    'Sthefany':  { primary: '50 90% 50%',  primaryForeground: '50 90% 10%',  ring: '50 90% 50%' }, // Gold
    'Avalon':    { primary: '0 0% 0%',  primaryForeground: '0 0% 98%',  ring: '0 0% 0%' }, // Black
};

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, username, logout } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAuthPage = pathname === '/login';
  
  const theme = username && userThemes[username] ? userThemes[username] : null;

  const themeStyle = isClient && theme ? {
      '--primary': theme.primary,
      '--primary-foreground': theme.primaryForeground,
      '--ring': theme.ring,
  } as React.CSSProperties : {};

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        <div style={themeStyle} className="flex flex-col min-h-screen">
          {isAuthPage ? (
            children
          ) : (
            <ProtectedRoute>
              <header className="p-4 border-b shrink-0 flex items-center justify-between">
                  <div />
                  <nav className="flex items-center gap-1 flex-wrap justify-center">
                      <Button variant="ghost" asChild>
                          <Link href="/kanban">Kanban</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/calendar">Calendário</Link>
                      </Button>
                       <Button variant="ghost" asChild>
                          <Link href="/missions">Missões</Link>
                      </Button>
                       <Button variant="ghost" asChild>
                          <Link href="/tests">Testes</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/roulette">Roletas (Revezamento)</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/decode">Decode</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/core-values">Core Values</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/rounds">Rounds</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/strategy">Estratégia</Link>
                      </Button>
                       <Button variant="ghost" asChild>
                          <Link href="/attachments">Anexos</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/apps">Apps</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/rubricas">Rubricas</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/notificacoes" className="relative">
                            Notificações
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/backup">Backup</Link>
                      </Button>
                  </nav>
                  <div className="flex items-center gap-4">
                    {isAuthenticated && (
                      <Button variant="ghost" size="icon" onClick={logout} title="Sair">
                        <LogOut className="h-5 w-5" />
                      </Button>
                    )}
                    <ThemeToggle />
                  </div>
              </header>
              <main className="flex-1 flex flex-col">{children}</main>
              <footer className="p-4 border-t shrink-0 flex items-center justify-center">
              <iframe
                  style={{ borderRadius: '12px' }}
                  src="https://open.spotify.com/embed/station/playlist/37i9dQZF1DXcBWXoPEoRv3?utm_source=generator&theme=0"
                  width="80%"
                  height="80"
                  allowFullScreen={false}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
              ></iframe>
              </footer>
            </ProtectedRoute>
          )}
          {isClient && <FriendlyBot />}
        </div>
    </ThemeProvider>
  );
}
