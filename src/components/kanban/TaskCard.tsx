"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar as CalendarIcon, Pencil, Trash2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Task, Priority, areaNames } from '@/lib/types';
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
  'Baixa': <ArrowDown className="h-4 w-4" />,
  'Média': <Minus className="h-4 w-4" />,
  'Alta': <ArrowUp className="h-4 w-4" />,
};

const areaColorMap: Record<string, string> = {
  "Projeto de Inovação": "220 84% 63%", // hsl(220, 84%, 63%) -> Blue
  "Construção": "142 76% 36%",   // hsl(142, 76%, 36%) -> Green
  "Programação": "262 84% 60%",  // hsl(262, 84%, 60%) -> Purple
  "Core Values": "48 96% 58%",   // hsl(48, 96%, 58%) -> Yellow
};

// Helper function to parse HSL strings
const parseHsl = (hslStr: string): [number, number, number] => {
    const [h, s, l] = hslStr.split(" ").map(val => parseFloat(val));
    return [h, s, l];
};

// Helper function to average HSL values
const averageHsl = (colors: [number, number, number][]): [number, number, number] => {
    if (colors.length === 0) return [0, 0, 70]; // Default grey
    if (colors.length === 1) return colors[0];

    // Special case for Construção (Green) + Programação (Purple) -> Teal
    const hasConstrucao = colors.some(c => c[0] === 142);
    const hasProgramacao = colors.some(c => c[0] === 262);
    if (hasConstrucao && hasProgramacao && colors.length === 2) {
        return [175, 70, 45]; // Teal color
    }

    let avgH = 0, avgS = 0, avgL = 0;
    colors.forEach(([h, s, l]) => {
        avgH += h;
        avgS += s;
        avgL += l;
    });

    return [
        avgH / colors.length,
        avgS / colors.length,
        avgL / colors.length
    ];
};

const getTaskBackgroundColor = (areas: string[], priority: Priority) => {
    const baseColors = areas.map(area => parseHsl(areaColorMap[area] || "0 0 70"));
    const [h, s, initialL] = averageHsl(baseColors);

    // Adjust lightness based on priority
    let l = initialL;
    if (priority === 'Alta') l = Math.max(0, l - 10);
    if (priority === 'Baixa') l = Math.min(100, l + 15);
    
    return `hsl(${h}, ${s}%, ${l}%)`;
};


export default function TaskCard({ task, isDragging, onEdit, onDelete }: TaskCardProps) {
  const backgroundColor = getTaskBackgroundColor(task.area, task.priority);

  const priorityIconColor: Record<Priority, string> = {
    'Baixa': 'text-green-700 dark:text-green-300',
    'Média': 'text-yellow-700 dark:text-yellow-300',
    'Alta': 'text-red-700 dark:text-red-300'
  }

  return (
    <Card 
      className={cn(
        "w-full shadow-md hover:shadow-lg transition-all text-card-foreground", 
        isDragging && "shadow-xl ring-2 ring-primary",
      )}
      style={{ backgroundColor }}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between">
        <CardTitle className="text-base font-semibold leading-tight pr-4">{task.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 hover:bg-black/10">
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
        <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className={cn("capitalize bg-card/80", priorityIconColor[task.priority])}>
                {React.cloneElement(priorityIcons[task.priority] as React.ReactElement, { className: "h-4 w-4" })}
                <span className="ml-1">{task.priority}</span>
            </Badge>
            <div className="flex flex-wrap gap-1 justify-end">
                {task.area.map(a => <Badge key={a} variant="outline" className="bg-card/80">{a}</Badge>)}
            </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
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
