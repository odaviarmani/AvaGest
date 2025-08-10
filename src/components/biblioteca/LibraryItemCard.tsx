"use client";

import React from 'react';
import { LibraryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Book, Link as LinkIcon, FileText } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import Link from 'next/link';

interface LibraryItemCardProps {
    item: LibraryItem;
    onEdit: () => void;
    onDelete: () => void;
}

export default function LibraryItemCard({ item, onEdit, onDelete }: LibraryItemCardProps) {
    const { title, author, link, summary, imageUrl } = item;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-start justify-between">
                 <div className="flex flex-col pr-2">
                    <CardTitle className="leading-tight">{title}</CardTitle>
                    <CardDescription>por {author}</CardDescription>
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
                <div className="aspect-w-4 aspect-h-3 w-full rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={`Capa de ${title}`} width={200} height={250} className="object-cover w-full h-full" />
                    ) : (
                        <Book className="w-16 h-16 text-muted-foreground" />
                    )}
                </div>
                 {summary && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Resumo/Anotações</h4>
                        <ScrollArea className="h-24 w-full rounded-md border p-2">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
            {link && (
                 <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Acessar Material
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
