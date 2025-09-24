
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Play, History, Trash2, Save, Spade } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { SpinResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


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
    const [customDateTime, setCustomDateTime] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        // Set default value to current date and time in local timezone
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setCustomDateTime(now.toISOString().slice(0, 16));
    }, []);

    const handlePairChange = (index: number, part: 'p1' | 'p2', value: string) => {
        const newPairs = [...pairs];
        newPairs[index][part] = value;
        setPairs(newPairs);
    };

    const handleSave = () => {
        const assignedNames = new Set(pairs.flatMap(p => [p.p1.trim(), p.p2.trim()]).filter(Boolean));
        if (assignedNames.size !== 6 || pairs.some(p => !p.p1.trim() || !p.p2.trim() || !p.area)) {
            toast({
                variant: 'destructive',
                title: 'Erro de Validação',
                description: 'Todos os 6 membros devem ser atribuídos a uma dupla e todas as áreas devem ser selecionadas.',
            });
            return;
        }

         if (!customDateTime) {
            toast({
                variant: 'destructive',
                title: 'Data e Hora Inválidas',
                description: 'Por favor, selecione uma data e hora para o sorteio.',
            });
            return;
        }

        const formattedDate = format(new Date(customDateTime), "dd/MM/yyyy HH:mm");

        const newResult: SpinResult = {
            id: crypto.randomUUID(),
            pairs: pairs.map(p => ({
                pair: [p.p1.trim(), p.p2.trim()] as [string, string],
                area: p.area,
            })),
            date: formattedDate,
            source: 'manual',
        };
        onSave(newResult);
        toast({ title: "Sorteio manual registrado!" });
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
                             <Input 
                                id={`p1-${index}`}
                                placeholder="Nome"
                                value={pair.p1}
                                onChange={(e) => handlePairChange(index, 'p1', e.target.value)}
                             />
                        </div>
                        <div>
                            <Label htmlFor={`p2-${index}`}>Dupla {index + 1} (2)</Label>
                             <Input 
                                id={`p2-${index}`}
                                placeholder="Nome"
                                value={pair.p2}
                                onChange={(e) => handlePairChange(index, 'p2', e.target.value)}
                             />
                        </div>
                         <div>
                            <Label htmlFor={`area-${index}`}>Área</Label>
                             <Select value={pair.area} onValueChange={(val) => { const newPairs = [...pairs]; newPairs[index].area = val; setPairs(newPairs);}}>
                                <SelectTrigger id={`area-${index}`}><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {AREAS.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                </SelectContent>
                             </Select>
                        </div>
                    </div>
                ))}
                 <div className="pt-2">
                    <Label htmlFor="datetime-manual">Data e Hora do Sorteio</Label>
                    <Input
                        id="datetime-manual"
                        type="datetime-local"
                        value={customDateTime}
                        onChange={(e) => setCustomDateTime(e.target.value)}
                    />
                </div>
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

    
