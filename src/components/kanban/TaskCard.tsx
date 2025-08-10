"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar as CalendarIcon, Pencil, Trash2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Task, Priority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  'Baixa': <ArrowDown className="h-4 w-4 text-green-500" />,
  'Média': <Minus className="h-4 w-4 text-yellow-500" />,
  'Alta': <ArrowUp className="h-4 w-4 text-red-500" />,
};

const priorityBadgeVariant: Record<Priority, "secondary" | "default" | "destructive"> = {
    'Baixa': 'secondary',
    'Média': 'default',
    'Alta': 'destructive'
}

export default function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className={cn("w-full shadow-md hover:shadow-lg transition-shadow", isDragging && "shadow-xl ring-2 ring-primary")}>
      <CardHeader className="p-4 flex flex-row items-start justify-between">
        <CardTitle className="text-base font-semibold leading-tight pr-4">{task.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Opções da Tarefa</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant={priorityBadgeVariant[task.priority]} className="capitalize">
                {priorityIcons[task.priority]}
                <span className="ml-1">{task.priority}</span>
            </Badge>
            <Badge variant="outline">{task.area}</Badge>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            {task.startDate && (
                <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Início: {format(task.startDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
            )}
            {task.dueDate && (
                <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Entrega: {format(task.dueDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
