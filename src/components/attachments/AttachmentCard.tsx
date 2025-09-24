
"use client";

import React from 'react';
import { Attachment, EvolutionEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Copy, Clock, Target, Star, GitBranch, Puzzle, TrendingUp, TrendingDown } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';


interface AttachmentCardProps {
    attachment: Attachment;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onEvolve: () => void;
}

const StatItem = ({ icon, value, label, evolutionValue }: { icon: React.ReactNode, value: React.ReactNode, label: string, evolutionValue?: number | null }) => {
    const hasEvolved = evolutionValue !== undefined && evolutionValue !== null;
    let change: 'increase' | 'decrease' | 'same' | null = null;
    if (hasEvolved && typeof value === 'number') {
        if (value > evolutionValue) change = 'increase';
        else if (value < evolutionValue) change = 'decrease';
        else change = 'same';
    }
    
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="text-muted-foreground">{icon}</div>
            <div className="flex flex-col">
                <span className="font-semibold">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            {hasEvolved && change !== 'same' && (
                <div className={cn(
                    "flex items-center text-xs font-bold",
                    change === 'increase' ? 'text-green-500' : 'text-red-500'
                )}>
                    {change === 'increase' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {typeof value === 'number' && `(${(value - evolutionValue!).toFixed(0)})`}
                </div>
            )}
        </div>
    );
};


export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate, onEvolve }: AttachmentCardProps) {
    const { runExit, avgTime, swapTime, precision, name, missions, points, imageUrl, category, evolution } = attachment;

    const lastEvolution = evolution && evolution.length > 0 ? evolution[evolution.length - 1] : null;

    const chartData = evolution ? [...evolution, { date: 'Atual', points, precision, avgTime }].map((e, i) => ({...e, step: i})) : [];

    return (
        <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between">
                 <div className="flex flex-col">
                    <CardTitle>{name}</CardTitle>
                    <CardDescription className="flex gap-2 pt-1">
                        <span className="font-medium">Saída: {runExit}</span>
                        {category && <span className="font-semibold text-primary">{category}</span>}
                    </CardDescription>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEvolve}><TrendingUp className="mr-2 h-4 w-4" /> Registrar Evolução</DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicar</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
                 <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={`Render do anexo ${name}`} width={300} height={169} className="object-cover w-full h-full" unoptimized />
                    ) : (
                        <Puzzle className="w-16 h-16 text-muted-foreground" />
                    )}
                </div>
                 <div className="mt-4 space-y-1">
                    <h4 className="font-semibold text-sm mb-1">Missões:</h4>
                    <p className="text-sm text-muted-foreground break-words">{missions}</p>
                </div>
                {chartData.length > 1 && (
                    <div className="mt-4 h-16 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                    }}
                                    labelFormatter={(label) => `Versão ${label}`}
                                />
                                <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
            <Separator className="my-2" />
            <CardFooter className="grid grid-cols-2 gap-y-3 gap-x-4 p-4">
                <StatItem icon={<Star className="w-4 h-4"/>} value={points} label="Pontuação" evolutionValue={lastEvolution?.points} />
                <StatItem icon={<Target className="w-4 h-4"/>} value={`${precision}%`} label="Precisão" evolutionValue={lastEvolution?.precision} />
                <StatItem icon={<Clock className="w-4 h-4"/>} value={`${avgTime}s`} label="Tempo Médio" evolutionValue={lastEvolution?.avgTime} />
                <StatItem icon={<GitBranch className="w-4 h-4"/>} value={`${swapTime}s`} label="Tempo Troca" />
            </CardFooter>
        </Card>
    )
}
