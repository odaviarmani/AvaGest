
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Attachment, AttachmentVersion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Copy, Clock, Target, Star, GitBranch, Puzzle, TrendingUp, TrendingDown, ChevronsRight, Minus } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


interface AttachmentCardProps {
    attachment: Attachment;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const StatChange = ({ label, value, unit = '' }: { label: string; value: number, unit?: string }) => {
    let Icon = Minus;
    let color = 'text-muted-foreground';
    let sign = '';

    if (value > 0) {
        Icon = label === 'Tempo' || label === 'Troca' ? TrendingDown : TrendingUp;
        color = label === 'Tempo' || label === 'Troca' ? 'text-green-500' : 'text-green-500';
        sign = '+';
    } else if (value < 0) {
        Icon = label === 'Tempo' || label === 'Troca' ? TrendingUp : TrendingDown;
        color = label === 'Tempo' || label === 'Troca' ? 'text-red-500' : 'text-red-500';
    }
    
    if (value === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", color)} />
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={cn("font-bold text-lg", color)}>{sign}{value.toFixed(0)}{unit}</span>
            </div>
        </div>
    );
};

export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate }: AttachmentCardProps) {
    const { runExit, category, version1, version2, version2Enabled } = attachment;
    const [visibleVersion, setVisibleVersion] = useState<'version1' | 'version2'>('version1');

    useEffect(() => {
        if (!version2Enabled || !version2) return;

        const interval = setInterval(() => {
            setVisibleVersion(prev => (prev === 'version1' ? 'version2' : 'version1'));
        }, 4000);

        return () => clearInterval(interval);
    }, [version2Enabled, version2]);

    const currentVersionData = (visibleVersion === 'version2' && version2Enabled && version2) ? version2 : version1;

    const evolutionStats = useMemo(() => {
        if (!version2Enabled || !version2) return null;

        const pointsDiff = version2.points - version1.points;
        const timeDiff = attachment.avgTime - (version1.points > 0 ? ((attachment.avgTime * version1.points) / version2.points) : 0); // Placeholder logic
        const swapTimeDiff = attachment.swapTime - (version1.points > 0 ? ((attachment.swapTime * version1.points) / version2.points) : 0);
        const precisionDiff = attachment.precision - 95; // Placeholder

        return {
            points: pointsDiff,
            avgTime: timeDiff,
            swapTime: swapTimeDiff,
            precision: precisionDiff
        };

    }, [attachment, version1, version2, version2Enabled]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            <Card className="flex flex-col transition-all duration-200 hover:shadow-lg lg:col-span-2">
                <CardHeader className="flex-row items-start justify-between">
                    <div className="flex flex-col">
                        <CardTitle className="leading-tight">{currentVersionData.name}</CardTitle>
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
                            <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-4">
                    <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center relative">
                        {currentVersionData.imageUrl ? (
                            <Image src={currentVersionData.imageUrl} alt={`Render do anexo ${currentVersionData.name}`} layout="fill" className="object-cover" unoptimized />
                        ) : (
                            <Puzzle className="w-16 h-16 text-muted-foreground" />
                        )}
                         {version2Enabled && version2 && (
                             <Badge variant="secondary" className="absolute top-2 right-2 text-lg z-10 animate-pulse">
                                {visibleVersion === 'version1' ? 'V1' : 'V2'}
                             </Badge>
                         )}
                    </div>
                     <div className="mt-4 space-y-1 text-center">
                        <p className="text-sm text-muted-foreground break-words">Missões: {currentVersionData.missions}</p>
                        <p className="font-bold text-primary text-xl">{currentVersionData.points} pts</p>
                    </div>
                </CardContent>
                <Separator className="my-2" />
                <CardFooter className="grid grid-cols-3 gap-y-3 gap-x-2 p-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4"/> <span className="font-semibold">{attachment.precision}%</span> Precisão</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4"/> <span className="font-semibold">{attachment.avgTime}s</span> Tempo</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><GitBranch className="w-4 h-4"/> <span className="font-semibold">{attachment.swapTime}s</span> Troca</div>
                </CardFooter>
            </Card>

             {version2Enabled && version2 && evolutionStats && (
                <Card className="flex flex-col justify-center">
                    <CardHeader>
                        <CardTitle className="text-lg text-center">Estatísticas da Evolução</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-6">
                        <StatChange label="Pontos" value={evolutionStats.points} unit=" pts" />
                        <Separator />
                        <StatChange label="Tempo" value={evolutionStats.avgTime} unit="s" />
                         <Separator />
                        <StatChange label="Precisão" value={evolutionStats.precision} unit="%" />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
