
"use client";

import React from 'react';
import TaskCalendar from "@/components/calendar/TaskCalendar";
import ProjectGanttChart from '@/components/calendar/ProjectGanttChart';
import { Separator } from '@/components/ui/separator';

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12">
       <header>
        <div>
            <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
            <p className="text-muted-foreground">
            Visualize as datas de início e entrega das suas tarefas do Kanban.
            </p>
        </div>
      </header>
      <div>
        <TaskCalendar />
      </div>

      <Separator />

      <div>
        <header className="mb-8">
            <div>
                <h1 className="text-3xl font-bold">Gantt de Projetos</h1>
                <p className="text-muted-foreground">
                Visualize a linha do tempo das tarefas para cada projeto.
                </p>
            </div>
        </header>
        <ProjectGanttChart />
      </div>

    </div>
  );
}
