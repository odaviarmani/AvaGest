
"use client";

import React from 'react';
import { Attachment, AttachmentVersion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Clock, Target, Star, GitBranch, Puzzle, Copy } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';

interface AttachmentCardProps {
    attachment: Attachment;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: React.ReactNode, label: string }) => (
    <div className="flex items-center gap-2 text-sm">
        <div className="text-muted-foreground">{icon}</div>
        <div className="flex flex-col">
            <span className="font-semibold">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    </div>
);

const VersionDisplay = ({ version, versionNumber }: { version: AttachmentVersion, versionNumber: number }) => (
    <CarouselItem>
        <div className="p-1 space-y-4">
             <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {version.imageUrl ? (
                    <Image src={version.imageUrl} alt={`Render do anexo ${version.name}`} width={300} height={169} className="object-cover w-full h-full" />
                ) : (
                    <Puzzle className="w-16 h-16 text-muted-foreground" />
                )}
            </div>
            <div>
                <h4 className="font-semibold text-sm mb-2">Missões (V{versionNumber}):</h4>
                <p className="text-sm text-muted-foreground break-words">{version.missions}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <StatItem icon={<Star className="w-4 h-4"/>} value={`${version.points} pts`} label="Pontuação" />
                <StatItem icon={<Target className="w-4 h-4"/>} value={`${version.precision}%`} label="Precisão" />
                <StatItem icon={<Clock className="w-4 h-4"/>} value={`${version.avgTime}s`} label="Tempo Médio" />
                <StatItem icon={<GitBranch className="w-4 h-4"/>} value={`${version.swapTime}s`} label="Tempo Troca" />
            </div>
        </div>
    </CarouselItem>
);

export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate }: AttachmentCardProps) {
    const { version1, version2, runExit } = attachment;

    return (
        <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between">
                 <div className="flex flex-col">
                    <CardTitle>{version2 ? `${version1.name} / ${version2.name}` : version1.name}</CardTitle>
                    <CardDescription>Saída: {runExit}</CardDescription>
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
            <CardContent className="flex-1 space-y-4">
                 <Carousel className="w-full max-w-xs mx-auto">
                    <CarouselContent>
                        <VersionDisplay version={version1} versionNumber={1} />
                        {version2 && <VersionDisplay version={version2} versionNumber={2} />}
                    </CarouselContent>
                    {version2 && (
                         <>
                            <CarouselPrevious className="left-[-12px]" />
                            <CarouselNext className="right-[-12px]" />
                        </>
                    )}
                </Carousel>
            </CardContent>
        </Card>
    )
}
