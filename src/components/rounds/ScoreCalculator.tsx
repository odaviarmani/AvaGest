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
  m01_3d_cinema: boolean;
  m02_scene_change: 'none' | 'small' | 'large';
  m03_immersive_experience: boolean;
  m04_masterpiece: boolean;
  m04_masterpiece_curator: boolean;
  m05_ar_statue: boolean;
  m05_ar_statue_lever: boolean;
  m06_lights: boolean;
  m06_sound: boolean;
  m07_hologram: boolean;
  m08_camera: 'none' | 'blue' | 'pink';
  m09_movie_set_prop: boolean;
  m09_movie_set_camera: boolean;
  m10_sound_mixer: number;
  m11_light_show: boolean;
  m12_robot_dance: boolean;
  m13_boat: boolean;
  m13_cargo: boolean;
  m14_chicken: boolean;
  m15_speakers: 'none' | 'one' | 'both';
  precision_tokens: number;
}

const initialMissionState: MissionState = {
  m00_inspection: false,
  m01_3d_cinema: false,
  m02_scene_change: 'none',
  m03_immersive_experience: false,
  m04_masterpiece: false,
  m04_masterpiece_curator: false,
  m05_ar_statue: false,
  m05_ar_statue_lever: false,
  m06_lights: false,
  m06_sound: false,
  m07_hologram: false,
  m08_camera: 'none',
  m09_movie_set_prop: false,
  m09_movie_set_camera: false,
  m10_sound_mixer: 0,
  m11_light_show: false,
  m12_robot_dance: false,
  m13_boat: false,
  m13_cargo: false,
  m14_chicken: false,
  m15_speakers: 'none',
  precision_tokens: 6,
};


