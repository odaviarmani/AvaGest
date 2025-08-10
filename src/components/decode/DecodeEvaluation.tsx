"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download } from 'lucide-react';
import { Evaluation, CRITERIA } from '@/lib/types';
import EvaluationItem from './EvaluationItem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export default function DecodeEvaluation() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedEvaluations = localStorage.getItem('decodeEvaluations');
        if (savedEvaluations) {
            setEvaluations(JSON.parse(savedEvaluations));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('decodeEvaluations', JSON.stringify(evaluations));
        }
    }, [evaluations, isClient]);

    const handleAddItem = () => {
        const newItem: Evaluation = {
            id: crypto.randomUUID(),
            name: `Novo Item ${evaluations.length + 1}`,
            scores: CRITERIA.reduce((acc, criterion) => {
                acc[criterion.key] = 1;
                return acc;
            }, {} as Record<string, number>),
        };
        setEvaluations([...evaluations, newItem]);
    };

    const handleUpdateItem = (updatedItem: Evaluation) => {
        setEvaluations(evaluations.map(item => item.id === updatedItem.id ? updatedItem : item));
    };

    const handleDeleteItem = (itemId: string) => {
        setEvaluations(evaluations.filter(item => item.id !== itemId));
    };
    
    const handleDeleteAll = () => {
        setEvaluations([]);
    }

    const handleDownloadCSV = () => {
        if (evaluations.length === 0) return;

        const headers = ["Item", ...CRITERIA.map(c => c.label), "Pontuação Total"];
        const csvRows = [headers.join(',')];

        evaluations.forEach(evaluation => {
            const scores = CRITERIA.map(c => evaluation.scores[c.key]);
            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            const row = [`"${evaluation.name}"`, ...scores, totalScore];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "decode_evaluations.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Nova Avaliação</CardTitle>
                    <CardDescription>Clique no botão para adicionar um novo item a ser avaliado pelos critérios da temporada.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button onClick={handleAddItem}>
                        <PlusCircle className="mr-2" />
                        Adicionar Item
                    </Button>
                    {isClient && evaluations.length > 0 && (
                        <>
                         <Button variant="destructive" onClick={handleDeleteAll}>
                            <Trash2 className="mr-2" />
                            Limpar Tudo
                        </Button>
                        <Button variant="outline" onClick={handleDownloadCSV}>
                            <Download className="mr-2" />
                            Download CSV
                        </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {isClient && evaluations.length > 0 ? (
                <div className="space-y-4">
                    {evaluations.map(evaluation => (
                        <EvaluationItem
                            key={evaluation.id}
                            evaluation={evaluation}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[40vh]">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Nenhuma avaliação criada
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Comece adicionando um novo item para avaliar.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
