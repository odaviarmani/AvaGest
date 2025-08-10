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
    m00_inspection: boolean;
    m01_automated_drone: boolean;
    m02_3d_model: boolean;
    m03_emergency_supplies: number;
    m04_emergency_exit_open: boolean;
    m04_people_evacuated: number;
    m05_artefact_revealed: boolean;
    m06_warning_system_tested: boolean;
    m07_gas_valve_shut_off: boolean;
    m08_underground_structure: 'none' | 'moved' | 'discovered';
    m09_dike_built: boolean;
    m10_water_flow: 'none' | 'one' | 'both';
    m11_tsunami_wall: boolean;
    m12_geotechnical_testing: 'none' | 'pushed' | 'pushed_bldg';
    m13_helicopter_lift: boolean;
    precision_tokens: number;
}


const initialMissionState: MissionState = {
    m00_inspection: false,
    m01_automated_drone: false,
    m02_3d_model: false,
    m03_emergency_supplies: 0,
    m04_emergency_exit_open: false,
    m04_people_evacuated: 0,
    m05_artefact_revealed: false,
    m06_warning_system_tested: false,
    m07_gas_valve_shut_off: false,
    m08_underground_structure: 'none',
    m09_dike_built: false,
    m10_water_flow: 'none',
    m11_tsunami_wall: false,
    m12_geotechnical_testing: 'none',
    m13_helicopter_lift: false,
    precision_tokens: 6,
};


