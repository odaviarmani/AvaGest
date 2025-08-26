
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task, priorities, areaNames, statuses } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

const areaColorMap: Record<string, string> = {
  "Projeto de Inovação": "bg-red-500/80",
  "Construção": "bg-green-500/80",
  "Programação": "bg-blue-500/80",
  "Core Values": "bg-yellow-500/80",
  "default": "bg-gray-500/80",
};

const getStatusFromColumnId = (columnId: string) => columnId.split('-')[0];

export default function TaskCalendar() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks, (key, value) => {
        if (key === 'startDate' || key === 'dueDate') {
          return value ? new Date(value) : null;
        }
        return value;
      });
      setTasks(parsedTasks);
    }
  }, []);

  const tasksOnSelectedDate = selectedDate
    ? tasks.filter(task => 
        (task.startDate && isSameDay(task.startDate, selectedDate)) || 
        (task.dueDate && isSameDay(task.dueDate, selectedDate))
      )
    : [];

  const modifiers = {
    startDate: tasks.map(t => t.startDate).filter(Boolean) as Date[],
    dueDate: tasks.map(t => t.dueDate).filter(Boolean) as Date[],
  };
  
  const modifiersStyles = {
    startDate: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '50% 0 0 50%',
    },
    dueDate: {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        borderRadius: '0 50% 50% 0',
    },
    selected: {
        backgroundColor: 'hsl(var(--foreground))',
        color: 'hsl(var(--background))'
    }
  };

  if (!isClient) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <Skeleton className="w-full h-[400px] rounded-lg" />
            </div>
            <div>
                 <Skeleton className="w-full h-10 mb-4" />
                 <Skeleton className="w-full h-24" />
            </div>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg">
        <CardContent className="p-0 flex justify-center">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-3"
                locale={ptBR}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                classNames={{
                    day_selected: 'rounded-md',
                    day_today: 'bg-secondary text-secondary-foreground rounded-md',
                }}
            />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            Tarefas para {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasksOnSelectedDate.length > 0 ? (
            tasksOnSelectedDate.map(task => (
              <div key={task.id} className="p-3 border rounded-lg bg-card-foreground/5 relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col">
                    {task.area.map(area => (
                        <div key={area} className={cn("flex-1", areaColorMap[area] || areaColorMap.default)}></div>
                    ))}
                </div>
                <div className="ml-4">
                  <p className="font-semibold">{task.name}</p>
                  <div className="flex flex-wrap gap-2 text-sm mt-2">
                    {task.startDate && isSameDay(task.startDate, selectedDate!) && (
                        <Badge variant="outline" className="bg-primary/20 text-primary-foreground border-primary">Início</Badge>
                    )}
                    {task.dueDate && isSameDay(task.dueDate, selectedDate!) && (
                        <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent">Entrega</Badge>
                    )}
                     <Badge variant="secondary">{task.priority}</Badge>
                     <Badge variant="secondary">{getStatusFromColumnId(task.columnId)}</Badge>
                     {task.area.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhuma tarefa para esta data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
