
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Cell } from 'recharts';
import { type RobotTest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

export default function TestsStatsPage() {
    const [tests, setTests] = useState<RobotTest[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedTests = localStorage.getItem('robotTests');
        if (savedTests) {
            const parsedTests = JSON.parse(savedTests).map((test: RobotTest) => ({
                ...test,
                date: new Date(test.date),
            }));
            setTests(parsedTests);
        }
    }, []);

    const chartData = React.useMemo(() => {
        return tests.map(test => ({
            ...test,
            successPercentage: test.attempts > 0 ? (test.successes / test.attempts) * 100 : 0,
            dateFormatted: format(test.date, 'dd/MM'),
        }));
    }, [tests]);

    const typeDistribution = React.useMemo(() => {
        const counts = tests.reduce((acc, test) => {
            acc[test.type] = (acc[test.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [tests]);

    if (!isClient) {
        return (
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        )
    }

    if (tests.length === 0) {
        return (
             <div className="flex-1 p-4 md:p-8">
                 <header className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                        <Link href="/tests">
                            <ArrowLeft />
                            <span className="sr-only">Voltar para Testes</span>
                        </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Estatísticas de Testes</h1>
                            <p className="text-muted-foreground">
                                Análise gráfica do histórico de testes da equipe.
                            </p>
                        </div>
                    </div>
                </header>
                <div className="text-center py-16">
                    <p className="text-lg text-muted-foreground">Não há testes registrados para exibir estatísticas.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                    <Link href="/tests">
                        <ArrowLeft />
                        <span className="sr-only">Voltar para Testes</span>
                    </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Estatísticas de Testes</h1>
                        <p className="text-muted-foreground">
                           Análise gráfica do histórico de testes da equipe.
                        </p>
                    </div>
                </div>
            </header>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Taxa de Acerto dos Testes</CardTitle>
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
                                    formatter={(value: number) => [`${value.toFixed(0)}%`, 'Taxa de Acerto']}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="successPercentage" name="Taxa de Acerto" stroke="hsl(var(--primary))" strokeWidth={2} />
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
        </div>
    );
}
