

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart as RechartsBarChart, LineChart, Pie, Sector, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Cell } from 'recharts';
import { type RoundData, MissionState, initialMissionState } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BarChart, Clock, Target, ListTree, AlertCircle, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';


const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const missionLabels: { [key: string]: string } = {
    m00_equipment_inspection: "M00 - Inspeção de Equipamentos",
    m01_surface_brushing: "M01 - Escovação de Superfícies",
    m02_map_reveal: "M02 - Revelação do Mapa",
    m03_mine_shaft_explorer: "M03 - Explorador do Poço da Mina",
    m04_careful_retrieval: "M04 - Recuperação Cuidadosa",
    m05_who_lived_here: "M05 - Quem Morava Aqui?",
    m06_forge: "M06 - Forja",
    m07_heavy_lifting: "M07 - Levantamento de Peso",
    m08_silo: "M08 - Silo",
    m09_whats_on_sale: "M09 - O que Está à Venda",
    m10_tip_the_scales: "M10 - Virar a Balança",
    m11_fisher_artifacts: "M11 - Artefatos de Fisher",
    m12_salvage_operation: "M12 - Operação de Resgate",
    m13_statue_reconstruction: "M13 - Reconstrução da Estátua",
    m14_forum: "M14 - Fórum",
    m15_site_marking: "M15 - Marcação de Local",
    precision_tokens: "Fichas de Precisão"
};

const isMissionCompleted = (missionKey: keyof MissionState, missionState: MissionState) => {
    // Handle cases where older round data might not have the `missions` property.
    if (!missionState) {
        return false;
    }
    const value = missionState[missionKey];
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'object' && value !== null) {
        if ('soil_deposits_cleaned' in value) { // M01
            return value.soil_deposits_cleaned > 0 || value.brush_not_touching;
        }
        if ('part1' in value) { // M02, M06, M08
            return value.part1 || value.part2 || value.part3;
        }
        if ('explored' in value) { // M03
            return value.explored || value.gold_retrieved;
        }
        if ('retrieved' in value) { // M04, M11
            return value.retrieved || ('not_broken' in value && value.not_broken) || ('on_pedestal' in value && value.on_pedestal);
        }
        if ('store_open' in value) { // M09
            return value.store_open || value.item_on_pedestal;
        }
        if ('tipped' in value) { // M10
            return value.tipped || value.both_sides_down;
        }
        if ('raised' in value) { // M12
            return value.raised || value.animals_moved;
        }
         if ('artifacts' in value) { // M14
            return value.artifacts > 0;
        }
        if ('locations' in value) { // M15
            return value.locations > 0;
        }
    }
    if(missionKey === 'precision_tokens' && typeof value === 'number') {
        return value > 0;
    }
    return false;
};

