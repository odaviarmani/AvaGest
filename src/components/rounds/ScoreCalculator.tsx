"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2 } from 'lucide-react';

interface MissionState {
    // Pré-jogo
    m00_equipment_inspection: boolean;
    // Missões
    m01_surface_brushing: {
        soil_deposits_cleaned: number;
        brush_not_touching: boolean;
    };
    m02_map_reveal: number;
    m03_mine_shaft_explorer: {
        team_cart_reaches_opponent: boolean;
        opponent_cart_in_your_field: boolean;
    };
    m04_careful_retrieval: {
        artifact_not_touching_mine: boolean;
        support_structures_standing: boolean;
    };
    m05_who_lived_here: boolean;
    m06_forge: number;
    m07_heavy_lifting: boolean;
    m08_silo: number;
    m09_whats_on_sale: {
        roof_lifted: boolean;
        market_goods_lifted: boolean;
    };
    m10_tip_the_scales: {
        scales_tipped: boolean;
        pan_removed: boolean;
    };
    m11_fisher_artifacts: {
        artifacts_elevated: boolean;
        crane_flag_raised: boolean;
    };
    m12_salvage_operation: {
        sand_cleared: boolean;
        ship_lifted: boolean;
    };
    m13_statue_reconstruction: boolean;
    m14_forum: {
        artifacts: number;
    };
    m15_site_marking: number;
    // Bônus
    precision_tokens: number;
}


const initialMissionState: MissionState = {
    m00_equipment_inspection: false,
    m01_surface_brushing: { soil_deposits_cleaned: 0, brush_not_touching: false },
    m02_map_reveal: 0,
    m03_mine_shaft_explorer: { team_cart_reaches_opponent: false, opponent_cart_in_your_field: false },
    m04_careful_retrieval: { artifact_not_touching_mine: false, support_structures_standing: false },
    m05_who_lived_here: false,
    m06_forge: 0,
    m07_heavy_lifting: false,
    m08_silo: 0,
    m09_whats_on_sale: { roof_lifted: false, market_goods_lifted: false },
    m10_tip_the_scales: { scales_tipped: false, pan_removed: false },
    m11_fisher_artifacts: { artifacts_elevated: false, crane_flag_raised: false },
    m12_salvage_operation: { sand_cleared: false, ship_lifted: false },
    m13_statue_reconstruction: false,
    m14_forum: { artifacts: 0 },
    m15_site_marking: 0,
    precision_tokens: 6,
};


