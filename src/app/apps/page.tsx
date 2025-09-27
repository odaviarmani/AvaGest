
"use client";

import React, { useState, useEffect } from 'react';
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
    PlusCircle,
    Trash2,
    SquareArrowOutUpRight
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface App {
    name: string;
    href: string;
    icon: React.ReactNode;
    isCustom?: boolean;
}

const defaultApps: App[] = [
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

const STORAGE_KEY = 'customApps';

export default function AppsPage() {
    const [isClient, setIsClient] = useState(false);
    const [customApps, setCustomApps] = useState<App[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [newAppHref, setNewAppHref] = useState('');
    const { toast } = useToast();
    
    useEffect(() => {
        setIsClient(true);
        try {
            const savedApps = localStorage.getItem(STORAGE_KEY);
            if (savedApps) {
                setCustomApps(JSON.parse(savedApps));
            }
        } catch (error) {
            console.error("Failed to load custom apps from localStorage:", error);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(customApps));
            } catch (error) {
                console.error("Failed to save custom apps to localStorage:", error);
            }
        }
    }, [customApps, isClient]);
    
    const handleAddApp = () => {
        if (!newAppName.trim() || !newAppHref.trim()) {
            toast({
                variant: 'destructive',
                title: "Campos obrigatórios",
                description: "Por favor, preencha o nome e o URL do aplicativo.",
            });
            return;
        }

        const newApp: App = {
            name: newAppName,
            href: newAppHref,
            icon: <SquareArrowOutUpRight className="w-8 h-8" />,
            isCustom: true,
        };

        setCustomApps(prev => [...prev, newApp]);
        setIsDialogOpen(false);
        setNewAppName('');
        setNewAppHref('');
        toast({ title: "Aplicativo adicionado!", description: `"${newAppName}" foi adicionado à sua lista.` });
    };

    const handleDeleteApp = (appName: string) => {
        setCustomApps(prev => prev.filter(app => app.name !== appName));
        toast({ title: "Aplicativo removido!", variant: 'destructive' });
    };

    const allApps = [...defaultApps, ...customApps];

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Aplicativos Externos</h1>
                    <p className="text-muted-foreground">
                        Acesse rapidamente suas ferramentas e serviços favoritos.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Adicionar App
                </Button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {isClient && allApps.map((app) => (
                    <div key={app.name} className="relative group">
                        <Link href={app.href} target="_blank" rel="noopener noreferrer" className="no-underline">
                            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 h-full flex flex-col justify-between">
                                <CardHeader className="flex flex-col items-center text-center gap-4">
                                    <div className="text-primary">{app.icon}</div>
                                    <CardTitle className="text-lg">{app.name}</CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                        {app.isCustom && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteApp(app.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Aplicativo</DialogTitle>
                        <DialogDescription>Crie um atalho para um site ou ferramenta externa.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="app-name">Nome do Aplicativo</Label>
                            <Input id="app-name" value={newAppName} onChange={e => setNewAppName(e.target.value)} placeholder="Ex: Figma" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="app-href">URL (Link)</Label>
                            <Input id="app-href" value={newAppHref} onChange={e => setNewAppHref(e.target.value)} placeholder="https://www.figma.com" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddApp}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
