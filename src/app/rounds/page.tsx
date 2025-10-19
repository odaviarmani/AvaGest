
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import RoundsTimer, { StageTime } from "@/components/rounds/RoundsTimer";
import ScoreCalculator from "@/components/rounds/ScoreCalculator";
import RoundLog, { RoundData } from "@/components/rounds/RoundLog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MissionState, initialMissionState } from "@/lib/types";

const TOTAL_SECONDS = 150; // 2 minutes and 30 seconds

export default function RoundsPage() {
  const [timerSeconds, setTimerSeconds] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [stageTimings, setStageTimings] = useState<StageTime[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [missions, setMissions] = useState<MissionState>(initialMissionState);
  const [numberOfSaidas, setNumberOfSaidas] = useState(6);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);
    const savedNumberOfSaidas = localStorage.getItem('numberOfSaidas');
    if (savedNumberOfSaidas) {
        setNumberOfSaidas(Number(savedNumberOfSaidas));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('numberOfSaidas', String(numberOfSaidas));
    }
  }, [numberOfSaidas, isClient]);


  const stageNames = useMemo(() => {
    const names = [];
    for (let i = 1; i <= numberOfSaidas; i++) {
        names.push(`Saída ${i}`);
        if (i < numberOfSaidas) {
            names.push(`Troca de anexo ${i}-${i + 1}`);
        }
    }
    return names;
  }, [numberOfSaidas]);
  
  useEffect(() => {
    setMissions(prev => {
        const newMissionsPerSaida: MissionState['missionsPerSaida'] = {};
        for(let i = 1; i <= numberOfSaidas; i++) {
            const saidaKey = `saida${i}` as const;
            newMissionsPerSaida[saidaKey] = prev.missionsPerSaida[saidaKey] || {
                m01_surface_brushing: { soil_deposits_cleaned: 0, brush_not_touching: false },
                m02_map_reveal: false,
                m03_mine_shaft_explorer: false,
                m04_careful_retrieval: false,
                m05_who_lived_here: false,
                m06_forge: false,
                m07_heavy_lifting: false,
                m08_silo: false,
                m09_whats_on_sale: false,
                m10_tip_the_scales: false,
                m11_fisher_artifacts: false,
                m12_salvage_operation: false,
                m13_statue_reconstruction: false,
                m14_forum: { artifacts: 0 },
                m15_site_marking: false,
            };
        }
        return { ...prev, missionsPerSaida: newMissionsPerSaida };
    });
  }, [numberOfSaidas]);


  const calculateScore = useCallback((state: MissionState): number => {
    let score = 0;
    if (state.m00_equipment_inspection) score += 20;

    const completedMissions = new Set();
    const soilDepositsCleaned = { total: 0 };
    const forumArtifacts = { total: 0 };

    for (const saidaKey in state.missionsPerSaida) {
        const saida = state.missionsPerSaida[saidaKey as keyof typeof state.missionsPerSaida];
        if(!saida) continue;

        if (saida.m01_surface_brushing) {
            soilDepositsCleaned.total = Math.max(soilDepositsCleaned.total, saida.m01_surface_brushing.soil_deposits_cleaned);
            if(saida.m01_surface_brushing.brush_not_touching && !completedMissions.has('m01_brush')) {
                score += 10;
                completedMissions.add('m01_brush');
            }
        }
        if (saida.m02_map_reveal && !completedMissions.has('m02')) { score += 30; completedMissions.add('m02'); }
        if (saida.m03_mine_shaft_explorer && !completedMissions.has('m03')) { score += 40; completedMissions.add('m03'); }
        if (saida.m04_careful_retrieval && !completedMissions.has('m04')) { score += 40; completedMissions.add('m04'); }
        if (saida.m05_who_lived_here && !completedMissions.has('m05')) { score += 30; completedMissions.add('m05'); }
        if (saida.m06_forge && !completedMissions.has('m06')) { score += 30; completedMissions.add('m06'); }
        if (saida.m07_heavy_lifting && !completedMissions.has('m07')) { score += 30; completedMissions.add('m07'); }
        if (saida.m08_silo && !completedMissions.has('m08')) { score += 30; completedMissions.add('m08'); }
        if (saida.m09_whats_on_sale && !completedMissions.has('m09')) { score += 30; completedMissions.add('m09'); }
        if (saida.m10_tip_the_scales && !completedMissions.has('m10')) { score += 30; completedMissions.add('m10'); }
        if (saida.m11_fisher_artifacts && !completedMissions.has('m11')) { score += 30; completedMissions.add('m11'); }
        if (saida.m12_salvage_operation && !completedMissions.has('m12')) { score += 30; completedMissions.add('m12'); }
        if (saida.m13_statue_reconstruction && !completedMissions.has('m13')) { score += 30; completedMissions.add('m13'); }
        if (saida.m14_forum) {
            forumArtifacts.total = Math.max(forumArtifacts.total, saida.m14_forum.artifacts);
        }
        if (saida.m15_site_marking && !completedMissions.has('m15')) { score += 30; completedMissions.add('m15'); }
    }
    
    score += soilDepositsCleaned.total * 10;
    score += forumArtifacts.total * 5;

    const tokens = state.precision_tokens;
    if (tokens >= 5) score += 50;
    else if (tokens === 4) score += 35;
    else if (tokens === 3) score += 25;
    else if (tokens === 2) score += 15;
    else if (tokens === 1) score += 10;
    return score;
  }, []);

  const totalScore = useMemo(() => calculateScore(missions), [missions, calculateScore]);

  const handleResetAll = useCallback(() => {
    setIsActive(false);
    setTimerSeconds(TOTAL_SECONDS);
    setStageTimings([]);
    setCurrentStageIndex(0);
    setMissions(initialMissionState);
  }, []);

  const isRoundFinished = currentStageIndex === stageNames.length - 1 && stageTimings[stageNames.length - 1]?.duration !== null && !isActive;

  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rounds</h1>
          <p className="text-muted-foreground">
            Acompanhe os dados e a evolução dos rounds.
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/rounds/stats">
                    <BarChart className="mr-2 h-4 w-4" />
                    Ver Estatísticas
                </Link>
            </Button>
        </div>
      </header>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="num-saidas">Quantidade de Saídas</Label>
                    <Select
                        value={String(numberOfSaidas)}
                        onValueChange={(val) => {
                            setNumberOfSaidas(Number(val));
                        }}
                        disabled={isActive || stageTimings.length > 0}
                    >
                        <SelectTrigger id="num-saidas">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                <SelectItem key={num} value={String(num)}>{num} Saídas</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <RoundsTimer 
                    seconds={timerSeconds}
                    setSeconds={setTimerSeconds}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    stageTimings={stageTimings}
                    setStageTimings={setStageTimings}
                    currentStageIndex={currentStageIndex}
                    setCurrentStageIndex={setCurrentStageIndex}
                    totalSeconds={TOTAL_SECONDS}
                    stageNames={stageNames}
                />
            </div>
            <div className="md:col-span-1">
            <ScoreCalculator 
                missions={missions}
                setMissions={setMissions}
                totalScore={totalScore}
                stageNames={stageNames}
            />
            </div>
            <div className="md:col-span-1">
            <RoundLog 
                score={totalScore}
                timings={stageTimings}
                isRoundFinished={isRoundFinished}
                onRegisterNewRound={handleResetAll}
                missionsState={missions}
            />
            </div>
        </div>
      </div>
    </div>
  );
}

    
