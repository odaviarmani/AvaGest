
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import TaskCalendar from "@/components/calendar/TaskCalendar";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function CalendarPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_calendario_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
       <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
            <p className="text-muted-foreground">
            Visualize as datas de início e entrega das suas tarefas do Kanban.
            </p>
        </div>
         <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      <div ref={printRef}>
        <TaskCalendar />
      </div>
    </div>
  );
}
