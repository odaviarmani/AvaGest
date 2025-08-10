"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const NAMES = ["Davi", "Carol", "Lorenzo", "Thiago", "Miguel", "Italo"];
const AREAS = ["Projeto de Inovação", "Construção", "Programação"];

interface SpinResult {
  pairs: {
    pair: [string, string];
    area: string;
  }[];
  date: string;
}

// Fisher-Yates shuffle algorithm
const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export default function PairingRoulette() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [latestResult, setLatestResult] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedHistory = localStorage.getItem('pairingRouletteHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('pairingRouletteHistory', JSON.stringify(history));
    }
  }, [history, isClient]);

  const handleSpin = () => {
    setIsSpinning(true);
    
    setTimeout(() => {
      const shuffledNames = shuffle(NAMES);
      const shuffledAreas = shuffle(AREAS);

      const newPairs = [
        { pair: [shuffledNames[0], shuffledNames[1]] as [string, string], area: shuffledAreas[0] },
        { pair: [shuffledNames[2], shuffledNames[3]] as [string, string], area: shuffledAreas[1] },
        { pair: [shuffledNames[4], shuffledNames[5]] as [string, string], area: shuffledAreas[2] },
      ];

      const newResult: SpinResult = {
        pairs: newPairs,
        date: new Date().toLocaleString('pt-BR'),
      };
      
      setLatestResult(newResult);
      setHistory(prevHistory => [newResult, ...prevHistory]);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Roleta de Duplas Fixa</CardTitle>
          <CardDescription>Sorteia 3 duplas e atribui uma área para cada uma.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
            <div className="text-center p-4 border rounded-lg bg-secondary/50 w-full">
                <p className="font-semibold">Nomes:</p>
                <p className="text-sm text-muted-foreground">{NAMES.join(', ')}</p>
                <Separator className="my-2"/>
                <p className="font-semibold">Áreas:</p>
                <p className="text-sm text-muted-foreground">{AREAS.join(', ')}</p>
            </div>
          <Button onClick={handleSpin} disabled={isSpinning} size="lg">
            <Play className="mr-2 h-5 w-5" />
            {isSpinning ? 'Sorteando...' : 'Sortear Duplas'}
          </Button>

          {latestResult && !isSpinning && (
            <div className="mt-4 w-full p-4 bg-primary/20 text-primary-foreground rounded-lg animate-in fade-in-50">
              <h3 className="text-lg font-bold text-center mb-2 text-primary">Resultado do Sorteio</h3>
              <ul className="space-y-2">
                {latestResult.pairs.map((p, index) => (
                  <li key={index} className="p-2 bg-background rounded-md shadow-sm">
                    <p className="font-semibold">{p.pair.join(' & ')}</p>
                    <p className="text-sm text-muted-foreground">{p.area}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
            <div className="flex items-center gap-2">
                <History className="h-6 w-6" />
                <CardTitle>Histórico de Sorteios</CardTitle>
            </div>
          <CardDescription>Resultados dos sorteios da roleta de duplas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] p-4 border rounded-lg">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum sorteio realizado ainda.</p>
            ) : (
              <ul className="space-y-6">
                {history.map((result, index) => (
                  <li key={index}>
                    <p className="font-semibold text-sm mb-2">{result.date}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {result.pairs.map((p, i) => (
                         <li key={i} className="p-2 bg-secondary/30 rounded-md">
                            <p className="font-medium text-secondary-foreground">{p.pair.join(' & ')}</p>
                            <p className="text-xs text-muted-foreground">{p.area}</p>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
