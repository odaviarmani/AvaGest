
"use client";

import React from 'react';
import { Mission, Priority } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Star, Gift, ParkingCircle, MapPin, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface MissionCardProps {
    mission: Mission;
    onEdit: () => void;
    onDelete: () => void;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  'Baixa': <ArrowDown />,
  'Média': <Minus />,
  'Alta': <ArrowUp />,
};

const priorityTooltips: Record<Priority, string> = {
  'Baixa': 'Prioridade Baixa',
  'Média': 'Prioridade Média',
  'Alta': 'Prioridade Alta',
};


export default function MissionCard({ mission, onEdit, onDelete }: MissionCardProps) {
    const { name, imageUrl, points, description, hasBonus, canLeaveAttachment, priority, location } = mission;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between pb-2">
                 <div className="flex flex-col">
                    <CardTitle>{name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5"/> {location}
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
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={`Imagem da missão ${name}`} width={300} height={169} className="object-cover w-full h-full" />
                    ) : (
                        <Star className="w-16 h-16 text-muted-foreground" />
                    )}
                </div>
                 <div>
                    <h4 className="font-semibold text-sm mb-1">O que fazer:</h4>
                    <p className="text-sm text-muted-foreground break-words">{description}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4">
                 <Badge variant="secondary" className="text-base">
                    <Star className="w-4 h-4 mr-1.5 text-yellow-500"/>{points} pts
                 </Badge>
                 <TooltipProvider>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={cn("p-1.5 rounded-full", hasBonus ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted')}>
                                <Gift className={cn("w-5 h-5", hasBonus && 'text-green-600 dark:text-green-400')}/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{hasBonus ? 'Tem bônus' : 'Não tem bônus'}</TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <div className={cn("p-1.5 rounded-full", canLeaveAttachment ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-muted')}>
                                <ParkingCircle className={cn("w-5 h-5", canLeaveAttachment && 'text-blue-600 dark:text-blue-400')}/>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{canLeaveAttachment ? 'Pode deixar anexo' : 'Não pode deixar anexo'}</TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="p-1.5 rounded-full bg-muted">
                                {React.cloneElement(priorityIcons[priority] as React.ReactElement, { className: "w-5 h-5" })}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{priorityTooltips[priority]}</TooltipContent>
                    </Tooltip>
                 </div>
                 </TooltipProvider>
            </CardFooter>
        </Card>
    )
}
