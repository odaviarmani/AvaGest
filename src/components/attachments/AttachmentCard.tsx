
"use client";

import React from 'react';
import { Attachment, AttachmentVersion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Clock, Target, Star, GitBranch, Puzzle, Copy } from 'lucide-react';
import { Separator } from '../ui/separator';

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
    <div className="flex flex-col space-y-3 p-1">
        <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center mb-2">
            {version.imageUrl ? (
                <Image src={version.imageUrl} alt={`Render do anexo ${version.name}`} width={300} height={169} className="object-cover w-full h-full" unoptimized />
            ) : (
                <Puzzle className="w-16 h-16 text-muted-foreground" />
            )}
        </div>
        <div className="space-y-1">
            <h4 className="font-semibold text-sm">{`V${versionNumber}: ${version.name}`}</h4>
            <p className="text-xs text-muted-foreground break-words h-10">{version.missions}</p>
        </div>
        <div className="pt-2">
             <StatItem icon={<Star className="w-4 h-4"/>} value={`${version.points} pts`} label="Pontuação" />
        </div>
    </div>
);

export default function AttachmentCard({ attachment, onEdit, onDelete, onDuplicate }: AttachmentCardProps) {
    const { runExit, avgTime, swapTime, precision, version1, version2, version2Enabled, category } = attachment;

    const hasTwoVersions = version2Enabled && version2;

    return (
        <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between">
                 <div className="flex flex-col">
                    <CardTitle>{version1.name}</CardTitle>
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
            <CardContent className="flex-1 flex flex-col">
                {hasTwoVersions ? (
                     <div className="grid grid-cols-2 gap-4">
                        <VersionDisplay version={version1} versionNumber={1} />
                        <VersionDisplay version={version2} versionNumber={2} />
                    </div>
                ) : (
                    <div className="p-1">
                        <div className="aspect-video w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            {version1.imageUrl ? (
                                <Image src={version1.imageUrl} alt={`Render do anexo ${version1.name}`} width={300} height={169} className="object-cover w-full h-full" unoptimized />
                            ) : (
                                <Puzzle className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>
                         <div className="mt-4 space-y-1">
                            <h4 className="font-semibold text-sm mb-1">{version1.name}</h4>
                            <p className="text-sm text-muted-foreground break-words">{version1.missions}</p>
                        </div>
                        <div className="mt-4">
                             <StatItem icon={<Star className="w-4 h-4"/>} value={`${version1.points} pts`} label="Pontuação" />
                        </div>
                    </div>
                )}
            </CardContent>
            <Separator className="my-2" />
            <CardFooter className="grid grid-cols-3 gap-y-2 gap-x-4 p-4">
                <StatItem icon={<Target className="w-4 h-4"/>} value={`${precision}%`} label="Precisão" />
                <StatItem icon={<Clock className="w-4 h-4"/>} value={`${avgTime}s`} label="Tempo Médio" />
                <StatItem icon={<GitBranch className="w-4 h-4"/>} value={`${swapTime}s`} label="Tempo Troca" />
            </CardFooter>
        </Card>
    )
}
