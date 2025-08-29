
"use client";

import React from 'react';
import { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Package, MapPin } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface InventoryItemCardProps {
    item: InventoryItem;
    onEdit: () => void;
    onDelete: () => void;
}

export default function InventoryItemCard({ item, onEdit, onDelete }: InventoryItemCardProps) {
    const { name, category, quantity, location } = item;

    return (
        <Card className="flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between pb-4">
                 <div className="space-y-1">
                    <CardTitle className="text-base leading-tight">{name}</CardTitle>
                    <CardDescription>{category}</CardDescription>
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
            <CardContent className="pt-0">
                 <div className="flex justify-between items-center w-full text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4"/>
                        <span>{location || 'Não especificado'}</span>
                    </div>
                    <Badge variant="secondary">Qtd: {quantity}</Badge>
                </div>
            </CardContent>
        </Card>
    )
}
