
"use client";

import React, { useState, useEffect, useRef } from 'react';
import html2camera from 'html2canvas';
import { useAuth, ADMIN_USERS } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, History, Trash2, ShieldX, Download } from 'lucide-react';
import { ActivityLog } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function ActivityLogPage() {
    const { username } = useAuth();
    const router = useRouter();
    const [log, setLog] = useState<ActivityLog[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [logToDelete, setLogToDelete] = useState<string | null>(null);
    const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    const isAdmin = username && ADMIN_USERS.includes(username);

    useEffect(() => {
        setIsClient(true);
        if (!isAdmin) {
            router.push('/kanban');
            return;
        }

        try {
            const savedLog = localStorage.getItem('activityLog');
            if (savedLog) {
                setLog(JSON.parse(savedLog));
            }
        } catch (error) {
            console.error("Failed to load activity log:", error);
            toast({
                variant: 'destructive',
                title: "Erro ao carregar o log",
                description: "Não foi possível carregar os dados do log de atividade."
            });
        }
    }, [isAdmin, router, toast]);

    const handleDownloadCroqui = () => {
        if (printRef.current) {
            html2camera(printRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `croqui_log_atividade_${new Date().toISOString()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const updateLog = (newLog: ActivityLog[]) => {
        setLog(newLog);
        try {
            localStorage.setItem('activityLog', JSON.stringify(newLog));
        } catch (error) {
            console.error("Failed to save activity log:", error);
        }
    };

    const handleDelete = (logId: string) => {
        const newLog = log.filter(entry => entry.id !== logId);
        updateLog(newLog);
        setLogToDelete(null);
        toast({ title: "Registro removido!" });
    };
    
    const handleClearAll = () => {
        updateLog([]);
        setIsClearAllDialogOpen(false);
        toast({ title: "Histórico limpo!", description: "Todos os registros foram removidos." });
    };

    if (!isClient || !isAdmin) {
        return (
             <div className="flex flex-1 items-center justify-center p-8">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit mb-4">
                            <ShieldX className="w-8 h-8"/>
                        </div>
                        <CardTitle>Acesso Negado</CardTitle>
                        <CardDescription>Você não tem permissão para visualizar esta página.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="flex-1 p-4 md:p-8">
            <Card ref={printRef}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-6 h-6" />
                                Log de Atividade dos Usuários
                            </CardTitle>
                            <CardDescription>
                                Registros de login e logout da equipe.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             {log.length > 0 && (
                                <Button variant="destructive" onClick={() => setIsClearAllDialogOpen(true)}>
                                    <Trash2 className="mr-2" />
                                    Limpar Histórico
                                </Button>
                            )}
                            <Button onClick={handleDownloadCroqui} variant="outline">
                                <Download className="mr-2" />
                                Download Croqui
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] border rounded-md">
                         {log.length > 0 ? (
                            <div className="p-4 space-y-4">
                                {log.map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {entry.action === 'login' ? (
                                            <LogIn className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <LogOut className="w-5 h-5 text-red-500" />
                                        )}
                                        <div>
                                            <p>
                                                <span className="font-semibold">{entry.username}</span>
                                                {entry.action === 'login' ? ' entrou na conta.' : ' saiu da conta.'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(entry.timestamp), "PPP p", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setLogToDelete(entry.id)}>
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            ))}
                            </div>
                         ) : (
                             <div className="flex flex-1 items-center justify-center h-full">
                                <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold tracking-tight">
                                    Nenhuma atividade registrada
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Os eventos de login e logout aparecerão aqui.
                                </p>
                                </div>
                            </div>
                         )}
                    </ScrollArea>
                </CardContent>
            </Card>

            <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é permanente e não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setLogToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(logToDelete!)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta ação é permanente e não pode ser desfeita. Todos os registros serão removidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAll}>Limpar Tudo</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
