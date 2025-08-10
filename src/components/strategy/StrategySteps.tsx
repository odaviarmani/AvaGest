"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '../ui/scroll-area';

export interface Instruction {
  step: number;
  action: string;
  value: string;
}

interface StrategyStepsProps {
  instructions: Instruction[];
}

export default function StrategySteps({ instructions }: StrategyStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pseudocódigo</CardTitle>
        <CardDescription>
            Pseudocódigo gerado a partir do desenho para o robô.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] border rounded-md">
            <Table>
                <TableHeader className="sticky top-0 bg-muted">
                    <TableRow>
                    <TableHead className="w-[80px]">Passo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {instructions.length > 0 ? (
                        instructions.map((instruction) => (
                            <TableRow key={instruction.step}>
                            <TableCell className="font-medium">{instruction.step}</TableCell>
                            <TableCell>{instruction.action}</TableCell>
                            <TableCell className="text-right font-mono">{instruction.value}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Comece a desenhar no mapa para ver as instruções aqui.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