export default function ScoreCalculator() {
  const [missions, setMissions] = useState<MissionState>(initialMissionState);

  const calculateScore = (state: MissionState): number => {
    let score = 0;
    if (state.m00_inspection) score += 10;
    if (state.m01_automated_drone) score += 20;
    if (state.m02_3d_model) score += 20;
    
    score += state.m03_emergency_supplies * 10;
    
    if (state.m04_emergency_exit_open) score += 10;
    score += state.m04_people_evacuated * 10;

    if (state.m05_artefact_revealed) score += 20;
    if (state.m06_warning_system_tested) score += 10;
    if (state.m07_gas_valve_shut_off) score += 20;

    if (state.m08_underground_structure === 'moved') score += 10;
    if (state.m08_underground_structure === 'discovered') score += 20;
    
    if (state.m09_dike_built) score += 20;

    if (state.m10_water_flow === 'one') score += 10;
    if (state.m10_water_flow === 'both') score += 20;

    if (state.m11_tsunami_wall) score += 20;
    
    if (state.m12_geotechnical_testing === 'pushed') score += 10;
    if (state.m12_geotechnical_testing === 'pushed_bldg') score += 20;
    
    if (state.m13_helicopter_lift) score += 20;

    // Precision Tokens calculation
    const precisionTokensUsed = 6 - state.precision_tokens;
    if (precisionTokensUsed >= 1) score += 5;
    if (precisionTokensUsed >= 2) score += 5;
    if (precisionTokensUsed >= 3) score += 10;
    if (precisionTokensUsed >= 4) score += 10;
    if (precisionTokensUsed >= 5) score += 10;
    if (precisionTokensUsed >= 6) score += 10;

    return score;
  };

  const totalScore = useMemo(() => calculateScore(missions), [missions]);
  
  const handleReset = () => {
    setMissions(initialMissionState);
  };

  const MissionCheckbox = ({ id, label, field, disabled = false }: { id: string; label: string; field: keyof MissionState; disabled?: boolean }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={missions[field] as boolean}
        onCheckedChange={(checked) => setMissions(prev => ({ ...prev, [field]: checked }))}
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
        <Accordion type="multiple" className="w-full">
            <AccordionItem value="m00">
                <AccordionTrigger>M00: Bônus de Inspeção (10)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m00" label="O equipamento está na área de inspeção" field="m00_inspection" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m01">
                <AccordionTrigger>M01: Drone Automatizado (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m01" label="Drone completamente sobre a plataforma de pouso" field="m01_automated_drone" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m02">
                <AccordionTrigger>M02: Modelo 3D (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m02" label="O modelo 3D está em seu alvo" field="m02_3d_model" /></AccordionContent>
            </AccordionItem>
             <AccordionItem value="m03">
                <AccordionTrigger>M03: Suprimentos de Emergência (10/20)</AccordionTrigger>
                 <AccordionContent className="space-y-2">
                    <Label>Suprimentos na área alvo: {missions.m03_emergency_supplies}</Label>
                    <Slider value={[missions.m03_emergency_supplies]} onValueChange={([val]) => setMissions(prev => ({...prev, m03_emergency_supplies: val}))} max={2} step={1} />
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m04">
                <AccordionTrigger>M04: Evacuação de Emergência (10-30)</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <MissionCheckbox id="m04_exit" label="A saída de emergência está aberta (+10)" field="m04_emergency_exit_open" />
                    <div className="space-y-2">
                        <Label>Pessoas na área de evacuação (+10 cada)</Label>
                        <Slider value={[missions.m04_people_evacuated]} onValueChange={([val]) => setMissions(prev => ({...prev, m04_people_evacuated: val}))} max={2} step={1} />
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m05">
                <AccordionTrigger>M05: Artefato (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m05" label="O artefato foi revelado" field="m05_artefact_revealed" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m06">
                <AccordionTrigger>M06: Sistema de Aviso (10)</AccordionTrigger>
                <AccordionContent>
                     <MissionCheckbox id="m06" label="Sistema de aviso testado (alavanca empurrada)" field="m06_warning_system_tested" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m07">
                <AccordionTrigger>M07: Válvula de Gás (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m07" label="Válvula de gás fechada (ponteiro no vermelho)" field="m07_gas_valve_shut_off" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m08">
                <AccordionTrigger>M08: Estrutura Subterrânea (10/20)</AccordionTrigger>
                 <AccordionContent>
                    <RadioGroup value={missions.m08_underground_structure} onValueChange={(value) => setMissions(prev => ({...prev, m08_underground_structure: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m08-none" /><Label htmlFor="m08-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="moved" id="m08-moved" /><Label htmlFor="m08-moved">Estrutura movida para fora do círculo (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="discovered" id="m08-discovered" /><Label htmlFor="m08-discovered">Estrutura descoberta (lado amarelo para cima) (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m09">
                <AccordionTrigger>M09: Dique (20)</AccordionTrigger>
                <AccordionContent>
                     <MissionCheckbox id="m09" label="Dique construído completamente no alvo" field="m09_dike_built" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m10">
                <AccordionTrigger>M10: Fluxo de Água (10/20)</AccordionTrigger>
                 <AccordionContent>
                    <RadioGroup value={missions.m10_water_flow} onValueChange={(value) => setMissions(prev => ({...prev, m10_water_flow: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m10-none" /><Label htmlFor="m10-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="one" id="m10-one" /><Label htmlFor="m10-one">Uma água de fluxo no alvo (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="m10-both" /><Label htmlFor="m10-both">Ambas as águas de fluxo no alvo (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m11">
                <AccordionTrigger>M11: Muro de Tsunami (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m11" label="O muro de tsunami está levantado" field="m11_tsunami_wall" /></AccordionContent>
            </AccordionItem>
             <AccordionItem value="m12">
                <AccordionTrigger>M12: Teste Geotécnico (10/20)</AccordionTrigger>
                <AccordionContent>
                     <RadioGroup value={missions.m12_geotechnical_testing} onValueChange={(value) => setMissions(prev => ({...prev, m12_geotechnical_testing: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m12-none" /><Label htmlFor="m12-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pushed" id="m12-pushed" /><Label htmlFor="m12-pushed">Bloco empurrado para a área alvo (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pushed_bldg" id="m12-pushed-bldg" /><Label htmlFor="m12-pushed-bldg">Bloco empurrado com o prédio sobre ele (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m13">
                <AccordionTrigger>M13: Resgate de Helicóptero (20)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m13" label="O técnico está suspenso pelo helicóptero" field="m13_helicopter_lift" />
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
