
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Image as ImageIcon } from 'lucide-react';
import { RobotTest } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { legoAvatars } from '@/contexts/AuthContext';


interface TestLogProps {
    tests: RobotTest[];
    onDelete: (testId: string) => void;
    onClearAll: () => void;
}

export default function TestLog({ tests, onDelete, onClearAll }: TestLogProps) {
    const [isClearAllOpen, setIsClearAllOpen] = useState(false);
    
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
                            {tests.map(test => {
                                const successPercentage = test.attempts > 0 ? (test.successes / test.attempts) * 100 : 0;
                                return (
                                <div key={test.id} className="flex items-start justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex-1 overflow-hidden space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={legoAvatars[test.testedBy]} />
                                                <AvatarFallback>{test.testedBy.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-sm">{test.testedBy}</span>
                                        </div>
                                        <p className="font-semibold truncate" title={test.name}>{test.name}</p>
                                        <p className="text-sm text-muted-foreground italic">"{test.objective || 'Nenhum objetivo definido.'}"</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(test.date, 'dd/MM/yy HH:mm', { locale: ptBR })}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                             <Badge variant={getTypeBadgeVariant(test.type)}>{test.type}</Badge>
                                             <Badge variant="outline">{successPercentage.toFixed(0)}% de acerto</Badge>
                                             <Badge variant="secondary">{test.successes}/{test.attempts} acertos</Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 ml-2">
                                        {test.imageUrl && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <Image src={test.imageUrl} alt={`Imagem do teste ${test.name}`} width={800} height={600} className="w-full h-auto object-contain rounded-md" />
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(test.id)}>
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive"/>
                                        </Button>
                                    </div>
                                </div>
                            )})}
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
