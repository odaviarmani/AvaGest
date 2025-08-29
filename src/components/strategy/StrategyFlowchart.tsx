
"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ArrowDown } from 'lucide-react';
import type { Instruction } from './StrategySteps';
import { cn } from '@/lib/utils';

interface StrategyFlowchartProps {
  instructions: Instruction[];
}

const FlowchartNode = ({ text, type }: { text: string; type: 'start' | 'process' | 'end' | 'decision' }) => {
  const baseClasses = "p-2 min-h-[60px] flex items-center justify-center text-center text-sm font-semibold text-white shadow-md";
  const typeClasses = {
    start: "bg-green-600 rounded-full w-24 h-24",
    process: "bg-blue-600 w-48 h-20",
    decision: "bg-orange-500 w-40 h-40 transform rotate-45 flex items-center justify-center",
    end: "bg-red-600 rounded-full w-24 h-24",
  };

  if (type === 'decision') {
      return (
          <div className={cn(baseClasses, typeClasses.decision)}>
              <span className="transform -rotate-45">{text}</span>
          </div>
      )
  }

  return <div className={cn(baseClasses, typeClasses[type])}>{text}</div>;
};


const StrategyFlowchart = ({ instructions }: StrategyFlowchartProps) => {
  const flowchartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPNG = () => {
    if (flowchartRef.current) {
      html2canvas(flowchartRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `fluxograma_estrategia.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const hasInstructions = instructions.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Fluxograma da Estratégia</CardTitle>
                <CardDescription>
                    Visualização gráfica do pseudocódigo gerado.
                </CardDescription>
            </div>
            <Button onClick={handleDownloadPNG} disabled={!hasInstructions}>
                <Download className="mr-2" />
                Baixar como PNG
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto bg-muted/30 rounded-lg">
        <div ref={flowchartRef} className="inline-flex flex-col items-center gap-2 p-8">
            {hasInstructions ? (
                <>
                    <FlowchartNode text="Início" type="start" />
                    {instructions.map((instruction, index) => (
                        <React.Fragment key={instruction.step}>
                           <ArrowDown className="w-8 h-8 text-muted-foreground" />
                           <FlowchartNode 
                                text={`${instruction.action}\n${instruction.value}`} 
                                type={instruction.action.toLowerCase().includes('girar') ? 'decision' : 'process'}
                            />
                        </React.Fragment>
                    ))}
                    <ArrowDown className="w-8 h-8 text-muted-foreground" />
                    <FlowchartNode text="Fim" type="end" />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
                    <p>Nenhuma instrução para exibir.</p>
                    <p className="text-sm">Desenhe no mapa para gerar um fluxograma.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyFlowchart;
