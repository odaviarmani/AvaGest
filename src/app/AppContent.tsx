"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut, Bell, History } from 'lucide-react';

const userThemes: Record<string, { primary: string, primaryForeground: string, ring: string }> = {
    'Davi':    { primary: '221 44% 40%', primaryForeground: '210 20% 98%', ring: '221 44% 40%' }, // Navy Blue
    'Carol':   { primary: '262 52% 47%', primaryForeground: '210 20% 98%', ring: '262 52% 47%' }, // Purple
    'Lorenzo': { primary: '145 63% 49%', primaryForeground: '145 63% 15%', ring: '145 63% 49%' }, // Light Green
    'Thiago':  { primary: '25 95% 53%',  primaryForeground: '0 0% 98%',   ring: '25 95% 53%' }, // Orange
    'Miguel':  { primary: '195 91% 48%', primaryForeground: '210 20% 98%', ring: '195 91% 48%' }, // Cyan Blue
    'Italo':   { primary: '147 65% 31%', primaryForeground: '210 20% 98%', ring: '147 65% 31%' }, // Dark Green
};

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, username, logout } = useAuth();
  const isAuthPage = pathname === '/login';
  const isDavi = username === 'Davi';
  
  const theme = username ? userThemes[username] : null;

  const themeStyle = theme ? {
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
                          <Link href="/chat">Chat</Link>
                      </Button>
                      <Button variant="ghost" asChild>
                          <Link href="/calendar">Calendário</Link>
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
                       {isDavi && (
                         <Button variant="ghost" asChild>
                           <Link href="/activity-log">Log de Atividade</Link>
                         </Button>
                       )}
                      <Button variant="ghost" asChild>
                          <Link href="/notificacoes" className="relative">
                            Notificações
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          </Link>
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
                  src="https://open.spotify.com/embed/playlist/6WtYenVtygxXxYenVtygxXxY9h3LdOav?utm_source=generator&theme=0"
                  width="80%"
                  height="80"
                  allowFullScreen={false}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
              ></iframe>
              </footer>
            </ProtectedRoute>
          )}
        </div>
    </ThemeProvider>
  );
}
