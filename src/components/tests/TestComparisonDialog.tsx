
"use client";

import React from 'react';
import { RobotTest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { legoAvatars } from '@/contexts/AuthContext';
import { ArrowUp, Award, CheckCircle, XCircle, Target, Users } from 'lucide-react';

interface TestComparisonDialogProps {
    testA: RobotTest;
    testB: RobotTest;
}

const StatCard = ({ title, value, icon, className }: { title: string; value: React.ReactNode; icon: React.ReactNode, className?: string }) => (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <div className={className}>{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    </div>
);

export default function TestComparisonDialog({ testA, testB }: TestComparisonDialogProps) {
    const getPrecision = (test: RobotTest) => test.attempts > 0 ? (test.successes / test.attempts) * 100 : 0;
    
    const precisionA = getPrecision(testA);
    const precisionB = getPrecision(testB);
    
    const winner = precisionA > precisionB ? testA : (precisionB > precisionA ? testB : null);

    const renderTestDetails = (test: RobotTest, isWinner: boolean) => (
        <Card className={`flex-1 ${isWinner ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader className="relative">
                <CardTitle className="pr-10">{test.name}</CardTitle>
                {isWinner && <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full"><Award className="w-5 h-5"/></div>}
            </CardHeader>
            <CardContent className="space-y-4">
                <StatCard title="Taxa de Acerto" value={`${getPrecision(test).toFixed(0)}%`} icon={<Target className="w-6 h-6"/>} className="text-blue-500" />
                <StatCard title="Acertos" value={test.successes} icon={<CheckCircle className="w-6 h-6"/>} className="text-green-500" />
                <StatCard title="Erros" value={test.attempts - test.successes} icon={<XCircle className="w-6 h-6"/>} className="text-red-500" />
                <StatCard title="Testadores" icon={<Users className="w-6 h-6" />} value={
                    <div className="flex -space-x-2">
                         {test.testedBy.map(user => (
                            <Avatar key={user} className="h-8 w-8 border-2 border-background">
                                <AvatarImage src={legoAvatars[user]} alt={user} />
                                <AvatarFallback>{user.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                }/>
            </CardContent>
        </Card>
    );

    return (
        <div className="mt-4 space-y-6">
            <div className="flex gap-6 items-stretch">
                {renderTestDetails(testA, winner?.id === testA.id)}
                {renderTestDetails(testB, winner?.id === testB.id)}
            </div>
            <div className="text-center p-4 rounded-lg bg-accent text-accent-foreground">
                <h3 className="font-bold text-lg">Conclusão</h3>
                {winner ? (
                    <p>O teste <span className="font-bold">"{winner.name}"</span> foi superior com <span className="font-bold">{Math.max(precisionA, precisionB).toFixed(0)}%</span> de taxa de acerto.</p>
                ) : (
                    <p>Ambos os testes tiveram um desempenho de taxa de acerto idêntico.</p>
                )}
            </div>
        </div>
    );
}
