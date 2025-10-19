
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
import { ScrollArea } from '../ui/scroll-area';


interface ScoreCalculatorProps {
    missions: MissionState;
    setMissions: React.Dispatch<React.SetStateAction<MissionState>>;
    totalScore: number;
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
  
  const updateMissionStep = (missionKey: keyof MissionState, stepKey: string, value: boolean) => {
    setMissions(prev => ({
      ...prev,
      [missionKey]: {
        ...(prev[missionKey] as any),
        [stepKey]: value,
      }
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>Pontuação do Round</span>
            <span className="text-2xl font-bold text-primary">{totalScore}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-2">
        <Accordion type="multiple" className="w-full" defaultValue={['m00', 'precision']}>
            <AccordionItem value="m00">
                <AccordionTrigger>Inspeção de Equipamentos (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m00" label="Robô + equipamentos cabem na área" checked={missions.m00_equipment_inspection} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m00_equipment_inspection: checked }))} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m01">
                <AccordionTrigger>M01 – Escovação de Superfícies (30)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Depósitos de solo limpos (10 pts/cada): {missions.m01_surface_brushing.soil_deposits_cleaned}</Label>
                        <Slider value={[missions.m01_surface_brushing.soil_deposits_cleaned]} onValueChange={([val]) => setMissions(prev => ({ ...prev, m01_surface_brushing: {...prev.m01_surface_brushing, soil_deposits_cleaned: val}}))} max={2} step={1} />
                    </div>
                    <MissionCheckbox id="m01_brush" label="Escova não toca o local (+10 pts)" checked={missions.m01_surface_brushing.brush_not_touching} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_brushing: {...prev.m01_surface_brushing, brush_not_touching: checked}}))} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m02">
                <AccordionTrigger>M02 – Revelação do Mapa (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m02_part1" label="Parte 1 revelada (10 pts)" checked={missions.m02_map_reveal.part1} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part1', checked)} />
                    <MissionCheckbox id="m02_part2" label="Parte 2 revelada (10 pts)" checked={missions.m02_map_reveal.part2} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part2', checked)} />
                    <MissionCheckbox id="m02_part3" label="Parte 3 revelada (10 pts)" checked={missions.m02_map_reveal.part3} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part3', checked)} />
                </AccordionContent>
            </AccordionItem>
            
             <AccordionItem value="m03">
                <AccordionTrigger>M03 – Explorador do Poço da Mina (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m03_explored" label="Poço da mina explorado (30 pts)" checked={missions.m03_mine_shaft_explorer.explored} onCheckedChange={(checked) => updateMissionStep('m03_mine_shaft_explorer', 'explored', checked)} />
                    <MissionCheckbox id="m03_gold" label="Ouro recuperado (10 pts)" checked={missions.m03_mine_shaft_explorer.gold_retrieved} onCheckedChange={(checked) => updateMissionStep('m03_mine_shaft_explorer', 'gold_retrieved', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m04">
                <AccordionTrigger>M04 – Recuperação Cuidadosa (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m04_retrieved" label="Vaso antigo recuperado (30 pts)" checked={missions.m04_careful_retrieval.retrieved} onCheckedChange={(checked) => updateMissionStep('m04_careful_retrieval', 'retrieved', checked)} />
                    <MissionCheckbox id="m04_not_broken" label="Vaso antigo não está quebrado (10 pts)" checked={missions.m04_careful_retrieval.not_broken} onCheckedChange={(checked) => updateMissionStep('m04_careful_retrieval', 'not_broken', checked)} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="m05"><AccordionTrigger><MissionCheckbox id="m05" label="M05 – Quem Morava Aqui? (30)" checked={missions.m05_who_lived_here} onCheckedChange={(checked) => setMissions(prev => ({...prev, m05_who_lived_here: checked}))} /></AccordionTrigger></AccordionItem>

            <AccordionItem value="m06">
                <AccordionTrigger>M06 – Forja (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m06_part1" label="Fole bombeado (10 pts)" checked={missions.m06_forge.part1} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part1', checked)} />
                    <MissionCheckbox id="m06_part2" label="Luz de temperatura acesa (10 pts)" checked={missions.m06_forge.part2} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part2', checked)} />
                    <MissionCheckbox id="m06_part3" label="Espadas entregues (10 pts)" checked={missions.m06_forge.part3} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part3', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m07"><AccordionTrigger><MissionCheckbox id="m07" label="M07 – Levantamento de Peso (30)" checked={missions.m07_heavy_lifting} onCheckedChange={(checked) => setMissions(prev => ({...prev, m07_heavy_lifting: checked}))} /></AccordionTrigger></AccordionItem>
            
            <AccordionItem value="m08">
                <AccordionTrigger>M08 – Silo (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m08_part1" label="Empurre a viga (10 pts)" checked={missions.m08_silo.part1} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part1', checked)} />
                    <MissionCheckbox id="m08_part2" label="Gire o portão (10 pts)" checked={missions.m08_silo.part2} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part2', checked)} />
                    <MissionCheckbox id="m08_part3" label="Dispositivos de grãos caem (10 pts)" checked={missions.m08_silo.part3} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part3', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m09">
                <AccordionTrigger>M09 – O que Está à Venda (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m09_open" label="Loja aberta (20 pts)" checked={missions.m09_whats_on_sale.store_open} onCheckedChange={(checked) => updateMissionStep('m09_whats_on_sale', 'store_open', checked)} />
                    <MissionCheckbox id="m09_pedestal" label="Item no pedestal (10 pts)" checked={missions.m09_whats_on_sale.item_on_pedestal} onCheckedChange={(checked) => updateMissionStep('m09_whats_on_sale', 'item_on_pedestal', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m10">
                <AccordionTrigger>M10 – Virar a Balança (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m10_tipped" label="Balança virada (20 pts)" checked={missions.m10_tip_the_scales.tipped} onCheckedChange={(checked) => updateMissionStep('m10_tip_the_scales', 'tipped', checked)} />
                    <MissionCheckbox id="m10_both_down" label="Ambos os lados para baixo (10 pts)" checked={missions.m10_tip_the_scales.both_sides_down} onCheckedChange={(checked) => updateMissionStep('m10_tip_the_scales', 'both_sides_down', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m11">
                <AccordionTrigger>M11 – Artefatos de Fisher (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m11_retrieved" label="Recuperado do barco (20 pts)" checked={missions.m11_fisher_artifacts.retrieved} onCheckedChange={(checked) => updateMissionStep('m11_fisher_artifacts', 'retrieved', checked)} />
                    <MissionCheckbox id="m11_pedestal" label="No pedestal (10 pts)" checked={missions.m11_fisher_artifacts.on_pedestal} onCheckedChange={(checked) => updateMissionStep('m11_fisher_artifacts', 'on_pedestal', checked)} />
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m12">
                <AccordionTrigger>M12 – Operação de Resgate (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m12_raised" label="Navio levantado (20 pts)" checked={missions.m12_salvage_operation.raised} onCheckedChange={(checked) => updateMissionStep('m12_salvage_operation', 'raised', checked)} />
                    <MissionCheckbox id="m12_animals" label="Animais movidos (10 pts)" checked={missions.m12_salvage_operation.animals_moved} onCheckedChange={(checked) => updateMissionStep('m12_salvage_operation', 'animals_moved', checked)} />
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="m13"><AccordionTrigger><MissionCheckbox id="m13" label="M13 – Reconstrução da Estátua (30)" checked={missions.m13_statue_reconstruction} onCheckedChange={(checked) => setMissions(prev => ({...prev, m13_statue_reconstruction: checked}))} /></AccordionTrigger></AccordionItem>

            <AccordionItem value="m14">
                <AccordionTrigger>M14 – Fórum (35)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Artefatos no fórum (5 pts/cada): {missions.m14_forum.artifacts}</Label>
                        <Slider value={[missions.m14_forum.artifacts]} onValueChange={([val]) => setMissions(prev => ({...prev, m14_forum: { artifacts: val }}))} max={7} step={1} />
                    </div>
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="m15">
                <AccordionTrigger>M15 – Marcação de Local (30)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Locais marcados (10 pts/cada): {missions.m15_site_marking.locations}</Label>
                        <Slider value={[missions.m15_site_marking.locations]} onValueChange={([val]) => setMissions(prev => ({...prev, m15_site_marking: { locations: val }}))} max={3} step={1} />
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
        </ScrollArea>
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
