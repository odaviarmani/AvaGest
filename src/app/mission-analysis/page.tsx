
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import { NotepadText, Download } from "lucide-react";
import AnalysisTable from "@/components/mission-analysis/AnalysisTable";
import { Button } from '@/components/ui/button';

export default function MissionAnalysisPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_analise_missoes_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
       <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <NotepadText className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-3xl font-bold">Análise e Aprimoramento</h1>
                <p className="text-muted-foreground">
                Tabela interativa para analisar e priorizar as missões da temporada.
                </p>
            </div>
        </div>
        <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      <div ref={printRef}>
        <AnalysisTable />
      </div>
    </div>
  );
}
