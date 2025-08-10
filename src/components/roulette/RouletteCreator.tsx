"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import Roulette from './Roulette';

interface RouletteOption {
  id: string;
  name: string;
}

interface RouletteConfig {
  id: string;
  title: string;
  options: RouletteOption[];
}

export default function RouletteCreator() {
  const [roulettes, setRoulettes] = useState<RouletteConfig[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedRoulettes = localStorage.getItem('customRoulettes');
    if (savedRoulettes) {
      setRoulettes(JSON.parse(savedRoulettes));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('customRoulettes', JSON.stringify(roulettes));
    }
  }, [roulettes, isClient]);

  const handleAddRoulette = () => {
    const newRoulette: RouletteConfig = {
      id: crypto.randomUUID(),
      title: 'Nova Roleta',
      options: [],
    };
    setRoulettes([...roulettes, newRoulette]);
  };

  const handleDeleteRoulette = (rouletteId: string) => {
    setRoulettes(roulettes.filter(r => r.id !== rouletteId));
  }

  const handleUpdateRoulette = (updatedRoulette: RouletteConfig) => {
    setRoulettes(roulettes.map(r => r.id === updatedRoulette.id ? updatedRoulette : r));
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Crie suas Roletas</CardTitle>
                <CardDescription>Adicione roletas personalizadas para qualquer tipo de sorteio que precisar.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={handleAddRoulette}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Roleta Personalizada
                </Button>
            </CardContent>
        </Card>
        
        {roulettes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {roulettes.map(roulette => (
                    <RouletteEditor 
                        key={roulette.id} 
                        roulette={roulette}
                        onDelete={handleDeleteRoulette}
                        onUpdate={handleUpdateRoulette}
                    />
                ))}
            </div>
        )}
    </div>
  );
}


interface RouletteEditorProps {
    roulette: RouletteConfig;
    onDelete: (rouletteId: string) => void;
    onUpdate: (roulette: RouletteConfig) => void;
}

function RouletteEditor({ roulette, onDelete, onUpdate }: RouletteEditorProps) {
    const [title, setTitle] = useState(roulette.title);
    const [options, setOptions] = useState(roulette.options);
    const [newOption, setNewOption] = useState('');

    const handleUpdate = (newTitle: string, newOptions: RouletteOption[]) => {
        onUpdate({ ...roulette, title: newTitle, options: newOptions });
    }

    const handleAddOption = () => {
        if (newOption.trim()) {
            const updatedOptions = [...options, { id: crypto.randomUUID(), name: newOption.trim() }];
            setOptions(updatedOptions);
            handleUpdate(title, updatedOptions);
            setNewOption('');
        }
    };

    const handleRemoveOption = (optionId: string) => {
        const updatedOptions = options.filter(o => o.id !== optionId);
        setOptions(updatedOptions);
        handleUpdate(title, updatedOptions);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }
    
    const handleTitleBlur = () => {
        handleUpdate(title, options);
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className='flex-row items-center justify-between'>
                <Input 
                    value={title} 
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    className="text-lg font-bold border-0 shadow-none focus-visible:ring-1" 
                />
                 <Button variant="ghost" size="icon" onClick={() => onDelete(roulette.id)}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <span className="sr-only">Excluir roleta</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <div className="flex gap-2">
                    <Input 
                        value={newOption} 
                        onChange={(e) => setNewOption(e.target.value)} 
                        placeholder="Adicionar nome"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                    />
                    <Button onClick={handleAddOption} disabled={!newOption.trim()}>Adicionar</Button>
                </div>
                <div className="space-y-2">
                    {options.map(option => (
                        <div key={option.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                            <span>{option.name}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(option.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">Remover opção</span>
                            </Button>
                        </div>
                    ))}
                     {options.length === 0 && <p className="text-sm text-center text-muted-foreground pt-4">Adicione opções para girar a roleta.</p>}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-center">
                 <Roulette options={options.map(o => o.name)} />
            </CardFooter>
        </Card>
    );
}
