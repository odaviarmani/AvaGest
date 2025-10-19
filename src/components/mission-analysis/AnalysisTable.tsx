
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mission, MissionAnalysisData } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

const STORAGE_KEY_ANALYSIS = 'missionAnalysisData_v2';
const STORAGE_KEY_MISSIONS = 'missions';

export default function AnalysisTable() {
    const [analysisData, setAnalysisData] = useState<MissionAnalysisData[]>([]);
    const [allMissions, setAllMissions] = useState<Mission[]>([]);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        try {
            const savedData = localStorage.getItem(STORAGE_KEY_ANALYSIS);
            if (savedData) {
                setAnalysisData(JSON.parse(savedData));
            } else {
                 setAnalysisData([{ id: crypto.randomUUID(), saidaName: 'Saída 1', missionIds: [] }]);
            }

            const savedMissions = localStorage.getItem(STORAGE_KEY_MISSIONS);
            if(savedMissions) {
                setAllMissions(JSON.parse(savedMissions));
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    const handleSave = () => {
        try {
            localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(analysisData));
            toast({
                title: "Configuração Salva!",
                description: "A associação de missões por saída foi salva com sucesso.",
            });
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
            toast({
                variant: 'destructive',
                title: "Erro ao Salvar",
                description: "Não foi possível salvar a configuração.",
            });
        }
    };
    
    const handleAddSaida = () => {
        const nextSaidaNumber = analysisData.length + 1;
        const newSaida: MissionAnalysisData = {
            id: crypto.randomUUID(),
            saidaName: `Saída ${nextSaidaNumber}`,
            missionIds: [],
        };
        setAnalysisData(prev => [...prev, newSaida]);
    };

    const handleDeleteSaida = (id: string) => {
        setAnalysisData(prev => prev.filter(m => m.id !== id));
    };

    const handleMissionSelectionChange = (saidaId: string, missionId: string, checked: boolean) => {
        setAnalysisData(prevData =>
            prevData.map(saida => {
                if (saida.id === saidaId) {
                    const newMissionIds = checked
                        ? [...saida.missionIds, missionId]
                        : saida.missionIds.filter(id => id !== missionId);
                    return { ...saida, missionIds: newMissionIds };
                }
                return saida;
            })
        );
    };

    const getMissionNameById = (missionId: string) => {
        return allMissions.find(m => m.id === missionId)?.name || 'Missão desconhecida';
    }


    if (!isClient) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-2">
                 <Button onClick={handleAddSaida}>
                    <PlusCircle className="mr-2" />
                    Adicionar Saída
                </Button>
                <Button onClick={handleSave}>
                    <Save className="mr-2"/>
                    Salvar Configuração
                </Button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysisData.map((saida, index) => (
                    <Card key={saida.id}>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>
                                <Select
                                    value={saida.saidaName}
                                    onValueChange={(newName) => {
                                        const newData = [...analysisData];
                                        newData[index].saidaName = newName;
                                        setAnalysisData(newData);
                                    }}
                                >
                                    <SelectTrigger className="text-lg font-bold border-0 shadow-none -ml-3 w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => `Saída ${i + 1}`).map(name => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardTitle>
                             <Button variant="ghost" size="icon" onClick={() => handleDeleteSaida(saida.id)}>
                                <Trash2 className="w-5 h-5 text-destructive" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                             <ScrollArea className="h-64">
                                <div className="space-y-2 pr-4">
                                {allMissions.length > 0 ? allMissions.map(mission => (
                                    <div key={mission.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                                        <Checkbox
                                            id={`${saida.id}-${mission.id}`}
                                            checked={saida.missionIds.includes(mission.id)}
                                            onCheckedChange={(checked) => handleMissionSelectionChange(saida.id, mission.id, !!checked)}
                                        />
                                        <label
                                            htmlFor={`${saida.id}-${mission.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {mission.name}
                                        </label>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">
                                        Nenhuma missão cadastrada. Adicione missões na aba "Missões" para começar.
                                    </p>
                                )}
                                </div>
                             </ScrollArea>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
