
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar as CalendarIcon, Pencil, Trash2, ArrowUp, ArrowDown, Minus, FolderKanban } from 'lucide-react';
import { Task, Priority, areaNames } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '../ui/checkbox';

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isCompact?: boolean;
  isBulkSelectMode?: boolean;
  isSelected?: boolean;
}

const priorityIcons: Record<Priority, React.ReactNode> = {
  'Baixa': <ArrowDown className="h-4 w-4" />,
  'Média': <Minus className="h-4 w-4" />,
  'Alta': <ArrowUp className="h-4 w-4" />,
};

const areaColorMap: Record<string, string> = {
    "Projeto de Inovação": "bg-red-500/80",
    "Construção": "bg-green-500/80",
    "Programação": "bg-blue-500/80",
    "Core Values": "bg-yellow-500/80",
    "default": "bg-gray-500/80",
};

const formatDateTime = (date: Date) => {
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    return format(date, hasTime ? "dd/MM/yy 'às' HH:mm" : "dd/MM/yyyy", { locale: ptBR });
};

export default function TaskCard({ task, isDragging, onEdit, onDelete, isCompact = false, isBulkSelectMode = false, isSelected = false }: TaskCardProps) {
  const priorityBadgeColor: Record<Priority, string> = {
    'Baixa': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300 dark:border-green-600',
    'Média': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600',
    'Alta': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-600'
  }

  const taskAreas = Array.isArray(task.area) ? task.area : [task.area];
  
  const cardContent = (
    <>
       <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col">
            {taskAreas.map(area => (
                <div key={area} className={cn("flex-1", areaColorMap[area] || areaColorMap.default)}></div>
            ))}
        </div>
         <div className="pl-3 flex-1 flex flex-col">
          <CardHeader className="p-2 flex flex-row items-start justify-between">
              <CardTitle className={cn("text-sm font-semibold leading-tight pr-2", isCompact ? "" : "text-base")}>{task.name}</CardTitle>
               {!isBulkSelectMode && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 hover:bg-black/10 dark:hover:bg-white/10">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
          </CardHeader>
          <CardContent className={cn("p-2 pt-0 flex-1 flex flex-col", isCompact ? 'justify-end' : 'justify-between space-y-3')}>
             <div>
                <div className="flex flex-wrap gap-1">
                    {!isCompact && (
                         <Badge variant="outline" className={cn("capitalize", priorityBadgeColor[task.priority])}>
                            {React.cloneElement(priorityIcons[task.priority] as React.ReactElement, { className: "h-4 w-4" })}
                            <span className="ml-1">{task.priority}</span>
                        </Badge>
                    )}
                    {taskAreas.map(a => <Badge key={a} variant="outline" className="text-xs px-1.5 py-0 bg-card/80">{a}</Badge>)}
                    {task.project && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 flex items-center gap-1">
                            <FolderKanban className="w-3 h-3"/>
                            {task.project}
                        </Badge>
                    )}
                </div>
            </div>
             {!isCompact && (
              <div className="flex flex-col gap-2 text-sm">
                  {task.startDate && (
                      <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Início: {formatDateTime(task.startDate)}</span>
                      </div>
                  )}
                  {task.dueDate && (
                      <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Entrega: {formatDateTime(task.dueDate)}</span>
                      </div>
                  )}
              </div>
            )}
          </CardContent>
        </div>
    </>
  );

  return (
    <Card 
      className={cn(
        "w-full shadow-md hover:shadow-lg transition-all relative overflow-hidden h-full flex flex-col", 
        isDragging && "shadow-xl ring-2 ring-primary",
        isSelected && "ring-2 ring-primary bg-primary/10",
        isBulkSelectMode && "cursor-pointer",
        isCompact ? "aspect-video" : "",
        "bg-card/80 text-card-foreground"
      )}
    >
      {isBulkSelectMode && (
        <div className="absolute top-2 right-2 z-10">
          <Checkbox checked={isSelected} className="h-5 w-5"/>
        </div>
      )}
      {cardContent}
    </Card>
  );
}
