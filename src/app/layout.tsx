import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'KanbanFlow',
  description: 'Organize suas tarefas com um Kanban board interativo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <header className="p-4 border-b shrink-0 flex items-center justify-between">
                <div className="w-10"></div>
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
                        <Link href="/documentation">Documentação</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/apps">Apps</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/rubricas">Rubricas</Link>
                    </Button>
                </nav>
                <ThemeToggle />
            </header>
            <main className="flex-1 flex flex-col">{children}</main>
            <footer className="p-4 border-t shrink-0 flex items-center justify-center">
            <iframe
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/playlist/6WtYenVtygxXxY9h3LdOav?utm_source=generator&theme=0"
                width="80%"
                height="80"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
            </footer>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