export default function RoundsStatsPage() {
    const [history, setHistory] = useState<RoundData[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [roundCount, setRoundCount] = useState<number | 'all'>('all');

    useEffect(() => {
        setIsClient(true);
        const savedHistory = localStorage.getItem('roundsHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const filteredHistory = useMemo(() => {
        if (roundCount === 'all') return history;
        return history.slice(-roundCount);
    }, [history, roundCount]);

    const stats = useMemo(() => {
        if (filteredHistory.length === 0) return null;

        const reversedHistory = [...filteredHistory].reverse();

        const totalScore = reversedHistory.reduce((acc, round) => acc + round.score, 0);
        const averageScore = totalScore / reversedHistory.length;

        const scoreHistoryData = reversedHistory.map((round, index) => ({
            name: `Round ${index + 1}`,
            score: round.score,
            date: new Date(round.date).toLocaleString('pt-BR'),
        }));

        const errorCausesCount = reversedHistory.flatMap(r => r.errors).reduce((acc, cause) => {
            acc[cause] = (acc[cause] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const errorCausesData = Object.entries(errorCausesCount).map(([name, value]) => ({ name, value }));

        const programmingTypesCount = reversedHistory.flatMap(r => r.programming).reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const programmingTypesData = Object.entries(programmingTypesCount).map(([name, value]) => ({ name, value }));
        
        const stageAverages: Record<string, { total: number, count: number }> = {};
        
        reversedHistory.forEach(round => {
            round.timings.forEach(timing => {
                if(!stageAverages[timing.name]) {
                     stageAverages[timing.name] = { total: 0, count: 0 };
                }
                if (timing.duration !== null) {
                    stageAverages[timing.name].total += timing.duration;
                    stageAverages[timing.name].count += 1;
                }
            });
        });

        const averageTimingsData = Object.entries(stageAverages).map(([name, { total, count }]) => ({
            name,
            averageTime: count > 0 ? parseFloat(((total / count) / 1000).toFixed(2)) : 0,
        }));
        
        const missionPerformance = (Object.keys(initialMissionState) as Array<keyof MissionState>).map(key => {
            const completedCount = reversedHistory.filter(round => isMissionCompleted(key, round.missions)).length;
            const consistency = reversedHistory.length > 0 ? (completedCount / reversedHistory.length) * 100 : 0;
            
            const errorsInFailedRounds: Record<string, number> = {};
            reversedHistory
                .filter(round => !isMissionCompleted(key, round.missions))
                .forEach(round => {
                    round.errors.forEach(error => {
                         if (error !== "Nenhuma") {
                            errorsInFailedRounds[error] = (errorsInFailedRounds[error] || 0) + 1;
                        }
                    })
                });

            const mostCommonError = Object.entries(errorsInFailedRounds).sort((a,b) => b[1] - a[1])[0];

            return {
                name: missionLabels[key] || key,
                consistency,
                mostCommonError: mostCommonError ? mostCommonError[0] : 'N/A',
            };
        }).filter(item => item.name);


        return {
            totalRounds: reversedHistory.length,
            averageScore,
            scoreHistoryData,
            errorCausesData,
            programmingTypesData,
            averageTimingsData,
            missionPerformance,
        };
    }, [filteredHistory]);

    if (!isClient) {
        return (
            <div className="flex-1 p-4 md:p-8">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        )
    }

    if (history.length === 0) {
        return (
            <div className="flex-1 p-4 md:p-8">
                 <header className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                        <Link href="/rounds">
                            <ArrowLeft />
                            <span className="sr-only">Voltar para Rounds</span>
                        </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Estatísticas dos Rounds</h1>
                            <p className="text-muted-foreground">
                            Análise do histórico de pontuações, tempos e erros.
                            </p>
                        </div>
                    </div>
                </header>
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">Não há dados de rounds registrados para exibir estatísticas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                    <Link href="/rounds">
                        <ArrowLeft />
                        <span className="sr-only">Voltar para Rounds</span>
                    </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Estatísticas dos Rounds</h1>
                        <p className="text-muted-foreground">
                        Análise do histórico de pontuações, tempos e erros.
                        </p>
                    </div>
                </div>
                 <div className="space-y-2 w-48">
                    <Label htmlFor="round-count-select">Visualizar Rounds</Label>
                    <Select
                        value={roundCount === 'all' ? 'all' : String(roundCount)}
                        onValueChange={(val) => setRoundCount(val === 'all' ? 'all' : Number(val))}
                    >
                        <SelectTrigger id="round-count-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos ({history.length})</SelectItem>
                            {[3, 5, 10, 20].map(num => 
                                history.length >= num && <SelectItem key={num} value={String(num)}>Últimos {num}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </header>
            
            {!stats ? (
                 <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">Não há dados de rounds para o filtro selecionado.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Rounds</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.totalRounds}</p>
                                <p className="text-xs text-muted-foreground">Rounds analisados</p>
                            </CardContent>
                        </Card>
                        <Card>
                           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Média de Pontuação</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Média de pontos por round</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Pontuação</CardTitle>
                            <CardDescription>Evolução da pontuação ao longo dos rounds.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.scoreHistoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))'
                                        }}
                                        labelFormatter={(label, payload) => `${label} - ${payload?.[0]?.payload.date || ''}`}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" name="Pontuação" stroke="hsl(var(--primary))" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Causas de Erros</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.errorCausesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                            {stats.errorCausesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tipos de Programação Usados</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={stats.programmingTypesData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" width={80}/>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                                        <Legend />
                                        <Bar dataKey="value" name="Vezes Utilizado">
                                            {stats.programmingTypesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Análise de Desempenho por Missão</CardTitle>
                            <CardDescription>Consistência de sucesso e principal causa de falha para cada missão.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%]">Missão</TableHead>
                                        <TableHead>Consistência</TableHead>
                                        <TableHead className="text-right">Principal Causa de Falha</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.missionPerformance.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm">{item.consistency.toFixed(1)}%</span>
                                                    <Progress value={item.consistency} className="w-24 h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.mostCommonError}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Média de Tempo por Etapa</CardTitle>
                            <CardDescription>Tempo médio em segundos para cada etapa do round.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Etapa</TableHead>
                                        <TableHead className="text-right">Tempo Médio (s)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.averageTimingsData.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right font-mono">{item.averageTime.toFixed(3)}s</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
