
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
    stageNames: string[]; // This prop is kept for compatibility but the logic will be simplified
}


export default function ScoreCalculator({ missions, setMissions, totalScore }: ScoreCalculatorProps) {

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
  
  // A helper function to update the single `saida1` object, abstracting the structure from the UI
  const updateMission = (missionKey: keyof MissionState['missionsPerSaida']['saida1'], value: any) => {
      setMissions(prev => {
          const saida1 = prev.missionsPerSaida.saida1 || initialMissionState.missionsPerSaida.saida1;
          const updatedSaida1 = { ...saida1, [missionKey]: value };
          return {
              ...prev,
              missionsPerSaida: {
                  ...prev.missionsPerSaida,
                  saida1: updatedSaida1,
              }
          }
      })
  }
  
  const m = missions.missionsPerSaida.saida1 || initialMissionState.missionsPerSaida.saida1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>Pontuação do Round</span>
            <span className="text-2xl font-bold text-primary">{totalScore}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto pr-2">
        <Accordion type="multiple" className="w-full" defaultValue={['all-missions', 'm00', 'precision']}>
            <AccordionItem value="m00">
                <AccordionTrigger>Inspeção de Equipamentos (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m00" label="Robô + equipamentos cabem na área" checked={missions.m00_equipment_inspection} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m00_equipment_inspection: checked }))} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="all-missions">
                <AccordionTrigger>Missões</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div className="p-2 border rounded space-y-2">
                        <p className="font-medium text-sm">M01 – Escovação de Superfícies</p>
                        <div>
                            <Label>Depósitos de solo limpos (10 pts/cada): {m.m01_surface_brushing.soil_deposits_cleaned}</Label>
                            <Slider value={[m.m01_surface_brushing.soil_deposits_cleaned]} onValueChange={([val]) => updateMission('m01_surface_brushing', {...m.m01_surface_brushing, soil_deposits_cleaned: val})} max={2} step={1} />
                        </div>
                        <MissionCheckbox id={`m01_brush`} label="Escova não toca o local (+10 pts)" checked={m.m01_surface_brushing.brush_not_touching} onCheckedChange={(checked) => updateMission('m01_surface_brushing', {...m.m01_surface_brushing, brush_not_touching: checked})} />
                    </div>
                    
                    <MissionCheckbox id="m02" label="M02 – Revelação do Mapa (30)" checked={m.m02_map_reveal} onCheckedChange={(checked) => updateMission('m02_map_reveal', checked)} />
                    <MissionCheckbox id="m03" label="M03 – Explorador do Poço da Mina (40)" checked={m.m03_mine_shaft_explorer} onCheckedChange={(checked) => updateMission('m03_mine_shaft_explorer', checked)} />
                    <MissionCheckbox id="m04" label="M04 – Recuperação Cuidadosa (40)" checked={m.m04_careful_retrieval} onCheckedChange={(checked) => updateMission('m04_careful_retrieval', checked)} />
                    <MissionCheckbox id="m05" label="M05 – Quem Morava Aqui? (30)" checked={m.m05_who_lived_here} onCheckedChange={(checked) => updateMission('m05_who_lived_here', checked)} />
                    <MissionCheckbox id="m06" label="M06 – Forja (30)" checked={m.m06_forge} onCheckedChange={(checked) => updateMission('m06_forge', checked)} />
                    <MissionCheckbox id="m07" label="M07 – Levantamento de Peso (30)" checked={m.m07_heavy_lifting} onCheckedChange={(checked) => updateMission('m07_heavy_lifting', checked)} />
                    <MissionCheckbox id="m08" label="M08 – Silo (30)" checked={m.m08_silo} onCheckedChange={(checked) => updateMission('m08_silo', checked)} />
                    <MissionCheckbox id="m09" label="M09 – O que Está à Venda (30)" checked={m.m09_whats_on_sale} onCheckedChange={(checked) => updateMission('m09_whats_on_sale', checked)} />
                    <MissionCheckbox id="m10" label="M10 – Virar a Balança (30)" checked={m.m10_tip_the_scales} onCheckedChange={(checked) => updateMission('m10_tip_the_scales', checked)} />
                    <MissionCheckbox id="m11" label="M11 – Artefatos de Fisher (30)" checked={m.m11_fisher_artifacts} onCheckedChange={(checked) => updateMission('m11_fisher_artifacts', checked)} />
                    <MissionCheckbox id="m12" label="M12 – Operação de Resgate (30)" checked={m.m12_salvage_operation} onCheckedChange={(checked) => updateMission('m12_salvage_operation', checked)} />
                    <MissionCheckbox id="m13" label="M13 – Reconstrução da Estátua (30)" checked={m.m13_statue_reconstruction} onCheckedChange={(checked) => updateMission('m13_statue_reconstruction', checked)} />

                    <div className="p-2 border rounded space-y-2">
                        <p className="font-medium text-sm">M14 – Fórum</p>
                        <div>
                            <Label>Artefatos no fórum (5 pts/cada): {m.m14_forum.artifacts}</Label>
                            <Slider value={[m.m14_forum.artifacts]} onValueChange={([val]) => updateMission('m14_forum', { artifacts: val })} max={7} step={1} />
                        </div>
                    </div>
                     <div className="p-2 border rounded space-y-2">
                        <p className="font-medium text-sm">M15 – Marcação de Local</p>
                        <div>
                            <Label>Locais marcados (10 pts/cada): {m.m15_site_marking.locations}</Label>
                            <Slider value={[m.m15_site_marking.locations]} onValueChange={([val]) => updateMission('m15_site_marking', { locations: val })} max={3} step={1} />
                        </div>
                    </div>

                </AccordionContent>
            </AccordionItem>

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
