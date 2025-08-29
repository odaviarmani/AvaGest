
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, History, Trash2, Save, Spade } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { SpinResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const NAMES = ["Davi", "Carol", "Lorenzo", "Thiago", "Miguel", "Italo"];
const AREAS = ["Projeto de Inovação", "Construção", "Programação"];


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

const ManualSpinForm = ({ onSave }: { onSave: (result: SpinResult) => void }) => {
    const [pairs, setPairs] = useState([
        { p1: '', p2: '', area: '' },
        { p1: '', p2: '', area: '' },
        { p1: '', p2: '', area: '' },
    ]);
    const { toast } = useToast();

    const handleSave = () => {
        const assignedNames = new Set(pairs.flatMap(p => [p.p1, p.p2]).filter(Boolean));
        if (assignedNames.size !== 6 || pairs.some(p => !p.p1 || !p.p2 || !p.area)) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Todos os 6 membros devem ser atribuídos a uma dupla e todas as áreas devem ser selecionadas.',
            });
            return;
        }

        const newResult: SpinResult = {
            id: crypto.randomUUID(),
            pairs: pairs.map(p => ({
                pair: [p.p1, p.p2] as [string, string],
                area: p.area,
            })),
            date: new Date().toLocaleString('pt-BR'),
            source: 'manual',
        };
        onSave(newResult);
        toast({ title: "Sorteio manual registrado!" });
    };
    
    const getAvailableNames = (currentIndex: number, part: 'p1' | 'p2') => {
        const currentPair = pairs[currentIndex];
        const assignedNames = new Set(pairs.flatMap((p, i) => {
            // Don't count the other part of the current pair being edited
            if(i === currentIndex) {
                 return part === 'p1' ? [p.p2] : [p.p1];
            }
            return [p.p1, p.p2];
        }).filter(Boolean));
        return NAMES.filter(name => !assignedNames.has(name));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registro Manual de Sorteio</CardTitle>
                <CardDescription>Registre um sorteio feito com cartas de baralho.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pairs.map((pair, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-end">
                        <div>
                             <Label htmlFor={`p1-${index}`}>Dupla {index + 1} (1)</Label>
                             <Select value={pair.p1} onValueChange={(val) => { const newPairs = [...pairs]; newPairs[index].p1 = val; setPairs(newPairs);}}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {getAvailableNames(index, 'p1').map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                        <div>
                            <Label htmlFor={`p2-${index}`}>Dupla {index + 1} (2)</Label>
                             <Select value={pair.p2} onValueChange={(val) => { const newPairs = [...pairs]; newPairs[index].p2 = val; setPairs(newPairs);}}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {getAvailableNames(index, 'p2').map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                         <div>
                            <Label htmlFor={`area-${index}`}>Área</Label>
                             <Select value={pair.area} onValueChange={(val) => { const newPairs = [...pairs]; newPairs[index].area = val; setPairs(newPairs);}}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {AREAS.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleSave}>
                    <Save className="mr-2"/>
                    Salvar Sorteio Manual
                 </Button>
            </CardFooter>
        </Card>
    )
}

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

  const addResultToHistory = (result: SpinResult) => {
      setLatestResult(result);
      setHistory(prevHistory => [result, ...prevHistory]);
  };

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
        id: crypto.randomUUID(),
        pairs: newPairs,
        date: new Date().toLocaleString('pt-BR'),
        source: 'automatic',
      };
      
      addResultToHistory(newResult);
      setIsSpinning(false);
    }, 1500);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  }

  return (
    <div className="space-y-8">
        <Card className="w-full">
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
                <div className={cn(
                    "mt-4 w-full p-4 rounded-lg animate-in fade-in-50",
                    latestResult.source === 'automatic' ? 'bg-primary/20 text-primary-foreground' : 'bg-amber-400/20 text-amber-800'
                )}>
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
        
        <ManualSpinForm onSave={addResultToHistory} />

        {isClient && history.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6"/>
                        Histórico de Sorteios
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {history.map(result => (
                                <div key={result.id} className={cn(
                                    "p-4 border rounded-lg",
                                    result.source === 'manual' ? 'bg-amber-400/20 border-amber-400/50' : 'bg-secondary/30'
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {result.source === 'manual' && <Spade className="h-4 w-4 text-amber-700" title="Registro Manual"/>}
                                                <p className="text-sm font-medium text-muted-foreground">{result.date}</p>
                                            </div>
                                            <ul className="mt-2 space-y-1">
                                                {result.pairs.map((p, index) => (
                                                    <li key={index}>
                                                        <span className="font-semibold">{p.pair.join(' & ')}:</span>
                                                        <span className="ml-2 text-muted-foreground">{p.area}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteHistoryItem(result.id)}>
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                            <span className="sr-only">Excluir sorteio</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
