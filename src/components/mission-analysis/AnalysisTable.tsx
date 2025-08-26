
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MissionAnalysisData, InteractiveMissionData } from '@/lib/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

const initialMissions: MissionAnalysisData[] = [
    { id: 'm01', name: 'M01 - Surface Brushing', area: '1A', actuator: 'Empurrar e Pegar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Submerged - M14 (Trident)', nearbyMissions: 'Missão 02' },
    { id: 'm02', name: 'M02 - Map Reveal', area: '2A', actuator: 'Empurrar, Puxar e Pegar', missionPoints: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Masterpiece - M07 e 08', nearbyMissions: 'Missões 01, 03 e 04' },
    { id: 'm03', name: 'M03 - Mineshaft Explorer', area: '3', actuator: 'Levantar', missionPoints: 40, proximityBonus: 3, similarityBonus: 3, similarMission: 'Submerged - M10', nearbyMissions: 'Missões 02, 04 e 13' },
    { id: 'm04', name: 'M04 - Careful Recovery', area: '3', actuator: 'Pegar', missionPoints: 40, proximityBonus: 3, similarityBonus: 3, similarMission: 'Submerged - M14 (Seabed Sample)', nearbyMissions: 'Missões 02, 03 e 13' },
    { id: 'm05', name: 'M05 - Who Lived Here?', area: '2B', actuator: 'Empurrar', missionPoints: 30, proximityBonus: 1, similarityBonus: 2, similarMission: 'Master Piece - M05', nearbyMissions: 'Missões 06 e 07' },
    { id: 'm06', name: 'M06 - Forge', area: '2B', actuator: 'Abaixar', missionPoints: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Master Piece - M12', nearbyMissions: 'Missões 05, 07 e 08' },
    { id: 'm07', name: 'M07 - Heavy Lifting', area: '2B', actuator: 'Pegar', missionPoints: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Submerged - M14 (Seabed Sample)', nearbyMissions: 'Missões 05, 06 e 08' },
    { id: 'm08', name: 'M08 - Silo', area: '1B', actuator: 'Abaixar', missionPoints: 30, proximityBonus: 1, similarityBonus: 2, similarMission: 'Super Powered - M10', nearbyMissions: 'Missões 06 e 07' },
    { id: 'm09', name: "M09 - What's On Sale?", area: '1B', actuator: 'Empurrar e Abaixar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Super Powered - M08', nearbyMissions: 'Missão 10' },
    { id: 'm10', name: 'M10 - Tip The Scales', area: '1B', actuator: 'Empurrar e Pegar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Submerged - M14 (Plankton)', nearbyMissions: 'Missão 09' },
    { id: 'm11', name: 'M11 - Angler Artifacts', area: '1B', actuator: 'Empurrar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Master Piece - M11', nearbyMissions: 'Missão 12' },
    { id: 'm12', name: 'M12 - Salvage Operation', area: '1A', actuator: 'Empurrar e Puxar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Cargo Connect - M05', nearbyMissions: 'Missão 11' },
    { id: 'm13', name: 'M13 - Statue Rebuild', area: '3', actuator: 'Abaixar', missionPoints: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Master Piece - M12', nearbyMissions: 'Missão 14' },
    { id: 'm14', name: 'M14 - Forum', area: '3', actuator: 'Entregar', missionPoints: 35, proximityBonus: 2, similarityBonus: 1, similarMission: 'Cargo Connect - M01', nearbyMissions: 'Missão 13' },
    { id: 'm15', name: 'M15 - Site Marking', area: '4', actuator: 'Entregar e Abaixar', missionPoints: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Submerged - M03', nearbyMissions: '-' },
];

const STORAGE_KEY = 'missionAnalysisData_v2';

export default function AnalysisTable() {
    const [missions, setMissions] = useState<MissionAnalysisData[]>(initialMissions);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                setMissions(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
            } catch (error) {
                console.error("Failed to save data to localStorage", error);
            }
        }
    }, [missions, isClient]);

    const handleFieldChange = (id: string, field: keyof MissionAnalysisData, value: string | number) => {
        setMissions(prevMissions =>
            prevMissions.map(mission =>
                mission.id === id ? { ...mission, [field]: value } : mission
            )
        );
    };

    const handleAddMission = () => {
        const newMission: MissionAnalysisData = {
            id: crypto.randomUUID(),
            name: 'Nova Missão',
            area: '',
            actuator: '',
            missionPoints: 0,
            proximityBonus: 1,
            similarityBonus: 1,
            similarMission: '',
            nearbyMissions: '',
        };
        setMissions(prev => [...prev, newMission]);
    };

    const handleDeleteMission = (id: string) => {
        setMissions(prev => prev.filter(m => m.id !== id));
    };

    const calculateDriveTrainComplexity = useCallback((area: string): number => {
        const normalizedArea = area.toUpperCase().trim();
        if (normalizedArea.startsWith('1')) return 3;
        if (normalizedArea.startsWith('2')) return 2;
        if (normalizedArea.startsWith('3') || normalizedArea.startsWith('4')) return 1;
        return 1; // Default
    }, []);

    const calculateActuatorComplexity = useCallback((actuator: string): number => {
        const lowerActuator = actuator.toLowerCase();
        if (lowerActuator.includes('e') || lowerActuator.includes('&') || lowerActuator.includes(',')) return 3;
        if (['abaixar', 'puxar', 'entregar'].some(term => lowerActuator.includes(term))) return 2;
        return 1;
    }, []);
    
    const calculateImpact = useCallback((points: number): number => {
        if (points >= 40) return 3;
        if (points >= 35) return 2;
        if (points >= 30) return 1;
        return 1;
    }, []);

    const processedMissions = useMemo((): InteractiveMissionData[] => {
        const calculatedMissions = missions.map(mission => {
            const driveTrainComplexity = calculateDriveTrainComplexity(mission.area);
            const actuatorComplexity = calculateActuatorComplexity(mission.actuator);
            const effort = driveTrainComplexity * actuatorComplexity;
            const impact = calculateImpact(mission.missionPoints);
            const priority = (impact / effort) + mission.proximityBonus + mission.similarityBonus;
            return { ...mission, driveTrainComplexity, actuatorComplexity, effort, impact, priority };
        });

        const totalPriority = calculatedMissions.reduce((sum, m) => sum + m.priority, 0);

        return calculatedMissions.map(mission => ({
            ...mission,
            priorityPercentage: totalPriority > 0 ? (mission.priority / totalPriority) * 100 : 0
        })).sort((a, b) => b.priority - a.priority);
    }, [missions, calculateDriveTrainComplexity, calculateActuatorComplexity, calculateImpact]);

    const EditableCell = ({ id, field, value }: { id: string, field: keyof MissionAnalysisData, value: string | number }) => (
        <Input
            value={value}
            onChange={(e) => handleFieldChange(id, field, (typeof value === 'number' && e.target.value !== '') ? parseFloat(e.target.value) : e.target.value)}
            type={typeof value === 'number' ? 'number' : 'text'}
            className="w-full min-w-[100px] text-center bg-secondary/30 focus:bg-background"
        />
    );

    return (
        <div className="w-full overflow-x-auto">
            <Table className="min-w-max bg-card">
                <TableHeader>
                    <TableRow>
                        <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Missão</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead>C. Locomoção</TableHead>
                        <TableHead>Acionamento</TableHead>
                        <TableHead>C. Acionador</TableHead>
                        <TableHead>Esforço</TableHead>
                        <TableHead>Pontos Missão</TableHead>
                        <TableHead>Impacto</TableHead>
                        <TableHead>Bônus Proximidade</TableHead>
                        <TableHead>Missões Próximas</TableHead>
                        <TableHead>Bônus Similaridade</TableHead>
                        <TableHead>Missão Parecida</TableHead>
                        <TableHead className="sticky right-0 bg-card z-20 w-[200px] text-center">Priorização</TableHead>
                        <TableHead className="sticky right-0 bg-card z-10 w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isClient && processedMissions.map(mission => (
                        <TableRow key={mission.id}>
                            <TableCell className="font-medium sticky left-0 bg-card z-10 w-[200px]">
                                <EditableCell id={mission.id} field="name" value={mission.name} />
                            </TableCell>
                            <TableCell><EditableCell id={mission.id} field="area" value={mission.area} /></TableCell>
                            <TableCell className="font-bold text-center text-lg">{mission.driveTrainComplexity}</TableCell>
                            <TableCell><EditableCell id={mission.id} field="actuator" value={mission.actuator} /></TableCell>
                            <TableCell className="font-bold text-center text-lg">{mission.actuatorComplexity}</TableCell>
                            <TableCell className="font-bold text-center text-lg">{mission.effort}</TableCell>
                            <TableCell><EditableCell id={mission.id} field="missionPoints" value={mission.missionPoints} /></TableCell>
                            <TableCell className="font-bold text-center text-lg">{mission.impact}</TableCell>
                            <TableCell><EditableCell id={mission.id} field="proximityBonus" value={mission.proximityBonus} /></TableCell>
                            <TableCell><EditableCell id={mission.id} field="nearbyMissions" value={mission.nearbyMissions} /></TableCell>
                            <TableCell><EditableCell id={mission.id} field="similarityBonus" value={mission.similarityBonus} /></TableCell>
                            <TableCell><EditableCell id={mission.id} field="similarMission" value={mission.similarMission} /></TableCell>
                            <TableCell className="sticky right-[50px] bg-card z-10 w-[200px]">
                                <div className="flex flex-col items-center space-y-2">
                                    <Badge className="text-lg">{mission.priority.toFixed(2)}</Badge>
                                    <div className="w-full flex items-center gap-2">
                                        <Progress value={mission.priorityPercentage} className="w-full" />
                                        <span className="text-sm font-mono">{mission.priorityPercentage.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="sticky right-0 bg-card z-10 w-[50px]">
                                 <Button variant="ghost" size="icon" onClick={() => handleDeleteMission(mission.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <div className="p-4">
                <Button onClick={handleAddMission}>
                    <PlusCircle className="mr-2" />
                    Adicionar Missão
                </Button>
            </div>
        </div>
    );
}
