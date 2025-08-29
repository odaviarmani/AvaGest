
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import DecodeEvaluation from "@/components/decode/DecodeEvaluation";
import { Code, Download } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function DecodePage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_decode_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Code className="w-8 h-8" />
            <div>
            <h1 className="text-3xl font-bold">Parâmetro do Decode</h1>
            <p className="text-muted-foreground">
                Ferramenta para avaliar ideias e projetos com base em critérios pré-definidos.
            </p>
            </div>
        </div>
        <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      <div ref={printRef}>
        <DecodeEvaluation />
      </div>
    </div>
  );
}
