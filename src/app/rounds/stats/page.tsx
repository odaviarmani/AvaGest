
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import RoundsStats from "@/components/rounds/RoundsStats";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function RoundsStatsPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_estatisticas_rounds_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
            <Link href="/rounds">
                <ArrowLeft />
                <span className="sr-only">Voltar para Rounds</span>
            </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Estatísticas dos Rounds</h1>
                <p className="text-muted-foreground">
                Análise do histórico de pontuações, tempos e erros.
                </p>
            </div>
        </div>
        <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      <div ref={printRef}>
        <RoundsStats />
      </div>
    </div>
  );
}
