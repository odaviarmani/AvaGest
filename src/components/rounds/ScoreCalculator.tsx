"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';

interface MissionState {
    m00_equipment_inspection: boolean;
    m01_surface_cleanup: { part1: boolean; part2: boolean; part3: boolean };
    m02_underwater_exploration: 'none' | 'discovered' | 'both';
    m03_specimen_collection: number;
    m04_trench_mapping: boolean;
    m05_hydrothermal_vents: 'none' | 'one' | 'both';
    m06_subsea_cables: number;
    m07_robot_deployment: boolean;
    m08_marine_life_monitoring: 'none' | 'one' | 'both';
    m09_pipeline_maintenance: number;
    m10_wreck_salvage: number;
    m11_aquaculture_farming: boolean;
    m12_autonomous_navigation: boolean;
    m13_communication_network: boolean;
    precision_tokens: number;
}


const initialMissionState: MissionState = {
    m00_equipment_inspection: false,
    m01_surface_cleanup: { part1: false, part2: false, part3: false },
    m02_underwater_exploration: 'none',
    m03_specimen_collection: 0,
    m04_trench_mapping: false,
    m05_hydrothermal_vents: 'none',
    m06_subsea_cables: 0,
    m07_robot_deployment: false,
    m08_marine_life_monitoring: 'none',
    m09_pipeline_maintenance: 0,
    m10_wreck_salvage: 0,
    m11_aquaculture_farming: false,
    m12_autonomous_navigation: false,
    m13_communication_network: false,
    precision_tokens: 6,
};


