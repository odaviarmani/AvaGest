
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
import { Separator } from '../ui/separator';


interface ScoreCalculatorProps {
    missions: MissionState;
    setMissions: React.Dispatch<React.SetStateAction<MissionState>>;
    totalScore: number;
    numberOfSaidas: number;
}


export default function ScoreCalculator({ missions, setMissions, totalScore, numberOfSaidas }: ScoreCalculatorProps) {

  const handleReset = () => {
    setMissions(initialMissionState);
  };
  
  const SaidaSelector = ({ missionKey }: { missionKey: keyof MissionState }) => {
    const mission = missions[missionKey] as { saidas: number[] };
    
    if (!mission || !('saidas' in mission)) return null;

    const handleSaidaChange = (saidaNumber: number, checked: boolean) => {
        setMissions(prev => {
            const currentMission = prev[missionKey] as any;
            const currentSaidas = currentMission.saidas || [];
            const newSaidas = checked
                ? [...currentSaidas, saidaNumber]
                : currentSaidas.filter((s: number) => s !== saidaNumber);
            
            return {
                ...prev,
                [missionKey]: {
                    ...currentMission,
                    saidas: newSaidas
                }
            };
        });
    };

    return (
        <div className="mt-3">
            <Label className="text-xs font-semibold text-muted-foreground">SAÍDAS</Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
                {Array.from({ length: numberOfSaidas }, (_, i) => i + 1).map(saidaNum => (
                    <div key={saidaNum} className="flex items-center space-x-2">
                        <Checkbox
                            id={`${missionKey}-saida-${saidaNum}`}
                            checked={mission.saidas.includes(saidaNum)}
                            onCheckedChange={(checked) => handleSaidaChange(saidaNum, !!checked)}
                        />
                         <Label htmlFor={`${missionKey}-saida-${saidaNum}`} className="text-sm font-normal">
                            {saidaNum}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  const MissionCheckbox = ({ id, label, checked, onCheckedChange, disabled = false, missionKey }: { id: string; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean, missionKey: keyof MissionState }) => (
    <div className="space-y-2">
        <div className="flex items-center space-x-2">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
            <Label htmlFor={id} className={`cursor-pointer ${disabled ? 'text-muted-foreground' : ''}`}>{label}</Label>
        </div>
         <SaidaSelector missionKey={missionKey} />
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
        <Accordion type="multiple" className="w-full space-y-2">
            
            {/* M00 */}
            <div className="p-2 rounded-lg border">
                <MissionCheckbox id="m00" label="M00 – Inspeção de Equipamentos (20 pts)" checked={missions.m00_equipment_inspection.completed} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m00_equipment_inspection: {...prev.m00_equipment_inspection, completed: checked} }))} missionKey="m00_equipment_inspection" />
            </div>

            {/* M01 */}
            <AccordionItem value="m01">
                <AccordionTrigger>M01 – Escovação de Superfícies (30)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Etapa 1 (10 pts/cada): {missions.m01_surface_brushing.soil_deposits_cleaned}</Label>
                        <Slider value={[missions.m01_surface_brushing.soil_deposits_cleaned]} onValueChange={([val]) => setMissions(prev => ({ ...prev, m01_surface_brushing: {...prev.m01_surface_brushing, soil_deposits_cleaned: val}}))} max={2} step={1} />
                    </div>
                    <MissionCheckbox id="m01_brush" label="Etapa 2 (10 pts)" checked={missions.m01_surface_brushing.brush_not_touching} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_brushing: {...prev.m01_surface_brushing, brush_not_touching: checked}}))} missionKey="m01_surface_brushing" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M02 */}
            <AccordionItem value="m02">
                <AccordionTrigger>M02 – Revelação do Mapa (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m02_part1" label="Etapa 1 (10 pts)" checked={missions.m02_map_reveal.part1} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part1', checked)} missionKey="m02_map_reveal" />
                    <MissionCheckbox id="m02_part2" label="Etapa 2 (10 pts)" checked={missions.m02_map_reveal.part2} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part2', checked)} missionKey="m02_map_reveal" />
                    <MissionCheckbox id="m02_part3" label="Etapa 3 (10 pts)" checked={missions.m02_map_reveal.part3} onCheckedChange={(checked) => updateMissionStep('m02_map_reveal', 'part3', checked)} missionKey="m02_map_reveal" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M03 */}
            <AccordionItem value="m03">
                <AccordionTrigger>M03 – Explorador do Poço da Mina (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m03_explored" label="Etapa 1 (30 pts)" checked={missions.m03_mine_shaft_explorer.explored} onCheckedChange={(checked) => updateMissionStep('m03_mine_shaft_explorer', 'explored', checked)} missionKey="m03_mine_shaft_explorer" />
                    <MissionCheckbox id="m03_gold" label="Etapa 2 (10 pts)" checked={missions.m03_mine_shaft_explorer.gold_retrieved} onCheckedChange={(checked) => updateMissionStep('m03_mine_shaft_explorer', 'gold_retrieved', checked)} missionKey="m03_mine_shaft_explorer" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M04 */}
            <AccordionItem value="m04">
                <AccordionTrigger>M04 – Recuperação Cuidadosa (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m04_retrieved" label="Etapa 1 (30 pts)" checked={missions.m04_careful_retrieval.retrieved} onCheckedChange={(checked) => updateMissionStep('m04_careful_retrieval', 'retrieved', checked)} missionKey="m04_careful_retrieval" />
                    <MissionCheckbox id="m04_not_broken" label="Etapa 2 (10 pts)" checked={missions.m04_careful_retrieval.not_broken} onCheckedChange={(checked) => updateMissionStep('m04_careful_retrieval', 'not_broken', checked)} missionKey="m04_careful_retrieval" />
                </AccordionContent>
            </AccordionItem>

            {/* M05 */}
            <div className="p-2 rounded-lg border">
                 <MissionCheckbox id="m05" label="M05 – Quem Morava Aqui? (30 pts)" checked={missions.m05_who_lived_here.completed} onCheckedChange={(checked) => setMissions(prev => ({...prev, m05_who_lived_here: {...prev.m05_who_lived_here, completed: checked}}))} missionKey="m05_who_lived_here" />
            </div>
            
            {/* M06 */}
            <AccordionItem value="m06">
                <AccordionTrigger>M06 – Forja (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m06_part1" label="Etapa 1 (10 pts)" checked={missions.m06_forge.part1} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part1', checked)} missionKey="m06_forge" />
                    <MissionCheckbox id="m06_part2" label="Etapa 2 (10 pts)" checked={missions.m06_forge.part2} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part2', checked)} missionKey="m06_forge" />
                    <MissionCheckbox id="m06_part3" label="Etapa 3 (10 pts)" checked={missions.m06_forge.part3} onCheckedChange={(checked) => updateMissionStep('m06_forge', 'part3', checked)} missionKey="m06_forge" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M07 */}
            <div className="p-2 rounded-lg border">
                <MissionCheckbox id="m07" label="M07 – Levantamento de Peso (30 pts)" checked={missions.m07_heavy_lifting.completed} onCheckedChange={(checked) => setMissions(prev => ({...prev, m07_heavy_lifting: {...prev.m07_heavy_lifting, completed: checked}}))} missionKey="m07_heavy_lifting" />
            </div>

            {/* M08 */}
            <AccordionItem value="m08">
                <AccordionTrigger>M08 – Silo (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m08_part1" label="Etapa 1 (10 pts)" checked={missions.m08_silo.part1} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part1', checked)} missionKey="m08_silo" />
                    <MissionCheckbox id="m08_part2" label="Etapa 2 (10 pts)" checked={missions.m08_silo.part2} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part2', checked)} missionKey="m08_silo" />
                    <MissionCheckbox id="m08_part3" label="Etapa 3 (10 pts)" checked={missions.m08_silo.part3} onCheckedChange={(checked) => updateMissionStep('m08_silo', 'part3', checked)} missionKey="m08_silo" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M09 */}
            <AccordionItem value="m09">
                <AccordionTrigger>M09 – O que Está à Venda (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m09_open" label="Etapa 1 (20 pts)" checked={missions.m09_whats_on_sale.store_open} onCheckedChange={(checked) => updateMissionStep('m09_whats_on_sale', 'store_open', checked)} missionKey="m09_whats_on_sale" />
                    <MissionCheckbox id="m09_pedestal" label="Etapa 2 (10 pts)" checked={missions.m09_whats_on_sale.item_on_pedestal} onCheckedChange={(checked) => updateMissionStep('m09_whats_on_sale', 'item_on_pedestal', checked)} missionKey="m09_whats_on_sale" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M10 */}
            <AccordionItem value="m10">
                <AccordionTrigger>M10 – Virar a Balança (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m10_tipped" label="Etapa 1 (20 pts)" checked={missions.m10_tip_the_scales.tipped} onCheckedChange={(checked) => updateMissionStep('m10_tip_the_scales', 'tipped', checked)} missionKey="m10_tip_the_scales" />
                    <MissionCheckbox id="m10_both_down" label="Etapa 2 (10 pts)" checked={missions.m10_tip_the_scales.both_sides_down} onCheckedChange={(checked) => updateMissionStep('m10_tip_the_scales', 'both_sides_down', checked)} missionKey="m10_tip_the_scales" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M11 */}
            <AccordionItem value="m11">
                <AccordionTrigger>M11 – Artefatos de Fisher (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m11_retrieved" label="Etapa 1 (20 pts)" checked={missions.m11_fisher_artifacts.retrieved} onCheckedChange={(checked) => updateMissionStep('m11_fisher_artifacts', 'retrieved', checked)} missionKey="m11_fisher_artifacts" />
                    <MissionCheckbox id="m11_pedestal" label="Etapa 2 (10 pts)" checked={missions.m11_fisher_artifacts.on_pedestal} onCheckedChange={(checked) => updateMissionStep('m11_fisher_artifacts', 'on_pedestal', checked)} missionKey="m11_fisher_artifacts" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M12 */}
            <AccordionItem value="m12">
                <AccordionTrigger>M12 – Operação de Resgate (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m12_raised" label="Etapa 1 (20 pts)" checked={missions.m12_salvage_operation.raised} onCheckedChange={(checked) => updateMissionStep('m12_salvage_operation', 'raised', checked)} missionKey="m12_salvage_operation" />
                    <MissionCheckbox id="m12_animals" label="Etapa 2 (10 pts)" checked={missions.m12_salvage_operation.animals_moved} onCheckedChange={(checked) => updateMissionStep('m12_salvage_operation', 'animals_moved', checked)} missionKey="m12_salvage_operation" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M13 */}
            <div className="p-2 rounded-lg border">
                <MissionCheckbox id="m13" label="M13 – Reconstrução da Estátua (30 pts)" checked={missions.m13_statue_reconstruction.completed} onCheckedChange={(checked) => setMissions(prev => ({...prev, m13_statue_reconstruction: {...prev.m13_statue_reconstruction, completed: checked}}))} missionKey="m13_statue_reconstruction" />
            </div>

            {/* M14 */}
            <AccordionItem value="m14">
                <AccordionTrigger>M14 – Fórum (35)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Etapa 1 (5 pts/cada): {missions.m14_forum.artifacts}</Label>
                        <Slider value={[missions.m14_forum.artifacts]} onValueChange={([val]) => setMissions(prev => ({...prev, m14_forum: { ...prev.m14_forum, artifacts: val }}))} max={7} step={1} />
                    </div>
                    <SaidaSelector missionKey="m14_forum" />
                </AccordionContent>
            </AccordionItem>
            
            {/* M15 */}
            <AccordionItem value="m15">
                <AccordionTrigger>M15 – Marcação de Local (30)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <div>
                        <Label>Etapa 1 (10 pts/cada): {missions.m15_site_marking.locations}</Label>
                        <Slider value={[missions.m15_site_marking.locations]} onValueChange={([val]) => setMissions(prev => ({...prev, m15_site_marking: { ...prev.m15_site_marking, locations: val }}))} max={3} step={1} />
                    </div>
                     <SaidaSelector missionKey="m15_site_marking" />
                </AccordionContent>
            </AccordionItem>

            {/* Precision Tokens */}
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
