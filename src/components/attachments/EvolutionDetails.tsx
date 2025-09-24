
"use client";

import React from 'react';
import { Attachment, EvolutionEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Star, Clock, Target } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';


interface EvolutionDetailsProps {
    attachment: Attachment;
}

const StatChange = ({ label, value, unit = '', higherIsBetter = true }: { label: string; value: number, unit?: string, higherIsBetter?: boolean }) => {
    let Icon = Minus;
    let color = 'text-muted-foreground';
    let sign = '';

    if (value > 0) {
        Icon = higherIsBetter ? TrendingUp : TrendingDown;
        color = higherIsBetter ? 'text-green-500' : 'text-red-500';
        sign = '+';
    } else if (value < 0) {
        Icon = higherIsBetter ? TrendingDown : TrendingUp;
        color = higherIsBetter ? 'text-red-500' : 'text-green-500';
    } else {
        return null; // Don't show if no change
    }

    return (
        <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", color)} />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={cn("font-bold text-lg", color)}>{sign}{value.toFixed(1)}{unit}</span>
            </div>
        </div>
    );
};

export default function EvolutionDetails({ attachment }: EvolutionDetailsProps) {
    const { name, points, avgTime, precision, imageUrl, evolutionLog = [] } = attachment;

    if (!evolutionLog || evolutionLog.length === 0) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="p-4 text-center text-muted-foreground">
                    <p>Nenhum histórico de evolução para este anexo.</p>
                </CardContent>
            </Card>
        );
    }

    const lastEvolution = evolutionLog[evolutionLog.length - 1];

    const pointsDiff = points - lastEvolution.points;
    const timeDiff = avgTime - lastEvolution.avgTime;
    const precisionDiff = precision - lastEvolution.precision;

    const chartData = [...evolutionLog, {
        date: new Date().toISOString(),
        points,
        avgTime,
        precision
    }].map(entry => ({
        date: format(new Date(entry.date), "dd/MM"),
        Pontos: entry.points,
        "Tempo (s)": entry.avgTime,
        "Precisão (%)": entry.precision,
    }));
    
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Evolução de "{name}"</CardTitle>
                <CardDescription>Comparação com a última versão registrada.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                <div className="grid grid-cols-3 items-center gap-2 text-center">
                    <div className="space-y-2">
                         <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center relative">
                            {lastEvolution.imageUrl ? <Image src={lastEvolution.imageUrl} alt="Versão anterior" layout="fill" className="object-cover" unoptimized /> : <p className="text-xs text-muted-foreground">Sem imagem</p>}
                        </div>
                        <p className="text-sm font-medium">Versão Anterior</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-2">
                        <StatChange label="Pontos" value={pointsDiff} unit=" pts" />
                        <StatChange label="Tempo" value={timeDiff} unit="s" higherIsBetter={false} />
                        <StatChange label="Precisão" value={precisionDiff} unit="%" />
                    </div>

                    <div className="space-y-2">
                         <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center relative">
                            {imageUrl ? <Image src={imageUrl} alt="Versão atual" layout="fill" className="object-cover" unoptimized /> : <p className="text-xs text-muted-foreground">Sem imagem</p>}
                        </div>
                        <p className="text-sm font-medium">Versão Atual</p>
                    </div>
                </div>

                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis yAxisId="left" fontSize={12} />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} unit="s" />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                            <Legend wrapperStyle={{ fontSize: '12px' }}/>
                            <Line yAxisId="left" type="monotone" dataKey="Pontos" stroke="#8884d8" name="Pontos"/>
                            <Line yAxisId="right" type="monotone" dataKey="Tempo (s)" stroke="#82ca9d" name="Tempo"/>
                            <Line yAxisId="left" type="monotone" dataKey="Precisão (%)" stroke="#ffc658" name="Precisão"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 {lastEvolution.notes && (
                    <div>
                        <h4 className="font-semibold text-sm">Notas da última evolução:</h4>
                        <p className="text-sm text-muted-foreground italic">"{lastEvolution.notes}"</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
