
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FlaskConical, BarChart, Copy, GitCompare } from 'lucide-react';
import { RobotTest } from '@/lib/types';
import TestForm from '@/components/tests/TestForm';
import TestCard from '@/components/tests/TestCard';
import TestComparisonDialog from '@/components/tests/TestComparisonDialog';
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
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const savedTests = localStorage.getItem('robotTests');
        if (savedTests) {
            try {
                const parsedTests = JSON.parse(savedTests).map((test: any) => ({
                    ...test,
                    date: test.date ? new Date(test.date) : new Date(),
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

    const groupedItems = useMemo(() => {
        const sortedTests = [...tests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
        return sortedTests.reduce((acc, item) => {
            let category = item.type || 'Sem Categoria';
            const nameLower = item.name.toLowerCase();
    
            if (item.type === 'Robô') {
                if (nameLower.includes('merlin 2.0') && nameLower.includes('genebra 2.0')) {
                    category = 'Merlin 2.0 x Genebra 2.0';
                } else if (nameLower.includes('merlin 3.0') && nameLower.includes('genebra 2.0')) {
                    category = 'Merlin 3.0 x Genebra 2.0';
                } else if (nameLower.includes('merlin 4.0') && nameLower.includes('merlin 3.0')) {
                    category = 'Merlin 4.0 x Merlin 3.0';
                }
            } else if (item.type === 'Anexo') {
                const versionMatch = nameLower.match(/versão\s*(\d+(\.\d+)?)/);
                if (versionMatch) {
                    category = `Anexo Versão ${versionMatch[1]}`;
                }
            }
    
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

    const handleSaveTest = (data: RobotTest) => {
        const isEditing = tests.some(t => t.id === data.id);

        if (isEditing) {
            setTests(prev => prev.map(t => (t.id === data.id ? data : t)));
            toast({ title: "Teste atualizado!", description: `O teste "${data.name}" foi atualizado.` });
        } else {
            setTests(prev => [...prev, data]);
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
    
    const handleDuplicate = (testId: string) => {
        const original = tests.find(t => t.id === testId);
        if (!original) return;
        const newTest: RobotTest = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (Cópia)`,
            date: new Date(),
        };
        setTests(prev => [newTest, ...prev]);
        toast({ title: "Teste duplicado!", description: `Uma cópia de "${original.name}" foi criada.`});
    };

    const handleSelectForComparison = (testId: string, isSelected: boolean) => {
        if (isSelected) {
            if (selectedForComparison.length < 2) {
                setSelectedForComparison(prev => [...prev, testId]);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Limite de seleção atingido',
                    description: 'Você só pode comparar 2 testes por vez.',
                });
                return false; // Prevent checkbox from being checked
            }
        } else {
            setSelectedForComparison(prev => prev.filter(id => id !== testId));
        }
        return true;
    };

    const comparisonTests = useMemo(() => {
        if (selectedForComparison.length !== 2) return null;
        const testA = tests.find(t => t.id === selectedForComparison[0]);
        const testB = tests.find(t => t.id === selectedForComparison[1]);
        if (!testA || !testB) return null;
        return { testA, testB };
    }, [selectedForComparison, tests]);


    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
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
                    {comparisonTests && (
                         <Button onClick={() => setIsComparisonOpen(true)}>
                            <GitCompare className="mr-2"/> Comparar Selecionados
                        </Button>
                    )}
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
                </div>
            </header>

            <div className="space-y-12">
                 {isClient && tests.length > 0 ? (
                    Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                        <div key={category}>
                             <h2 className="text-2xl font-bold tracking-tight mb-4 border-b pb-2">{category}</h2>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                                {items.map(test => (
                                    <TestCard
                                        key={test.id}
                                        test={test}
                                        onEdit={() => handleOpenDialog(test)}
                                        onDelete={() => handleDeleteRequest(test.id)}
                                        onDuplicate={() => handleDuplicate(test.id)}
                                        onSelectForComparison={handleSelectForComparison}
                                        isSelectedForComparison={selectedForComparison.includes(test.id)}
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
            
            {comparisonTests && (
                <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                             <DialogTitle>Comparativo de Testes</DialogTitle>
                             <DialogDescription>Análise comparativa entre os dois testes selecionados.</DialogDescription>
                        </DialogHeader>
                        <TestComparisonDialog testA={comparisonTests.testA} testB={comparisonTests.testB} />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}



    
