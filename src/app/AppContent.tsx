"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const isAuthPage = pathname === '/login';

  return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
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
                      <Link href="/notificacoes">Notificações</Link>
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
    </ThemeProvider>
  );
}
