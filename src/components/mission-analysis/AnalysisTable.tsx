
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Mission } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';

type AnalysisData = Record<string, {
    priority: string;
    consistency: string;
    avgTime: string;
    points: string;
}>;

const STORAGE_KEY_ANALYSIS = 'missionAnalysisData'; // Renamed to avoid conflicts
const STORAGE_KEY_MISSIONS = 'missions';

export default function AnalysisTable() {
    const [analysisData, setAnalysisData] = useState<AnalysisData>({});
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        try {
            const savedData = localStorage.getItem(STORAGE_KEY_ANALYSIS);
            if (savedData) {
                setAnalysisData(JSON.parse(savedData));
            }

            const savedMissions = localStorage.getItem(STORAGE_KEY_MISSIONS);
            if (savedMissions) {
                setMissions(JSON.parse(savedMissions));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    const handleDataChange = (missionId: string, field: keyof AnalysisData[string], value: string) => {
        const newData = {
            ...analysisData,
            [missionId]: {
                ...analysisData[missionId],
                [field]: value,
            },
        };
        setAnalysisData(newData);
        localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(newData));
    };
    
    if (!isClient) {
        return <div>Carregando...</div>;
    }

    if (missions.length === 0) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[40vh]">
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Nenhuma missão encontrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Adicione missões na aba "Missões" para começar a análise.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="border rounded-lg">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px]">Missão</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Consistência (%)</TableHead>
                        <TableHead>Tempo Médio (s)</TableHead>
                        <TableHead>Pontos</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {missions.map(mission => (
                        <TableRow key={mission.id}>
                            <TableCell className="font-medium">{mission.name}</TableCell>
                            <TableCell>
                                <Input
                                    value={analysisData[mission.id]?.priority || ''}
                                    onChange={e => handleDataChange(mission.id, 'priority', e.target.value)}
                                    className="w-24"
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={analysisData[mission.id]?.consistency || ''}
                                    onChange={e => handleDataChange(mission.id, 'consistency', e.target.value)}
                                     className="w-24"
                                />
                            </TableCell>
                            <TableCell>
                                 <Input
                                    value={analysisData[mission.id]?.avgTime || ''}
                                    onChange={e => handleDataChange(mission.id, 'avgTime', e.target.value)}
                                     className="w-24"
                                />
                            </TableCell>
                            <TableCell>
                                 <Input
                                    value={analysisData[mission.id]?.points || mission.points}
                                    onChange={e => handleDataChange(mission.id, 'points', e.target.value)}
                                     className="w-24"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
