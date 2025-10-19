
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';
import { MissionState, initialMissionState } from '@/lib/types';


interface ScoreCalculatorProps {
    missions: MissionState;
    setMissions: React.Dispatch<React.SetStateAction<MissionState>>;
    totalScore: number;
    stageNames: string[];
}


export default function ScoreCalculator({ missions, setMissions, totalScore, stageNames }: ScoreCalculatorProps) {

  const handleReset = () => {
    setMissions(initialMissionState);
  };

  const MissionCheckbox = ({ id, label, checked, onCheckedChange, disabled = false }: { id: string; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Label htmlFor={id} className={`cursor-pointer ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
    </div>
  );
  
  const saidaStages = stageNames.filter(name => name.startsWith("Saída"));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>Pontuação do Round</span>
            <span className="text-2xl font-bold text-primary">{totalScore}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto pr-2">
        <Accordion type="multiple" className="w-full" defaultValue={['saida-1', 'm00', 'precision']}>
            <AccordionItem value="m00">
                <AccordionTrigger>Inspeção de Equipamentos (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m00" label="Robô + equipamentos cabem na área" checked={missions.m00_equipment_inspection} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m00_equipment_inspection: checked }))} />
                </AccordionContent>
            </AccordionItem>
            
            {saidaStages.map((saidaName, saidaIndex) => {
                const saidaKey = `saida${saidaIndex + 1}` as keyof MissionState['missionsPerSaida'];
                const saidaMissions = missions.missionsPerSaida[saidaKey];
                
                if (!saidaMissions) return null;

                return (
                    <AccordionItem key={saidaKey} value={saidaKey}>
                        <AccordionTrigger>{saidaName}</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                           <h4 className="font-semibold text-center text-muted-foreground -mt-2">Missões da {saidaName}</h4>
                           
                            {Object.keys(saidaMissions).map(missionKey => {
                                const missionId = missionKey as keyof typeof saidaMissions;
                                
                                // Render simple checkbox for boolean missions
                                if (typeof saidaMissions[missionId] === 'boolean') {
                                    return (
                                        <MissionCheckbox 
                                            key={missionId}
                                            id={`${saidaKey}-${missionId}`}
                                            label={`Completou ${missionId}?`} 
                                            checked={saidaMissions[missionId] as boolean}
                                            onCheckedChange={(checked) => setMissions(prev => ({
                                                ...prev,
                                                missionsPerSaida: {
                                                    ...prev.missionsPerSaida,
                                                    [saidaKey]: {
                                                        ...prev.missionsPerSaida[saidaKey],
                                                        [missionId]: checked,
                                                    }
                                                }
                                            }))}
                                        />
                                    );
                                }
                                
                                // Special rendering for complex missions
                                if (missionId === 'm01_surface_brushing') {
                                    const m = saidaMissions[missionId];
                                    return (
                                         <div key={missionId} className="p-2 border rounded space-y-2">
                                            <p className="font-medium text-sm">M01 – Escovação de Superfícies</p>
                                            <div>
                                                <Label>Depósitos de solo limpos: {m.soil_deposits_cleaned}</Label>
                                                <Slider value={[m.soil_deposits_cleaned]} onValueChange={([val]) => setMissions(prev => ({...prev, missionsPerSaida: { ...prev.missionsPerSaida, [saidaKey]: {...prev.missionsPerSaida[saidaKey], m01_surface_brushing: {...m, soil_deposits_cleaned: val}}}}))} max={2} step={1} />
                                            </div>
                                            <MissionCheckbox id={`${saidaKey}-m01_brush`} label="Escova não toca o local" checked={m.brush_not_touching} onCheckedChange={(checked) => setMissions(prev => ({...prev, missionsPerSaida: { ...prev.missionsPerSaida, [saidaKey]: {...prev.missionsPerSaida[saidaKey], m01_surface_brushing: {...m, brush_not_touching: checked}}}}))} />
                                        </div>
                                    )
                                }
                                 if (missionId === 'm14_forum') {
                                    const m = saidaMissions[missionId];
                                    return (
                                         <div key={missionId} className="p-2 border rounded space-y-2">
                                            <p className="font-medium text-sm">M14 – Fórum</p>
                                            <div>
                                                <Label>Artefatos no fórum: {m.artifacts}</Label>
                                                <Slider value={[m.artifacts]} onValueChange={([val]) => setMissions(prev => ({...prev, missionsPerSaida: { ...prev.missionsPerSaida, [saidaKey]: {...prev.missionsPerSaida[saidaKey], m14_forum: {...m, artifacts: val}}}}))} max={7} step={1} />
                                            </div>
                                        </div>
                                    )
                                }
                                return null;
                            })}
                        </AccordionContent>
                    </AccordionItem>
                )
            })}


            <AccordionItem value="precision">
                <AccordionTrigger>Fichas de Precisão (50)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Fichas restantes na base: {missions.precision_tokens}</Label>
                        <Slider value={[missions.precision_tokens]} onValueChange={([val]) => setMissions(prev => ({...prev, precision_tokens: val}))} max={6} step={1} />
                    </div>
                    <div>
                        <p className="font-medium">Pontos de Precisão:</p>
                        <p className="text-sm text-muted-foreground">
                            {
                                missions.precision_tokens >= 5 ? "50" :
                                missions.precision_tokens === 4 ? "35" :
                                missions.precision_tokens === 3 ? "25" :
                                missions.precision_tokens === 2 ? "15" :
                                missions.precision_tokens === 1 ? "10" : "0"
                            }
                        </p>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleReset} className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Resetar Pontuação
        </Button>
      </CardFooter>
    </Card>
  );
}

    