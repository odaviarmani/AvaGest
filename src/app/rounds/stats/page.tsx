

"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart as RechartsBarChart, LineChart, Pie, Sector, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Cell } from 'recharts';
import { type RoundData } from '@/components/rounds/RoundLog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, BarChart, Clock, Target, ListTree } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

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
        return history.slice(0, roundCount);
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


        return {
            totalRounds: reversedHistory.length,
            averageScore,
            scoreHistoryData,
            errorCausesData,
            programmingTypesData,
            averageTimingsData
        };
    }, [filteredHistory]);

    if (!isClient) {
        return (
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
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
                            <CardHeader>
                                <CardTitle>Total de Rounds</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{stats.totalRounds}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Média de Pontuação</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{stats.averageScore.toFixed(1)}</p>
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
