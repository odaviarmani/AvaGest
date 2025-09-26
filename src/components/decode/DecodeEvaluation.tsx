
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download, Search, PinOff, Pin } from 'lucide-react';
import { Evaluation, CRITERIA } from '@/lib/types';
import EvaluationItem from './EvaluationItem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

export default function DecodeEvaluation() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

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
            isPinned: false,
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

        const headers = ["Item", ...CRITERIA.map(c => c.label), "Pontuação Total", "Fixado"];
        const csvRows = [headers.join(',')];

        evaluations.forEach(evaluation => {
            const scores = CRITERIA.map(c => evaluation.scores[c.key]);
            const totalScore = scores.reduce((sum, score) => sum + score, 0);
            const row = [`"${evaluation.name}"`, ...scores, totalScore, evaluation.isPinned ? 'Sim' : 'Nao'];
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

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(evaluations);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEvaluations(items);
    };

    const handleTogglePin = (itemId: string) => {
        const itemToPin = evaluations.find(item => item.id === itemId);
        if (!itemToPin) return;

        const pinnedCount = evaluations.filter(item => item.isPinned).length;

        if (!itemToPin.isPinned && pinnedCount >= 3) {
            toast({
                variant: 'destructive',
                title: 'Limite de itens fixados atingido',
                description: 'Você só pode fixar até 3 itens.',
            });
            return;
        }

        setEvaluations(
            evaluations.map(item =>
                item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
            )
        );
    };

    const filteredAndSortedEvaluations = useMemo(() => {
        const filtered = evaluations.filter(evaluation =>
            evaluation.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Separate pinned and unpinned items
        const pinnedItems = filtered.filter(item => item.isPinned);
        const unpinnedItems = filtered.filter(item => !item.isPinned);

        return [...pinnedItems, ...unpinnedItems];
    }, [evaluations, searchQuery]);


    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Nova Avaliação</CardTitle>
                    <CardDescription>Adicione, gerencie e avalie itens pelos critérios da temporada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex gap-4 flex-wrap">
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
                    </div>
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar itens..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {isClient && evaluations.length > 0 ? (
                 <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="evaluations">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {filteredAndSortedEvaluations.map((evaluation, index) => (
                                    <Draggable key={evaluation.id} draggableId={evaluation.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                            >
                                                <EvaluationItem
                                                    evaluation={evaluation}
                                                    onUpdate={handleUpdateItem}
                                                    onDelete={handleDeleteItem}
                                                    onTogglePin={handleTogglePin}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    isDragging={snapshot.isDragging}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
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
