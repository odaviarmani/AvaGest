
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function KanbanPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_kanban_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
       <header className="mb-4 flex justify-end">
          <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
          </Button>
      </header>
      <div ref={printRef} className="flex-1 overflow-y-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
