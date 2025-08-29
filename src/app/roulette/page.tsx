
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import PairingRoulette from '@/components/roulette/PairingRoulette';
import RouletteCreator from '@/components/roulette/RouletteCreator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function RoulettePage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_roletas_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roletas de Revezamento</h1>
          <p className="text-muted-foreground">Crie e gerencie suas roletas personalizadas ou use a roleta de duplas.</p>
        </div>
         <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      
      <div ref={printRef}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <PairingRoulette />
          </div>
          <div className="space-y-8">
            <RouletteCreator />
          </div>
        </div>
      </div>

    </div>
  );
}