export default function ScoreCalculator() {
  const [missions, setMissions] = useState<MissionState>(initialMissionState);

  const calculateScore = (state: MissionState): number => {
    let score = 0;
    
    // M00
    if (state.m00_equipment_inspection) score += 20;

    // M01
    score += state.m01_surface_brushing.soil_deposits_cleaned * 10;
    if (state.m01_surface_brushing.brush_not_touching) score += 10;

    // M02
    score += state.m02_map_reveal * 10;

    // M03
    if (state.m03_mine_shaft_explorer.team_cart_reaches_opponent) score += 30;
    if (state.m03_mine_shaft_explorer.opponent_cart_in_your_field) score += 10;

    // M04
    if (state.m04_careful_retrieval.artifact_not_touching_mine) score += 30;
    if (state.m04_careful_retrieval.support_structures_standing) score += 10;

    // M05
    if (state.m05_who_lived_here) score += 30;
    
    // M06
    score += state.m06_forge * 10;

    // M07
    if (state.m07_heavy_lifting) score += 30;
    
    // M08
    score += state.m08_silo * 10;
    
    // M09
    if (state.m09_whats_on_sale.roof_lifted) score += 20;
    if (state.m09_whats_on_sale.market_goods_lifted) score += 10;
    
    // M10
    if (state.m10_tip_the_scales.scales_tipped) score += 20;
    if (state.m10_tip_the_scales.pan_removed) score += 10;
    
    // M11
    if (state.m11_fisher_artifacts.artifacts_elevated) score += 20;
    if (state.m11_fisher_artifacts.crane_flag_raised) score += 10;
    
    // M12
    if (state.m12_salvage_operation.sand_cleared) score += 20;
    if (state.m12_salvage_operation.ship_lifted) score += 10;
    
    // M13
    if (state.m13_statue_reconstruction) score += 30;
    
    // M14
    score += state.m14_forum.artifacts * 5;
    
    // M15
    score += state.m15_site_marking * 10;
    
    // Fichas de Precisão
    const tokens = state.precision_tokens;
    if (tokens >= 5) score += 50;
    else if (tokens === 4) score += 35;
    else if (tokens === 3) score += 25;
    else if (tokens === 2) score += 15;
    else if (tokens === 1) score += 10;
    
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
        <Accordion type="multiple" className="w-full" defaultValue={['m00']}>
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
                        <Label>Depósitos de solo limpos: {missions.m01_surface_brushing.soil_deposits_cleaned}</Label>
                        <Slider value={[missions.m01_surface_brushing.soil_deposits_cleaned]} onValueChange={([val]) => setMissions(prev => ({...prev, m01_surface_brushing: {...prev.m01_surface_brushing, soil_deposits_cleaned: val}}))} max={2} step={1} />
                        <p className="text-sm text-muted-foreground">+10 pontos por depósito</p>
                    </div>
                    <MissionCheckbox id="m01_brush" label="Escova não toca o local da escavação (10)" checked={missions.m01_surface_brushing.brush_not_touching} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m01_surface_brushing: {...prev.m01_surface_brushing, brush_not_touching: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m02">
                <AccordionTrigger>M02 – Revelação do Mapa (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Seções de solo superficial limpas: {missions.m02_map_reveal}</Label>
                    <Slider value={[missions.m02_map_reveal]} onValueChange={([val]) => setMissions(prev => ({...prev, m02_map_reveal: val}))} max={3} step={1} />
                    <p className="text-sm text-muted-foreground">+10 pontos por seção</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m03">
                <AccordionTrigger>M03 – Explorador de Poços de Minas (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m03_team_cart" label="Seu carrinho chega ao campo adversário (30)" checked={missions.m03_mine_shaft_explorer.team_cart_reaches_opponent} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m03_mine_shaft_explorer: {...prev.m03_mine_shaft_explorer, team_cart_reaches_opponent: checked} }))} />
                    <MissionCheckbox id="m03_opponent_cart" label="Carrinho adversário no seu campo (10)" checked={missions.m03_mine_shaft_explorer.opponent_cart_in_your_field} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m03_mine_shaft_explorer: {...prev.m03_mine_shaft_explorer, opponent_cart_in_your_field: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m04">
                <AccordionTrigger>M04 – Recuperação Cuidadosa (40)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m04_artifact" label="Artefato precioso não toca a mina (30)" checked={missions.m04_careful_retrieval.artifact_not_touching_mine} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m04_careful_retrieval: {...prev.m04_careful_retrieval, artifact_not_touching_mine: checked} }))} />
                    <MissionCheckbox id="m04_support" label="Ambas as estruturas de suporte de pé (10)" checked={missions.m04_careful_retrieval.support_structures_standing} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m04_careful_retrieval: {...prev.m04_careful_retrieval, support_structures_standing: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m05">
                <AccordionTrigger>M05 – Quem Morou Aqui? (30)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m05" label="Piso da estrutura completamente vertical (30)" checked={missions.m05_who_lived_here} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m05_who_lived_here: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m06">
                <AccordionTrigger>M06 – Forja (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Blocos de minério fora da forja: {missions.m06_forge}</Label>
                    <Slider value={[missions.m06_forge]} onValueChange={([val]) => setMissions(prev => ({...prev, m06_forge: val}))} max={3} step={1} />
                    <p className="text-sm text-muted-foreground">+10 pontos por bloco</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m07">
                <AccordionTrigger>M07 – Trabalho Pesado (30)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m07" label="Pedra de moinho não toca a base (30)" checked={missions.m07_heavy_lifting} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m07_heavy_lifting: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m08">
                <AccordionTrigger>M08 – Silo (20)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Peças preservadas fora do silo: {missions.m08_silo}</Label>
                    <Slider value={[missions.m08_silo]} onValueChange={([val]) => setMissions(prev => ({...prev, m08_silo: val}))} max={2} step={1} />
                    <p className="text-sm text-muted-foreground">+10 pontos por peça</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m09">
                <AccordionTrigger>M09 – O que está à venda? (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m09_roof" label="Teto completamente levantado (20)" checked={missions.m09_whats_on_sale.roof_lifted} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m09_whats_on_sale: {...prev.m09_whats_on_sale, roof_lifted: checked} }))} />
                    <MissionCheckbox id="m09_goods" label="Produtos do mercado levantados (10)" checked={missions.m09_whats_on_sale.market_goods_lifted} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m09_whats_on_sale: {...prev.m09_whats_on_sale, market_goods_lifted: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m10">
                <AccordionTrigger>M10 – Inclinar a Balança (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m10_scales" label="Balança inclinada (20)" checked={missions.m10_tip_the_scales.scales_tipped} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m10_tip_the_scales: {...prev.m10_tip_the_scales, scales_tipped: checked} }))} />
                    <MissionCheckbox id="m10_pan" label="Prato da balança removido (10)" checked={missions.m10_tip_the_scales.pan_removed} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m10_tip_the_scales: {...prev.m10_tip_the_scales, pan_removed: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m11">
                <AccordionTrigger>M11 – Artefatos de Pescadores (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m11_artifacts" label="Artefatos elevados (20)" checked={missions.m11_fisher_artifacts.artifacts_elevated} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m11_fisher_artifacts: {...prev.m11_fisher_artifacts, artifacts_elevated: checked} }))} />
                    <MissionCheckbox id="m11_flag" label="Bandeira do guindaste levantada (10)" checked={missions.m11_fisher_artifacts.crane_flag_raised} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m11_fisher_artifacts: {...prev.m11_fisher_artifacts, crane_flag_raised: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m12">
                <AccordionTrigger>M12 – Operação de Salvamento (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <MissionCheckbox id="m12_sand" label="Areia completamente limpa (20)" checked={missions.m12_salvage_operation.sand_cleared} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m12_salvage_operation: {...prev.m12_salvage_operation, sand_cleared: checked} }))} />
                    <MissionCheckbox id="m12_ship" label="Navio completamente levantado (10)" checked={missions.m12_salvage_operation.ship_lifted} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m12_salvage_operation: {...prev.m12_salvage_operation, ship_lifted: checked} }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m13">
                <AccordionTrigger>M13 – Reconstrução da Estátua (30)</AccordionTrigger>
                <AccordionContent>
                    <MissionCheckbox id="m13" label="Estátua completamente levantada (30)" checked={missions.m13_statue_reconstruction} onCheckedChange={(checked) => setMissions(prev => ({ ...prev, m13_statue_reconstruction: checked }))} />
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="m14">
                <AccordionTrigger>M14 – Fórum (35)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Discos da Missão no fórum: {missions.m14_forum.artifacts}</Label>
                    <Slider value={[missions.m14_forum.artifacts]} onValueChange={([val]) => setMissions(prev => ({...prev, m14_forum: { artifacts: val }}))} max={7} step={1} />
                    <p className="text-sm text-muted-foreground">+5 pontos por disco</p>
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="m15">
                <AccordionTrigger>M15 – Marcação de Local (30)</AccordionTrigger>
                <AccordionContent className="space-y-2">
                    <Label>Bandeiras no local: {missions.m15_site_marking}</Label>
                    <Slider value={[missions.m15_site_marking]} onValueChange={([val]) => setMissions(prev => ({...prev, m15_site_marking: val}))} max={3} step={1} />
                    <p className="text-sm text-muted-foreground">+10 pontos por bandeira</p>
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