export default function ScoreCalculator() {
  const [missions, setMissions] = useState<MissionState>(initialMissionState);

  const calculateScore = (state: MissionState): number => {
    let score = 0;
    if (state.m00_inspection) score += 10;
    if (state.m01_3d_cinema) score += 20;
    if (state.m02_scene_change === 'small') score += 10;
    if (state.m02_scene_change === 'large') score += 20;
    if (state.m03_immersive_experience) score += 20;
    if (state.m04_masterpiece) {
        score += 10;
        if (state.m04_masterpiece_curator) score += 10;
    }
    if (state.m05_ar_statue) {
        score += 10;
        if(state.m05_ar_statue_lever) score += 20;
    }
    if (state.m06_lights) score += 10;
    if (state.m06_sound) score += 10;
    if (state.m07_hologram) score += 20;
    if (state.m08_camera === 'blue') score += 10;
    if (state.m08_camera === 'pink') score += 20;
    if (state.m09_movie_set_prop) score += 10;
    if (state.m09_movie_set_camera) score += 10;
    if(state.m10_sound_mixer > 0) score += (state.m10_sound_mixer * 10);
    if(state.m11_light_show) score += 10;
    if(state.m12_robot_dance) score += 20;
    if(state.m13_boat) {
        score += 10;
        if (state.m13_cargo) score += 10;
    }
    if (state.m14_chicken) score += 10;
    if (state.m15_speakers === 'one') score += 10;
    if (state.m15_speakers === 'both') score += 20;
    
    score += (6 - state.precision_tokens) * 5 + Math.max(0, (4 - state.precision_tokens) * 5);


    return score;
  };

  const totalScore = useMemo(() => calculateScore(missions), [missions]);
  
  const handleReset = () => {
    setMissions(initialMissionState);
  };

  const MissionCheckbox = ({ id, label, field }: { id: string; label: string; field: keyof MissionState }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={missions[field] as boolean}
        onCheckedChange={(checked) => setMissions(prev => ({ ...prev, [field]: checked }))}
      />
      <Label htmlFor={id} className="cursor-pointer">{label}</Label>
    </div>
  );


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
            <span>Pontuador FLL</span>
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
                <AccordionTrigger>M01: Cinema 3D (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m01" label="O rolo de filme foi empurrado para o cinema" field="m01_3d_cinema" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m02">
                <AccordionTrigger>M02: Troca de Cena (10/20)</AccordionTrigger>
                <AccordionContent>
                    <RadioGroup value={missions.m02_scene_change} onValueChange={(value) => setMissions(prev => ({...prev, m02_scene_change: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m02-none" /><Label htmlFor="m02-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="small" id="m02-small" /><Label htmlFor="m02-small">Lado laranja para cima (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="large" id="m02-large" /><Label htmlFor="m02-large">Lado roxo para cima (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m03">
                <AccordionTrigger>M03: Experiência Imersiva (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m03" label="A tela do cinema está levantada" field="m03_immersive_experience" /></AccordionContent>
            </AccordionItem>
             <AccordionItem value="m04">
                <AccordionTrigger>M04: Obra-Prima (10/20)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m04" label="A obra-prima está no pedestal (+10)" field="m04_masterpiece" />
                    <MissionCheckbox id="m04-curator" label="O curador está na exposição (+10)" field="m04_masterpiece_curator" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m05">
                <AccordionTrigger>M05: Estátua de Realidade Aumentada (10/20)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m05" label="A estátua está no pedestal (+10)" field="m05_ar_statue" />
                    <MissionCheckbox id="m05-lever" label="A alavanca laranja foi empurrada (+20)" field="m05_ar_statue_lever" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m06">
                <AccordionTrigger>M06: Luzes e Som do Concerto (10/10)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <MissionCheckbox id="m06-lights" label="Luzes ativadas (+10)" field="m06_lights" />
                     <MissionCheckbox id="m06-sound" label="Som ativado (+10)" field="m06_sound" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m07">
                <AccordionTrigger>M07: Artista de Holograma (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m07" label="Holograma ativado" field="m07_hologram" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m08">
                <AccordionTrigger>M08: Câmera Rolante (10/20)</AccordionTrigger>
                 <AccordionContent>
                    <RadioGroup value={missions.m08_camera} onValueChange={(value) => setMissions(prev => ({...prev, m08_camera: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m08-none" /><Label htmlFor="m08-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="blue" id="m08-blue" /><Label htmlFor="m08-blue">Câmera na área azul (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pink" id="m08-pink" /><Label htmlFor="m08-pink">Câmera na área rosa (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m09">
                <AccordionTrigger>M09: Set de Filmagem (10/10)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <MissionCheckbox id="m09-prop" label="Adereço no set (+10)" field="m09_movie_set_prop" />
                     <MissionCheckbox id="m09-camera" label="Câmera no set (+10)" field="m09_movie_set_camera" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m10">
                <AccordionTrigger>M10: Mixer de Som (10/20/30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Sliders no nível: {missions.m10_sound_mixer}</Label>
                    <Slider value={[missions.m10_sound_mixer]} onValueChange={([val]) => setMissions(prev => ({...prev, m10_sound_mixer: val}))} max={3} step={1} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m11">
                <AccordionTrigger>M11: Show de Luzes (10)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m11" label="Show de luzes ativado" field="m11_light_show" /></AccordionContent>
            </AccordionItem>
             <AccordionItem value="m12">
                <AccordionTrigger>M12: Dança do Robô (20)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m12" label="O robô está na pista de dança" field="m12_robot_dance" /></AccordionContent>
            </AccordionItem>
             <AccordionItem value="m13">
                <AccordionTrigger>M13: Passeio de Barco (10/20)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m13-boat" label="O barco está na área do show (+10)" field="m13_boat" />
                    <MissionCheckbox id="m13-cargo" label="Cargas no barco (+10)" field="m13_cargo" />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m14">
                <AccordionTrigger>M14: Frango no Palco (10)</AccordionTrigger>
                <AccordionContent><MissionCheckbox id="m14" label="O frango está no palco" field="m14_chicken" /></AccordionContent>
            </AccordionItem>
            <AccordionItem value="m15">
                <AccordionTrigger>M15: Alto-falantes (10/20)</AccordionTrigger>
                <AccordionContent>
                     <RadioGroup value={missions.m15_speakers} onValueChange={(value) => setMissions(prev => ({...prev, m15_speakers: value as any}))}>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="m15-none" /><Label htmlFor="m15-none">Nenhum</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="one" id="m15-one" /><Label htmlFor="m15-one">Um alto-falante na área (+10)</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="m15-both" /><Label htmlFor="m15-both">Ambos na área (+20)</Label></div>
                    </RadioGroup>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="precision">
                <AccordionTrigger>Fichas de Precisão (50)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                     <Label>Fichas restantes: {missions.precision_tokens}</Label>
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
