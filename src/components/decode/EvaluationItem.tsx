
"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Trash2, Download, GripVertical, Pin, PinOff } from 'lucide-react';
import { Evaluation, CRITERIA } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface EvaluationItemProps {
    evaluation: Evaluation;
    onUpdate: (updatedItem: Evaluation) => void;
    onDelete: (itemId: string) => void;
    onTogglePin: (itemId: string) => void;
    dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
    isDragging: boolean;
}

const MAX_SCORE = CRITERIA.length * 4;
const PASSING_PERCENTAGE = 70;

export default function EvaluationItem({ evaluation, onUpdate, onDelete, onTogglePin, dragHandleProps, isDragging }: EvaluationItemProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...evaluation, name: e.target.value });
    };

    const handleScoreChange = (key: string, value: number) => {
        onUpdate({
            ...evaluation,
            scores: {
                ...evaluation.scores,
                [key]: value,
            },
        });
    };

    const handleDownloadPNG = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, {
                useCORS: true,
                backgroundColor: null, 
                scale: 2, 
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `avaliacao_${evaluation.name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };


    const totalScore = Object.values(evaluation.scores).reduce((sum, score) => sum + score, 0);
    const percentage = (totalScore / MAX_SCORE) * 100;
    const isGood = percentage >= PASSING_PERCENTAGE;

    return (
        <Card 
            ref={cardRef} 
            className={cn(
                "transition-all",
                isDragging ? "shadow-2xl ring-2 ring-primary" : "shadow-sm",
                evaluation.isPinned && "border-primary/50 bg-primary/5"
            )}
        >
            <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div {...dragHandleProps} className="cursor-grab text-muted-foreground">
                        <GripVertical />
                    </div>
                     <Input
                        value={evaluation.name}
                        onChange={handleNameChange}
                        className="text-lg font-bold border-0 shadow-none focus-visible:ring-1 w-full bg-transparent"
                    />
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => onTogglePin(evaluation.id)} title={evaluation.isPinned ? "Desafixar" : "Fixar"}>
                        {evaluation.isPinned ? <PinOff className="h-5 w-5 text-primary" /> : <Pin className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDownloadPNG}>
                        <Download className="h-5 w-5" />
                        <span className="sr-only">Download como PNG</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(evaluation.id)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
                        <span className="sr-only">Excluir item</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CRITERIA.map(criterion => (
                        <div key={criterion.key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor={`${evaluation.id}-${criterion.key}`}>{criterion.label}</Label>
                                <span className="font-bold text-primary text-lg">{evaluation.scores[criterion.key]}</span>
                            </div>
                            <Slider
                                id={`${evaluation.id}-${criterion.key}`}
                                value={[evaluation.scores[criterion.key] || 1]}
                                onValueChange={([val]) => handleScoreChange(criterion.key, val)}
                                min={1}
                                max={4}
                                step={1}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
             <CardFooter className="flex-col items-start gap-4 pt-6">
                <Separator />
                <div className="flex justify-between items-center w-full">
                    <div className="text-lg font-semibold">
                        Pontuação Total: <span className="text-primary font-bold">{totalScore} / {MAX_SCORE}</span>
                    </div>
                     <Badge className={`text-base px-4 py-1 ${isGood ? 'bg-green-500/80 hover:bg-green-500/90' : 'bg-red-500/80 hover:bg-red-500/90'} text-white`}>
                        {isGood ? 'Bom' : 'Ruim'} ({percentage.toFixed(0)}%)
                    </Badge>
                </div>
            </CardFooter>
        </Card>
    );
}
