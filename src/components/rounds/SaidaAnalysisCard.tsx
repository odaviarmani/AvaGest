
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const ERROR_CHART_COLORS = { 'Humana': '#ffc658', 'Código': '#8884d8', 'Mecânica': '#ff8042' };

const StatDisplay = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

export default function SaidaAnalysisCard({ saidaNum, data }: { saidaNum: number, data: any }) {
    if (!data || data.missions.length === 0) return null;

    const { missions, averagePrecision, averageTime, errorDistribution } = data;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Análise da Saída {saidaNum}</CardTitle>
                <CardDescription>
                    Métricas de desempenho para as missões planejadas nesta saída.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Missões na Saída:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {missions.map((m: any) => <li key={m.missionKey}>{m.name} <span className="font-mono text-xs">({m.consistency.toFixed(1)}%)</span></li>)}
                        </ul>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatDisplay icon={<Clock className="text-blue-500" />} title="Tempo Médio" value={`${averageTime.toFixed(2)}s`} />
                        <StatDisplay icon={<Target className="text-green-500" />} title="Precisão Média" value={`${averagePrecision.toFixed(1)}%`} />
                    </div>
                </div>

                <div className="space-y-2">
                     <h4 className="font-semibold text-sm text-center">Distribuição de Erros da Saída</h4>
                     {errorDistribution.length > 0 ? (
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={errorDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                        {errorDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={ERROR_CHART_COLORS[entry.name as keyof typeof ERROR_CHART_COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        formatter={(value: number) => `${value.toFixed(1)}%`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                     ) : (
                         <div className="text-center text-muted-foreground text-sm pt-8">
                             <p>Nenhum erro registrado para as missões desta saída.</p>
                         </div>
                     )}
                </div>

            </CardContent>
        </Card>
    );
};
