"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface RubricItem {
    id: string;
    criterion: string;
}

interface RubricTableProps {
    title: string;
    data: RubricItem[];
    storageKey: string;
}

const LEVELS = [1, 2, 3, 4];
const LEVEL_LABELS = ["Iniciante", "Em Desenvolvimento", "Realizado", "Excede"];

export default function RubricTable({ title, data, storageKey }: RubricTableProps) {
    const [scores, setScores] = useState<Record<string, number>>({});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedScores = localStorage.getItem(storageKey);
        if (savedScores) {
            setScores(JSON.parse(savedScores));
        }
    }, [storageKey]);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem(storageKey, JSON.stringify(scores));
        }
    }, [scores, storageKey, isClient]);

    const handleScoreChange = (criterionId: string, value: string) => {
        setScores(prev => ({
            ...prev,
            [criterionId]: parseInt(value, 10),
        }));
    };
    
    const handleReset = () => {
        setScores({});
    }

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxScore = data.length * 4;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Critério</TableHead>
                            <TableHead className="text-center">Nível (1-4)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium align-top py-4">{item.criterion}</TableCell>
                                <TableCell className="align-middle">
                                    <RadioGroup
                                        value={scores[item.id]?.toString()}
                                        onValueChange={(value) => handleScoreChange(item.id, value)}
                                        className="flex justify-around items-center"
                                    >
                                        {LEVELS.map(level => (
                                            <div key={level} className="flex flex-col items-center space-y-1">
                                                <Label htmlFor={`${storageKey}-${item.id}-${level}`} className="text-xs text-muted-foreground">{LEVEL_LABELS[level-1]}</Label>
                                                <RadioGroupItem value={level.toString()} id={`${storageKey}-${item.id}-${level}`} />
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="flex-col items-end gap-4">
                <div className="text-lg font-bold">
                    Pontuação Total: <span className="text-primary">{totalScore} / {maxScore}</span>
                </div>
                 <Button variant="destructive" size="sm" onClick={handleReset}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetar Pontuações
                </Button>
            </CardFooter>
        </Card>
    );
}
