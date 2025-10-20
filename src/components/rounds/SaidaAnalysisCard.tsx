
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target } from 'lucide-react';

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

    const { missions, averagePrecision, averageTime, commonErrors } = data;

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Análise da Saída {saidaNum}</CardTitle>
                <CardDescription>
                    Métricas de desempenho para as missões planejadas nesta saída.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div>
                     <h4 className="font-semibold text-sm">Erros Mais Comuns:</h4>
                     {commonErrors.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {commonErrors.map((error: any) => <Badge key={error} variant="destructive">{error}</Badge>)}
                        </div>
                     ) : (
                         <p className="text-sm text-muted-foreground mt-1">Nenhum erro comum identificado para as missões desta saída.</p>
                     )}
                </div>
            </CardContent>
        </Card>
    );
};
