
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  add,
  sub,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

const areaColorMap: Record<string, string> = {
  "Projeto de Inovação": "bg-red-500/80",
  "Construção": "bg-green-500/80",
  "Programação": "bg-blue-500/80",
  "Core Values": "bg-yellow-500/80",
  "default": "bg-gray-500/80",
};

export default function WeeklyTaskView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  const week = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return {
      start,
      end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    week.days.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = tasks.filter(
        task =>
          (task.startDate && isSameDay(task.startDate, day)) ||
          (task.dueDate && isSameDay(task.dueDate, day))
      );
    });
    return grouped;
  }, [week.days, tasks]);

  const goToPreviousWeek = () => {
    setCurrentDate(sub(currentDate, { weeks: 1 }));
  };

  const goToNextWeek = () => {
    setCurrentDate(add(currentDate, { weeks: 1 }));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!isClient) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {format(week.start, 'dd/MM/yyyy')} - {format(week.end, 'dd/MM/yyyy')}
        </CardTitle>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {week.days.map(day => (
            <div
              key={day.toString()}
              className={cn(
                'p-2 rounded-lg border',
                isToday(day) ? 'bg-secondary' : 'bg-background'
              )}
            >
              <h3 className="font-semibold text-center mb-2">
                {format(day, 'EEE', { locale: ptBR })}
                <span className="block text-sm text-muted-foreground">
                  {format(day, 'dd/MM')}
                </span>
              </h3>
              <div className="space-y-2 min-h-[50px]">
                {tasksByDay[format(day, 'yyyy-MM-dd')]?.map(task => (
                  <div key={task.id} className="p-2 border rounded-md bg-card relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                        {task.area.map(area => (
                            <div key={area} className={cn("flex-1", areaColorMap[area] || areaColorMap.default)}></div>
                        ))}
                    </div>
                    <div className="ml-2">
                        <p className="text-xs font-semibold truncate">{task.name}</p>
                         <div className="flex flex-wrap gap-1 mt-1">
                            {task.startDate && isSameDay(task.startDate, day) && (
                                <Badge variant="outline" className="text-[10px] p-0.5 px-1 bg-primary/20 text-primary-foreground border-primary">Início</Badge>
                            )}
                            {task.dueDate && isSameDay(task.dueDate, day) && (
                                <Badge variant="outline" className="text-[10px] p-0.5 px-1 bg-accent/20 text-accent-foreground border-accent">Entrega</Badge>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
