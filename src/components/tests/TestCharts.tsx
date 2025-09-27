
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RobotTest } from '@/lib/types';
import { format } from 'date-fns';

interface TestChartsProps {
    tests: RobotTest[];
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

export default function TestCharts({ tests }: TestChartsProps) {
    const chartData = useMemo(() => {
        return tests.map(test => ({
            ...test,
            successPercentage: test.attempts > 0 ? (test.successes / test.attempts) * 100 : 0,
            dateFormatted: format(test.date, 'dd/MM'),
        }));
    }, [tests]);

    const typeDistribution = useMemo(() => {
        const counts = tests.reduce((acc, test) => {
            acc[test.type] = (acc[test.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [tests]);

    if (tests.length === 0) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <p>Adicione testes para ver os gráficos de desempenho.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Sucesso dos Testes</CardTitle>
                    <CardDescription>Evolução da porcentagem de acerto ao longo do tempo.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="dateFormatted" />
                            <YAxis domain={[0, 100]} unit="%" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                                labelFormatter={(label, payload) => `${payload?.[0]?.payload.name || ''} - ${label}`}
                                formatter={(value: number) => [`${value.toFixed(0)}%`, 'Sucesso']}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="successPercentage" name="Taxa de Sucesso" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Distribuição de Tipos de Teste</CardTitle>
                    <CardDescription>Quantos testes foram registrados para cada categoria.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {typeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
