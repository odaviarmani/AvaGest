
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import {
    BookMarked,
    BotMessageSquare,
    FileText,
    FolderKanban,
    GraduationCap,
    Music,
    Palette,
    Sheet,
    Video,
    Youtube,
    Wrench,
    Download
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const apps = [
    { name: "Canva", href: "https://www.canva.com", icon: <Palette className="w-8 h-8" /> },
    { name: "Google Docs", href: "https://docs.google.com", icon: <FileText className="w-8 h-8" /> },
    { name: "Google Drive", href: "https://drive.google.com", icon: <FolderKanban className="w-8 h-8" /> },
    { name: "Google Planilhas", href: "https://sheets.google.com", icon: <Sheet className="w-8 h-8" /> },
    { name: "Google Meet", href: "https://meet.google.com", icon: <Video className="w-8 h-8" /> },
    { name: "Spotify", href: "https://open.spotify.com", icon: <Music className="w-8 h-8" /> },
    { name: "Google Acadêmico", href: "https://scholar.google.com", icon: <GraduationCap className="w-8 h-8" /> },
    { name: "NotebookLM", href: "https://notebooklm.google.com", icon: <BookMarked className="w-8 h-8" /> },
    { name: "WhatsApp", href: "https://web.whatsapp.com", icon: <BotMessageSquare className="w-8 h-8" /> },
    { name: "YouTube", href: "https://www.youtube.com", icon: <Youtube className="w-8 h-8" /> },
    { name: "FLL Tools", href: "https://flltools.flltutorials.com/", icon: <Wrench className="w-8 h-8" /> },
];

export default function AppsPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const handleDownloadCroqui = () => {
        if (printRef.current) {
            html2camera(printRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `croqui_apps_${new Date().toISOString()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Aplicativos Externos</h1>
                    <p className="text-muted-foreground">
                        Acesse rapidamente suas ferramentas e serviços favoritos.
                    </p>
                </div>
                <Button onClick={handleDownloadCroqui} variant="outline">
                    <Download className="mr-2" />
                    Download Croqui
                </Button>
            </header>

            <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {apps.map((app) => (
                    <Link href={app.href} key={app.name} target="_blank" rel="noopener noreferrer" className="no-underline">
                        <Card className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 h-full flex flex-col justify-between">
                            <CardHeader className="flex flex-col items-center text-center gap-4">
                                <div className="text-primary">{app.icon}</div>
                                <CardTitle className="text-lg">{app.name}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
