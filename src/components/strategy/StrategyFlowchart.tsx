
"use client";

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ArrowRight } from 'lucide-react';
import type { Instruction } from './StrategySteps';
import { cn } from '@/lib/utils';

interface StrategyFlowchartProps {
  instructions: Instruction[];
}

const FlowchartNode = ({ text, type }: { text: string; type: 'start' | 'process' | 'decision' | 'end' }) => {
  const baseClasses = "p-2 min-h-[50px] w-40 flex items-center justify-center text-center text-sm font-semibold text-white shadow-md shrink-0";
  const typeClasses = {
    start: "bg-green-600 rounded-full",
    process: "bg-blue-600 rounded-lg",
    decision: "bg-orange-500 transform -skew-x-12",
    end: "bg-red-600 rounded-full",
  };

  if (type === 'decision') {
      return (
          <div className={cn(baseClasses, typeClasses.decision)}>
              <span className="transform skew-x-12">{text}</span>
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
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Fluxograma da Estratégia</CardTitle>
                <CardDescription>
                    Visualização gráfica do pseudocódigo gerado.
                </CardDescription>
            </div>
            <Button onClick={handleDownloadPNG} disabled={!hasInstructions} variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Baixar Fluxograma</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-x-auto bg-muted/30 rounded-lg">
        <div ref={flowchartRef} className="inline-flex items-center gap-2 p-8 h-full">
            {hasInstructions ? (
                <>
                    <FlowchartNode text="Início" type="start" />
                    {instructions.map((instruction, index) => (
                        <React.Fragment key={instruction.step}>
                           <ArrowRight className="w-8 h-8 text-muted-foreground shrink-0" />
                           <FlowchartNode 
                                text={`${instruction.action}\n${instruction.value}`} 
                                type={instruction.action.toLowerCase().includes('girar') ? 'decision' : 'process'}
                            />
                        </React.Fragment>
                    ))}
                    <ArrowRight className="w-8 h-8 text-muted-foreground shrink-0" />
                    <FlowchartNode text="Fim" type="end" />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center w-full min-h-[200px] text-muted-foreground">
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