export default function ScoreCalculator() {
  const [missions, setMissions] = useState<MissionState>(initialMissionState);

  const calculateScore = (state: MissionState): number => {
    let score = 0;
    if (state.m00_equipment_inspection) score += 20;

    if(state.m01_surface_cleanup.part1) score += 10;
    if(state.m01_surface_cleanup.part2) score += 10;
    if(state.m01_surface_cleanup.part3) score += 10;

    if (state.m02_underwater_exploration === 'discovered') score += 10;
    if (state.m02_underwater_exploration === 'both') score += 20;
    
    score += state.m03_specimen_collection * 10;
    
    if (state.m04_trench_mapping) score += 20;

    if (state.m05_hydrothermal_vents === 'one') score += 10;
    if (state.m05_hydrothermal_vents === 'both') score += 20;

    if (state.m06_subsea_cables >= 1) score += 10;
    if (state.m06_subsea_cables >= 2) score += 10;

    if(state.m07_robot_deployment) score += 20;
    
    if (state.m08_marine_life_monitoring === 'one') score += 10;
    if (state.m08_marine_life_monitoring === 'both') score += 20;

    score += state.m09_pipeline_maintenance * 5;

    score += state.m10_wreck_salvage;

    if (state.m11_aquaculture_farming) score += 20;
    
    if (state.m12_autonomous_navigation) score += 20;
    
    if (state.m13_communication_network) score += 20;

    const precisionTokensLeft = state.precision_tokens;
    if (precisionTokensLeft <= 5) score += 10;
    if (precisionTokensLeft <= 4) score += 5;
    if (precisionTokensLeft <= 3) score += 5;
    if (precisionTokensLeft <= 2) score += 10;
    if (precisionTokensLeft <= 1) score += 10;
    if (precisionTokensLeft <= 0) score += 10;
    
    return score;
  };

  const totalScore = useMemo(() => calculateScore(missions), [missions]);
  
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


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>Pontuação do Round</span>
            <span className="text-2xl font-bold text-primary">{totalScore}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[600px] overflow-y-auto pr-2">
        <Accordion type="multiple" className="w-full" defaultValue={['m00', 'm01']}>
            <AccordionItem value="m00">
                <AccordionTrigger>M00: Bônus de Inspeção (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m00" label="O equipamento cabe na área de inspeção" checked={missions.m00_equipment_inspection} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m00_equipment_inspection: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m01">
                <AccordionTrigger>M01: Limpeza de Superfície (10+10+10)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m01_part1" label="Derramamento de óleo removido (10)" checked={missions.m01_surface_cleanup.part1} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_cleanup: {...prev.m01_surface_cleanup, part1: checked} }))} />
                    <MissionCheckbox id="m01_part2" label="Microplástico removido (10)" checked={missions.m01_surface_cleanup.part2} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_cleanup: {...prev.m01_surface_cleanup, part2: checked} }))} />
                    <MissionCheckbox id="m01_part3" label="Detritos flutuantes removidos (10)" checked={missions.m01_surface_cleanup.part3} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_cleanup: {...prev.m01_surface_cleanup, part3: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m02">
                <AccordionTrigger>M02: Exploração Subaquática (10/20)</AccordionTrigger>
                 <AccordionContent>
                    <RadioGroup value={missions.m02_underwater_exploration} onValueChange={(value) => setMissions(prev => ({...prev, m02_underwater_exploration: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m02-none" /><Label htmlFor="m02-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="discovered" id="m02-one" /><Label htmlFor="m02-one">Navio descoberto (10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="m02-both" /><Label htmlFor="m02-both">Navio e container descobertos (20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m03">
                <AccordionTrigger>M03: Coleta de Espécimes (10/20/30)</AccordionTrigger>
                 <AccordionContent className="space-y-2">
                    <Label>Espécimes no microscópio: {missions.m03_specimen_collection}</Label>
                    <Slider value={[missions.m03_specimen_collection]} onValueChange={([val]) => setMissions(prev => ({...prev, m03_specimen_collection: val}))} max={3} step={1} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m04">
                <AccordionTrigger>M04: Mapeamento de Trincheiras (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m04" label="A trincheira está mapeada" checked={missions.m04_trench_mapping} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m04_trench_mapping: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m05">
                <AccordionTrigger>M05: Fontes Hidrotermais (10/20)</AccordionTrigger>
                <AccordionContent>
                    <RadioGroup value={missions.m05_hydrothermal_vents} onValueChange={(value) => setMissions(prev => ({...prev, m05_hydrothermal_vents: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m05-none" /><Label htmlFor="m05-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="one" id="m05-one" /><Label htmlFor="m05-one">Uma fonte ativada (10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="m05-both" /><Label htmlFor="m05-both">Ambas as fontes ativadas (20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m06">
                <AccordionTrigger>M06: Cabos Submarinos (10/20)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <Label>Cabos conectados: {missions.m06_subsea_cables}</Label>
                    <Slider value={[missions.m06_subsea_cables]} onValueChange={([val]) => setMissions(prev => ({...prev, m06_subsea_cables: val}))} max={2} step={1} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m07">
                <AccordionTrigger>M07: Implantação de Robôs (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m07" label="Robô implantado na área alvo" checked={missions.m07_robot_deployment} onCheckedChange={(checked) => setMissions(prev => ({...prev, m07_robot_deployment: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m08">
                <AccordionTrigger>M08: Monitoramento da Vida Marinha (10/20)</AccordionTrigger>
                <AccordionContent>
                     <RadioGroup value={missions.m08_marine_life_monitoring} onValueChange={(value) => setMissions(prev => ({...prev, m08_marine_life_monitoring: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m08-none" /><Label htmlFor="m08-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="one" id="m08-one" /><Label htmlFor="m08-one">Um animal atravessou (10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="m08-both" /><Label htmlFor="m08-both">Ambos animais atravessaram (20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m09">
                <AccordionTrigger>M09: Manutenção de Oleodutos (5/10/15)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <Label>Válvulas correspondentes: {missions.m09_pipeline_maintenance}</Label>
                    <Slider value={[missions.m09_pipeline_maintenance]} onValueChange={([val]) => setMissions(prev => ({...prev, m09_pipeline_maintenance: val}))} max={3} step={1} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m10">
                <AccordionTrigger>M10: Resgate de Naufrágios (10/20/30)</AccordionTrigger>
                <AccordionContent>
                     <RadioGroup value={String(missions.m10_wreck_salvage)} onValueChange={(value) => setMissions(prev => ({...prev, m10_wreck_salvage: Number(value)}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="0" id="m10-none" /><Label htmlFor="m10-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="10" id="m10-chest" /><Label htmlFor="m10-chest">Baú levantado (10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="20" id="m10-music" /><Label htmlFor="m10-music">Música antiga levantada (20)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="30" id="m10-both" /><Label htmlFor="m10-both">Ambos levantados (30)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m11">
                <AccordionTrigger>M11: Aquicultura (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m11" label="Algas colhidas" checked={missions.m11_aquaculture_farming} onCheckedChange={(checked) => setMissions(prev => ({...prev, m11_aquaculture_farming: checked }))} />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m12">
                <AccordionTrigger>M12: Navegação Autônoma (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m12" label="Robô no alvo de navegação" checked={missions.m12_autonomous_navigation} onCheckedChange={(checked) => setMissions(prev => ({...prev, m12_autonomous_navigation: checked }))} />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m13">
                <AccordionTrigger>M13: Rede de Comunicação (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m13" label="Rede de satélites ativada" checked={missions.m13_communication_network} onCheckedChange={(checked) => setMissions(prev => ({...prev, m13_communication_network: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="precision">
                <AccordionTrigger>Fichas de Precisão (Até 50)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <Label>Fichas restantes na base: {missions.precision_tokens}</Label>
                    <Slider value={[missions.precision_tokens]} onValueChange={([val]) => setMissions(prev => ({...prev, precision_tokens: val}))} max={6} step={1} />
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
