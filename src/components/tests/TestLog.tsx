
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import { RobotTest } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface TestLogProps {
    tests: RobotTest[];
    onDelete: (testId: string) => void;
    onClearAll: () => void;
}

export default function TestLog({ tests, onDelete, onClearAll }: TestLogProps) {
    const [isClearAllOpen, setIsClearAllOpen] = React.useState(false);
    
    const getTypeBadgeVariant = (type: RobotTest['type']) => {
        switch (type) {
            case 'Anexo': return 'default';
            case 'Programação': return 'secondary';
            case 'Robô': return 'outline';
            default: return 'outline';
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="w-6 h-6"/>
                    Histórico de Testes
                </CardTitle>
                <CardDescription>
                    Lista de todos os testes registrados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    {tests.length > 0 ? (
                        <div className="space-y-3">
                            {tests.map(test => (
                                <div key={test.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate" title={test.name}>{test.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(test.date, 'dd/MM/yy HH:mm', { locale: ptBR })}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                             <Badge variant={getTypeBadgeVariant(test.type)}>{test.type}</Badge>
                                             <Badge variant="outline">{test.successPercentage}%</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => onDelete(test.id)}>
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                            <p>Nenhum teste registrado.</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
             {tests.length > 0 && (
                <CardFooter>
                    <Button variant="destructive" className="w-full" onClick={() => setIsClearAllOpen(true)}>
                        <Trash2 className="mr-2"/> Limpar Histórico
                    </Button>
                </CardFooter>
            )}

            <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Limpar histórico de testes?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta ação não pode ser desfeita. Todos os registros de testes serão removidos permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onClearAll}>Limpar Tudo</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
