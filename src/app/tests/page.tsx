
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { PlusCircle, FlaskConical, BarChart, Download } from 'lucide-react';
import { RobotTest } from '@/lib/types';
import TestForm from '@/components/tests/TestForm';
import TestCard from '@/components/tests/TestCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';

export default function TestsPage() {
    const [tests, setTests] = useState<RobotTest[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTest, setEditingTest] = useState<RobotTest | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        const savedTests = localStorage.getItem('robotTests');
        if (savedTests) {
            try {
                // Ensure date objects are correctly parsed
                const parsedTests = JSON.parse(savedTests).map((test: any) => ({
                    ...test,
                    date: new Date(test.date),
                }));
                setTests(parsedTests);
            } catch (error) {
                console.error("Failed to parse tests from localStorage:", error);
                setTests([]);
            }
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('robotTests', JSON.stringify(tests));
            } catch (error) {
                console.error("Failed to save tests to localStorage:", error);
            }
        }
    }, [tests, isClient]);

    const handleDownloadCroqui = () => {
        if (printRef.current) {
            html2canvas(printRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `croqui_testes_${new Date().toISOString()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const groupedItems = useMemo(() => {
        return tests.reduce((acc, item) => {
            const category = item.type || 'Sem Categoria';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, RobotTest[]>);
    }, [tests]);

    const handleOpenDialog = (test: RobotTest | null) => {
        setEditingTest(test);
        setIsDialogOpen(true);
    };

     const handleCloseDialog = () => {
        setEditingTest(null);
        setIsDialogOpen(false);
    };

    const handleSaveTest = (data: Omit<RobotTest, 'id' | 'date'>) => {
        if (editingTest) {
            const testWithDate = { ...data, id: editingTest.id, date: editingTest.date };
            setTests(prev => prev.map(t => (t.id === testWithDate.id ? testWithDate : t)));
            toast({ title: "Teste atualizado!", description: `O teste "${data.name}" foi atualizado.` });
        } else {
            const newTest = { ...data, id: crypto.randomUUID(), date: new Date() };
            setTests(prev => [newTest, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            toast({ title: "Teste registrado!", description: `O teste "${data.name}" foi salvo.` });
        }
        handleCloseDialog();
    };

    const handleDeleteRequest = (testId: string) => {
        setTestToDelete(testId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (testToDelete) {
            const testName = tests.find(t => t.id === testToDelete)?.name;
            setTests(prev => prev.filter(t => t.id !== testToDelete));
            toast({ title: "Teste removido!", description: `O teste "${testName}" foi excluído.`, variant: 'destructive' });
            setTestToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <FlaskConical className="w-8 h-8 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold">Testes de Robô e Programação</h1>
                        <p className="text-muted-foreground">
                            Cadastre e analise a consistência dos testes da equipe.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2" />
                        Registrar Teste
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/tests/stats">
                            <BarChart className="mr-2"/>
                            Ver Estatísticas
                        </Link>
                    </Button>
                    <Button onClick={handleDownloadCroqui} variant="outline">
                        <Download className="mr-2" />
                        Download Croqui
                    </Button>
                </div>
            </header>

            <div ref={printRef} className="space-y-12">
                 {isClient && tests.length > 0 ? (
                    Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                        <div key={category}>
                             <h2 className="text-2xl font-bold tracking-tight mb-4 border-b pb-2">{category}</h2>
                             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 items-start">
                                {items.map(test => (
                                    <TestCard
                                        key={test.id}
                                        test={test}
                                        onEdit={() => handleOpenDialog(test)}
                                        onDelete={() => handleDeleteRequest(test.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                Nenhum teste encontrado
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Comece registrando testes para vê-los aqui.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingTest ? 'Editar Teste' : 'Registrar Novo Teste'}</DialogTitle>
                        <DialogDescription>
                            Adicione os resultados de um novo teste para análise.
                        </DialogDescription>
                    </DialogHeader>
                    <TestForm 
                        onSave={handleSaveTest} 
                        onCancel={handleCloseDialog}
                        existingTest={editingTest}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro do teste.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
