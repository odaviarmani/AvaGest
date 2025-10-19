
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
  
  const calculateScore = useCallback((state: MissionState): number => {
    let score = 0;
    if (state.m00_equipment_inspection) score += 20;

    const m = state.missionsPerSaida.saida1; // Always use saida1 for calculation

    if (m) {
        score += m.m01_surface_brushing.soil_deposits_cleaned * 10;
        if (m.m01_surface_brushing.brush_not_touching) score += 10;
        if (m.m02_map_reveal) score += 30;
        if (m.m03_mine_shaft_explorer) score += 40;
        if (m.m04_careful_retrieval) score += 40;
        if (m.m05_who_lived_here) score += 30;
        if (m.m06_forge) score += 30;
        if (m.m07_heavy_lifting) score += 30;
        if (m.m08_silo) score += 30;
        if (m.m09_whats_on_sale) score += 30;
        if (m.m10_tip_the_scales) score += 30;
        if (m.m11_fisher_artifacts) score += 30;
        if (m.m12_salvage_operation) score += 30;
        if (m.m13_statue_reconstruction) score += 30;
        score += m.m14_forum.artifacts * 5;
        score += m.m15_site_marking.locations * 10;
    }
    
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

    