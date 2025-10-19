
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, History, Trash2 } from 'lucide-react';
import type { StageTime } from './RoundsTimer';
import type { MissionState, RoundData } from '@/lib/types';


const programmingTypes = ["Blocos", "Python", "Pybricks"] as const;
const errorCauses = ["Nenhuma", "Humana", "Código", "Mecânica"] as const;

type ProgrammingType = typeof programmingTypes[number];
type ErrorCause = typeof errorCauses[number];

interface RoundLogProps {
    score: number;
    timings: StageTime[];
    isRoundFinished: boolean;
    onRegisterNewRound: () => void;
    missionsState: MissionState;
}

const formatSubTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    const totalSeconds = ms / 1000;
    return `${totalSeconds.toFixed(3)}s`;
};

export default function RoundLog({ score, timings, isRoundFinished, onRegisterNewRound, missionsState }: RoundLogProps) {
    const [selectedProgramming, setSelectedProgramming] = useState<ProgrammingType[]>([]);
    const [selectedErrors, setSelectedErrors] = useState<ErrorCause[]>([]);
    const [history, setHistory] = useState<RoundData[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedHistory = localStorage.getItem('roundsHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('roundsHistory', JSON.stringify(history));
        }
    }, [history, isClient]);

    const handleRegister = () => {
        const newRound: RoundData = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            programming: selectedProgramming,
            errors: selectedErrors,
            score,
            timings,
            missions: missionsState,
        };
        setHistory(prev => [newRound, ...prev]);
        
        // Reset for next round
        setSelectedProgramming([]);
        setSelectedErrors([]);
        onRegisterNewRound();
    };

    const handleDeleteHistoryItem = (id: string) => {
        setHistory(history.filter(item => item.id !== id));
    };

    const CheckboxGroup = ({
        title,
        options,
        selected,
        onSelectedChange,
    }: {
        title: string;
        options: readonly string[];
        selected: string[];
        onSelectedChange: (selected: any[]) => void;
    }) => (
        <div className="space-y-2">
            <Label className="font-semibold">{title}</Label>
            <div className="grid grid-cols-2 gap-2">
                {options.map(item => (
                    <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${title}-${item}`}
                            checked={selected.includes(item)}
                            onCheckedChange={checked => {
                                const newSelected = checked
                                    ? [...selected, item]
                                    : selected.filter(s => s !== item);
                                onSelectedChange(newSelected);
                            }}
                        />
                        <Label htmlFor={`${title}-${item}`}>{item}</Label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Novo Round</CardTitle>
                    <CardDescription>Preencha os detalhes e salve o round ao finalizar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <CheckboxGroup
                        title="Qual tipo de programação?"
                        options={programmingTypes}
                        selected={selectedProgramming}
                        onSelectedChange={setSelectedProgramming}
                    />
                    <CheckboxGroup
                        title="Qual a causa do erro?"
                        options={errorCauses}
                        selected={selectedErrors}
                        onSelectedChange={setSelectedErrors}
                    />
                    <Separator />
                    <div className="space-y-4">
                        <div>
                            <Label className="font-semibold">Pontuação (Automático)</Label>
                            <p className="text-2xl font-bold text-primary">{score}</p>
                        </div>
                        <div>
                            <Label className="font-semibold">Tempos (Automático)</Label>
                            <div className="space-y-1 text-sm text-muted-foreground mt-1">
                                {timings.map((t, i) => (
                                    <div key={i} className="flex justify-between">
                                        <span>{t.name}:</span>
                                        <span className="font-mono">{formatSubTime(t.duration)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={handleRegister} 
                        disabled={!isRoundFinished || selectedProgramming.length === 0 || selectedErrors.length === 0}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Registrar Round
                    </Button>
                </CardFooter>
            </Card>

            {isClient && history.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-6 w-6"/>
                            Histórico de Rounds
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {history.map(round => (
                                    <div key={round.id} className="p-4 border rounded-lg bg-secondary/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">{new Date(round.date).toLocaleString('pt-BR')}</p>
                                                <p className="text-lg font-bold text-primary">{round.score} pontos</p>
                                                <div className="mt-2 space-y-1">
                                                    <p><span className="font-semibold">Programação:</span> {round.programming.join(', ')}</p>
                                                    <p><span className="font-semibold">Erros:</span> {round.errors.join(', ')}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteHistoryItem(round.id)}>
                                                <Trash2 className="h-5 w-5 text-red-500" />
                                                <span className="sr-only">Excluir round</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    