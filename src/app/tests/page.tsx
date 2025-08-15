
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FlaskConical, Trash2 } from 'lucide-react';
import { RobotTest } from '@/lib/types';
import TestForm from '@/components/tests/TestForm';
import TestLog from '@/components/tests/TestLog';
import TestCharts from '@/components/tests/TestCharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function TestsPage() {
    const [tests, setTests] = useState<RobotTest[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const savedTests = localStorage.getItem('robotTests');
        if (savedTests) {
            // Parse dates correctly from strings
            const parsedTests = JSON.parse(savedTests).map((test: RobotTest) => ({
                ...test,
                date: new Date(test.date),
            }));
            setTests(parsedTests);
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

    const handleSaveTest = (data: Omit<RobotTest, 'id' | 'date'>) => {
        const newTest: RobotTest = {
            id: crypto.randomUUID(),
            date: new Date(),
            ...data,
        };
        setTests(prev => [...prev, newTest].sort((a, b) => a.date.getTime() - b.date.getTime()));
        toast({ title: "Teste registrado!", description: `O teste "${data.name}" foi salvo com sucesso.` });
        setIsDialogOpen(false);
    };

    const handleDeleteTest = (testId: string) => {
        setTests(prev => prev.filter(t => t.id !== testId));
        toast({ title: "Teste removido!", variant: 'destructive' });
    };

    const handleClearAll = () => {
        setTests([]);
        toast({ title: "Histórico de testes limpo!", variant: 'destructive' });
    }

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
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2" />
                    Registrar Teste
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <TestCharts tests={tests} />
                </div>
                <div className="lg:col-span-1">
                    <TestLog tests={tests} onDelete={handleDeleteTest} onClearAll={handleClearAll} />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Novo Teste</DialogTitle>
                        <DialogDescription>
                            Adicione os resultados de um novo teste para análise.
                        </DialogDescription>
                    </DialogHeader>
                    <TestForm onSave={handleSaveTest} onCancel={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
