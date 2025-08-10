"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, Award, BarChart3, Trophy } from 'lucide-react';

const statsData = {
  totalRounds: 12,
  averagePoints: 1580,
  recordPoints: 2150,
  averageEvolution: 15,
};

const stats = [
  {
    title: 'Total de Rounds',
    value: statsData.totalRounds,
    icon: BarChart3,
    description: 'Rounds concluídos até o momento.',
  },
  {
    title: 'Média de Pontos',
    value: statsData.averagePoints.toLocaleString('pt-BR'),
    icon: Award,
    description: 'Pontuação média por round.',
  },
  {
    title: 'Recorde de Pontos',
    value: statsData.recordPoints.toLocaleString('pt-BR'),
    icon: Trophy,
    description: 'Maior pontuação atingida.',
  },
  {
    title: 'Evolução Média',
    value: `${statsData.averageEvolution}%`,
    icon: ArrowUp,
    description: 'Crescimento médio entre rounds.',
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
