
"use client";

import React, { useState } from 'react';
import { Attachment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Copy, Clock, Target, GitBranch, Puzzle, GitCommit, Eye } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import EvolutionDetails from './EvolutionDetails';


interface AttachmentCardProps {
    attachment: Attachment;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onEvolve: () => void;
}


export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate, onEvolve }: AttachmentCardProps) {
    const { runExit, category, name, missions, points, imageUrl, avgTime, swapTime, precision, evolutionLog } = attachment;
    const [isEvolutionVisible, setIsEvolutionVisible] = useState(false);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
            <Card className={cn(
                "flex flex-col transition-all duration-200 hover:shadow-lg",
                isEvolutionVisible ? "xl:col-span-3" : "xl:col-span-5"
            )}>
                <CardHeader className="flex-row items-start justify-between">
                    <div className="flex flex-col">
                        <CardTitle className="leading-tight">{name}</CardTitle>
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
                        {imageUrl ? (
                            <Image src={imageUrl} alt={`Render do anexo ${name}`} layout="fill" className="object-cover" unoptimized />
                        ) : (
                            <Puzzle className="w-16 h-16 text-muted-foreground" />
                        )}
                    </div>
                     <div className="mt-4 space-y-1 text-center">
                        <p className="text-sm text-muted-foreground break-words">Missões: {missions}</p>
                        <p className="font-bold text-primary text-xl">{points} pts</p>
                    </div>
                </CardContent>
                <Separator className="my-2" />
                <CardFooter className="grid grid-cols-3 gap-y-3 gap-x-2 p-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4"/> <span className="font-semibold">{precision}%</span> Precisão</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4"/> <span className="font-semibold">{avgTime}s</span> Tempo</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><GitBranch className="w-4 h-4"/> <span className="font-semibold">{swapTime}s</span> Troca</div>
                    
                    <div className="col-span-3 flex justify-center items-center gap-4 pt-2">
                        <Button variant="secondary" onClick={onEvolve}>
                            <GitCommit className="mr-2 h-4 w-4" />
                            Registrar Evolução
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => setIsEvolutionVisible(!isEvolutionVisible)}
                            disabled={!evolutionLog || evolutionLog.length === 0}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            {isEvolutionVisible ? 'Ocultar' : 'Visualizar'} Evolução
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {isEvolutionVisible && (
                <div className="xl:col-span-2">
                    <EvolutionDetails attachment={attachment} />
                </div>
            )}
        </div>
    )
}
