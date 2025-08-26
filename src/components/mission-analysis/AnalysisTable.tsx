
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { MissionAnalysisData, InteractiveMissionData } from '@/lib/types';

const initialMissions: MissionAnalysisData[] = [
    { id: 'm01', name: 'Missão 01 - Surface Brushing', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M01.png', area: '1A', driveTrainComplexity: 3, actuatorComplexity: 3, actuator: 'Empurrar e Pegar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Submerged - M14 (Trident)', nearbyMissions: 'Missão 02' },
    { id: 'm02', name: 'Missão 02 - Map Reveal', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M02.png', area: '2A', driveTrainComplexity: 2, actuatorComplexity: 3, actuator: 'Empurrar, Puxar e Pegar', impact: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Masterpiece - M07 e 08', nearbyMissions: 'Missões 01, 03 e 04' },
    { id: 'm03', name: 'Missão 03 - Mineshaft Explorer', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M03.png', area: '3', driveTrainComplexity: 1, actuatorComplexity: 1, actuator: 'Levantar', impact: 40, proximityBonus: 3, similarityBonus: 3, similarMission: 'Submerged - M10', nearbyMissions: 'Missões 02, 04 e 13' },
    { id: 'm04', name: 'Missão 04 - Careful Recovery', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M04.png', area: '3', driveTrainComplexity: 1, actuatorComplexity: 1, actuator: 'Pegar', impact: 40, proximityBonus: 3, similarityBonus: 3, similarMission: 'Submerged - M14 (Seabed Sample)', nearbyMissions: 'Missões 02, 03 e 13' },
    { id: 'm05', name: 'Missão 05 - Who Lived Here?', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M05.png', area: '2B', driveTrainComplexity: 2, actuatorComplexity: 1, actuator: 'Empurrar', impact: 30, proximityBonus: 1, similarityBonus: 2, similarMission: 'Master Piece - M05', nearbyMissions: 'Missões 06 e 07' },
    { id: 'm06', name: 'Missão 06 - Forge', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M06.png', area: '2B', driveTrainComplexity: 2, actuatorComplexity: 2, actuator: 'Abaixar', impact: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Master Piece - M12', nearbyMissions: 'Missões 05, 07 e 08' },
    { id: 'm07', name: 'Missão 07 - Heavy Lifting', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M07.png', area: '2B', driveTrainComplexity: 2, actuatorComplexity: 1, actuator: 'Pegar', impact: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Submerged - M14 (Seabed Sample)', nearbyMissions: 'Missões 05, 06 e 08' },
    { id: 'm08', name: 'Missão 08 - Silo', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M08.png', area: '1B', driveTrainComplexity: 3, actuatorComplexity: 2, actuator: 'Abaixar', impact: 30, proximityBonus: 1, similarityBonus: 2, similarMission: 'Super Powered - M10', nearbyMissions: 'Missões 06 e 07' },
    { id: 'm09', name: "Missão 09 - What's On Sale?", imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M09.png', area: '1B', driveTrainComplexity: 3, actuatorComplexity: 3, actuator: 'Empurrar e Abaixar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Super Powered - M08', nearbyMissions: 'Missão 10' },
    { id: 'm10', name: 'Missão 10 - Tip The Scales', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M10.png', area: '1B', driveTrainComplexity: 3, actuatorComplexity: 3, actuator: 'Empurrar e Pegar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Submerged - M14 (Plankton)', nearbyMissions: 'Missão 09' },
    { id: 'm11', name: 'Missão 11 - Angler Artifacts', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M11.png', area: '1B', driveTrainComplexity: 3, actuatorComplexity: 1, actuator: 'Empurrar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Master Piece - M11', nearbyMissions: 'Missão 12' },
    { id: 'm12', name: 'Missão 12 - Salvage Operation', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M12.png', area: '1A', driveTrainComplexity: 3, actuatorComplexity: 3, actuator: 'Empurrar e Puxar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Cargo Connect - M05', nearbyMissions: 'Missão 11' },
    { id: 'm13', name: 'Missão 13 - Statue Rebuild', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M13.png', area: '3', driveTrainComplexity: 1, actuatorComplexity: 2, actuator: 'Abaixar', impact: 30, proximityBonus: 1, similarityBonus: 1, similarMission: 'Master Piece - M12', nearbyMissions: 'Missão 14' },
    { id: 'm14', name: 'Missão 14 - Forum', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M14.png', area: '3', driveTrainComplexity: 1, actuatorComplexity: 2, actuator: 'Entregar', impact: 35, proximityBonus: 2, similarityBonus: 1, similarMission: 'Cargo Connect - M01', nearbyMissions: 'Missão 13' },
    { id: 'm15', name: 'Missão 15 - Site Marking', imageUrl: 'https://fll-wro.github.io/assets/images/missions_unearthed/M15.png', area: '4', driveTrainComplexity: 1, actuatorComplexity: 3, actuator: 'Entregar e Abaixar', impact: 30, proximityBonus: 1, similarityBonus: 3, similarMission: 'Submerged - M03', nearbyMissions: '-' },
];

const STORAGE_KEY = 'missionAnalysisData';

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
            // In case of error, just use initial data
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

    const handleSliderChange = (id: string, field: keyof MissionAnalysisData, value: number) => {
        setMissions(prevMissions =>
            prevMissions.map(mission =>
                mission.id === id ? { ...mission, [field]: value } : mission
            )
        );
    };

    const processedMissions = useMemo((): InteractiveMissionData[] => {
        const calculatedMissions = missions.map(mission => {
            const effort = mission.driveTrainComplexity * mission.actuatorComplexity;
            const priority = (mission.impact / effort) + mission.proximityBonus + mission.similarityBonus;
            return { ...mission, effort, priority };
        });

        const totalPriority = calculatedMissions.reduce((sum, m) => sum + m.priority, 0);

        return calculatedMissions.map(mission => ({
            ...mission,
            priorityPercentage: totalPriority > 0 ? (mission.priority / totalPriority) * 100 : 0
        })).sort((a, b) => b.priority - a.priority);
    }, [missions]);

    const InteractiveCell = ({ id, field, value }: { id: string, field: keyof MissionAnalysisData, value: number }) => (
        <div className="flex flex-col items-center space-y-2">
            <span className="font-medium">{value}</span>
            <Slider
                value={[value]}
                onValueChange={([val]) => handleSliderChange(id, field, val)}
                min={1}
                max={3}
                step={1}
                className="w-24"
            />
        </div>
    );

    return (
        <div className="w-full overflow-x-auto">
            <Table className="min-w-max bg-card">
                <TableHeader>
                    <TableRow>
                        <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Missão</TableHead>
                        <TableHead className="w-[100px]">Foto</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead className="w-[150px]">Complexidade Locomoção</TableHead>
                        <TableHead>Acionamento</TableHead>
                        <TableHead className="w-[150px]">Complexidade Acionador</TableHead>
                        <TableHead>Esforço</TableHead>
                        <TableHead>Impacto (Pts)</TableHead>
                        <TableHead className="w-[150px]">Bônus Proximidade</TableHead>
                        <TableHead>Missões Próximas</TableHead>
                        <TableHead className="w-[150px]">Bônus Similaridade</TableHead>
                        <TableHead>Missão Parecida</TableHead>
                        <TableHead className="sticky right-0 bg-card z-10 w-[200px]">Priorização</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isClient && processedMissions.map(mission => (
                        <TableRow key={mission.id}>
                            <TableCell className="font-medium sticky left-0 bg-card z-10 w-[200px]">{mission.name}</TableCell>
                            <TableCell className="p-1">
                                <Image src={mission.imageUrl} alt={mission.name} width={80} height={60} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell>{mission.area}</TableCell>
                            <TableCell>
                                <InteractiveCell id={mission.id} field="driveTrainComplexity" value={mission.driveTrainComplexity} />
                            </TableCell>
                            <TableCell>{mission.actuator}</TableCell>
                            <TableCell>
                                <InteractiveCell id={mission.id} field="actuatorComplexity" value={mission.actuatorComplexity} />
                            </TableCell>
                            <TableCell className="font-bold text-center text-lg">{mission.effort}</TableCell>
                            <TableCell className="text-center">{mission.impact}</TableCell>
                            <TableCell>
                                <InteractiveCell id={mission.id} field="proximityBonus" value={mission.proximityBonus} />
                            </TableCell>
                            <TableCell>{mission.nearbyMissions}</TableCell>
                            <TableCell>
                                <InteractiveCell id={mission.id} field="similarityBonus" value={mission.similarityBonus} />
                            </TableCell>
                            <TableCell>{mission.similarMission}</TableCell>
                            <TableCell className="sticky right-0 bg-card z-10 w-[200px]">
                                <div className="flex flex-col items-center space-y-2">
                                    <Badge className="text-lg">{mission.priority.toFixed(2)}</Badge>
                                    <div className="w-full flex items-center gap-2">
                                        <Progress value={mission.priorityPercentage} className="w-full" />
                                        <span className="text-sm font-mono">{mission.priorityPercentage.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
