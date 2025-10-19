
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Mission, MissionAnalysisData, missionStepDetails, MissionStepDetail, MissionSelection } from '@/lib/types';
import { Button } from '../ui/button';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

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
                const parsedData = JSON.parse(savedData);
                // Ensure data has the correct structure
                if (Array.isArray(parsedData) && parsedData.every(item => 'id' in item && 'saidaName' in item && 'missions' in item)) {
                     setAnalysisData(parsedData);
                } else {
                    setAnalysisData([{ id: crypto.randomUUID(), saidaName: 'Saída 1', missions: [] }]);
                }
            } else {
                 setAnalysisData([{ id: crypto.randomUUID(), saidaName: 'Saída 1', missions: [] }]);
            }

            const savedMissions = localStorage.getItem(STORAGE_KEY_MISSIONS);
            if(savedMissions) {
                setAllMissions(JSON.parse(savedMissions));
            }

        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setAnalysisData([{ id: crypto.randomUUID(), saidaName: 'Saída 1', missions: [] }]);
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
            missions: [],
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
                    const existingMissions = saida.missions || [];
                    const newMissions = checked
                        ? [...existingMissions, { missionId }]
                        : existingMissions.filter(m => m.missionId !== missionId);
                    return { ...saida, missions: newMissions };
                }
                return saida;
            })
        );
    };

    const handleStepChange = (saidaId: string, missionId: string, steps: number) => {
         setAnalysisData(prevData =>
            prevData.map(saida => {
                if (saida.id === saidaId) {
                    const newMissions = (saida.missions || []).map(m => 
                        m.missionId === missionId ? { ...m, steps } : m
                    );
                    return { ...saida, missions: newMissions };
                }
                return saida;
            })
        );
    };

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
                {analysisData.map((saida, index) => {
                     const missionConfig = saida.missions || [];
                    return (
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
                             <ScrollArea className="h-72">
                                <div className="space-y-4 pr-4">
                                {allMissions.length > 0 ? allMissions.map(mission => {
                                    const isSelected = missionConfig.some(m => m.missionId === mission.id);
                                    const missionKey = mission.name.split(" ")[0].toLowerCase().replace('m', 'm');
                                    const stepDetail = missionStepDetails[missionKey as keyof typeof missionStepDetails];
                                    const currentSteps = missionConfig.find(m => m.missionId === mission.id)?.steps;

                                    return (
                                    <div key={mission.id} className="p-2 rounded-md hover:bg-muted/50 border space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${saida.id}-${mission.id}`}
                                                checked={isSelected}
                                                onCheckedChange={(checked) => handleMissionSelectionChange(saida.id, mission.id, !!checked)}
                                            />
                                            <label
                                                htmlFor={`${saida.id}-${mission.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {mission.name}
                                            </label>
                                        </div>
                                        {isSelected && stepDetail && (
                                            <div className="pl-6 space-y-1">
                                                <Label className="text-xs">{stepDetail.label}: {currentSteps ?? 0}</Label>
                                                <Slider
                                                    value={[currentSteps ?? 0]}
                                                    max={stepDetail.max}
                                                    step={1}
                                                    onValueChange={([val]) => handleStepChange(saida.id, mission.id, val)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}) : (
                                    <p className="text-sm text-muted-foreground text-center p-4">
                                        Nenhuma missão cadastrada. Adicione missões na aba "Missões" para começar.
                                    </p>
                                )}
                                </div>
                             </ScrollArea>
                        </CardContent>
                    </Card>
                )})}
            </div>
        </div>
    );
}
