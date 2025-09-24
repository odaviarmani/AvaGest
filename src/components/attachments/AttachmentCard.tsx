
"use client";

import React from 'react';
import { Attachment, AttachmentVersion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Copy, Clock, Target, Star, GitBranch, Puzzle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';


interface AttachmentCardProps {
    attachment: Attachment;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const VersionColumn = ({ version, title }: { version: AttachmentVersion, title: string }) => {
    return (
        <div className="flex-1 space-y-3">
            <h3 className="font-bold text-center text-lg">{title}</h3>
            <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {version.imageUrl ? (
                    <Image src={version.imageUrl} alt={`Render do anexo ${version.name}`} width={300} height={169} className="object-cover w-full h-full" unoptimized />
                ) : (
                    <Puzzle className="w-16 h-16 text-muted-foreground" />
                )}
            </div>
            <div className="space-y-1 text-center">
                <p className="font-semibold text-base">{version.name}</p>
                <p className="text-sm text-muted-foreground break-words">Missões: {version.missions}</p>
                <p className="font-bold text-primary text-lg">{version.points} pts</p>
            </div>
        </div>
    );
};

export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate }: AttachmentCardProps) {
    const { runExit, avgTime, swapTime, precision, category, version1, version2, version2Enabled } = attachment;

    return (
        <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between">
                 <div className="flex flex-col">
                    <CardTitle className="leading-tight">{version2Enabled ? `${version1.name} -> ${version2?.name}` : version1.name}</CardTitle>
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
                 <div className="flex gap-4">
                    <VersionColumn version={version1} title="Versão 1" />
                    {version2Enabled && version2 && (
                       <>
                         <Separator orientation="vertical" className="h-auto" />
                         <VersionColumn version={version2} title="Versão 2" />
                       </>
                    )}
                 </div>
            </CardContent>
            <Separator className="my-2" />
            <CardFooter className="grid grid-cols-3 gap-y-3 gap-x-2 p-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4"/> <span className="font-semibold">{precision}%</span> Precisão</div>
                <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4"/> <span className="font-semibold">{avgTime}s</span> Tempo</div>
                <div className="flex items-center gap-1 text-muted-foreground"><GitBranch className="w-4 h-4"/> <span className="font-semibold">{swapTime}s</span> Troca</div>
            </CardFooter>
        </Card>
    )
}
