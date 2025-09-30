
"use client";

import React from 'react';
import { RobotTest } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Calendar, Target, CheckCircle, XCircle, Copy } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { legoAvatars } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface TestCardProps {
    test: RobotTest;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onSelectForComparison: (testId: string, isSelected: boolean) => boolean;
    isSelectedForComparison: boolean;
}

const getTypeBadgeVariant = (type: RobotTest['type']) => {
    switch (type) {
        case 'Anexo': return 'default';
        case 'Programação': return 'secondary';
        case 'Robô': return 'outline';
        default: return 'outline';
    }
};

const getBackgroundColorClasses = (percentage: number) => {
    if (percentage < 70) {
        return 'bg-red-100 dark:bg-red-900/40'; // Bad
    }
    return 'bg-green-100 dark:bg-green-900/40'; // Good
};


export default function TestCard({ test, onEdit, onDelete, onDuplicate, onSelectForComparison, isSelectedForComparison }: TestCardProps) {
    const { name, type, date, attempts, successes, objective, testedBy } = test;
    const successPercentage = attempts > 0 ? (successes / attempts) * 100 : 0;
    const failures = attempts - successes;

    const chartData = [
        { name: 'Acertos', value: successes },
        { name: 'Erros', value: failures },
    ];

    const COLORS = ['#22c55e', '#ef4444'];

    const isSuccess = successPercentage >= 70;
    
    return (
        <Card className={cn("flex flex-col transition-all duration-200 hover:shadow-lg aspect-square", getBackgroundColorClasses(successPercentage))}>
            <CardHeader className="flex-row items-start justify-between">
                <div className="flex-1 space-y-1">
                    <CardTitle className="leading-tight">{name}</CardTitle>
                    <CardDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 pt-1">
                        <Badge variant={getTypeBadgeVariant(type)}>{type}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5"/>
                            {format(new Date(date), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </span>
                    </CardDescription>
                </div>
                 <div className="flex items-center">
                    <Checkbox
                        checked={isSelectedForComparison}
                        onCheckedChange={(checked) => onSelectForComparison(test.id, !!checked)}
                        className="mr-2"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicar</DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center p-4 pt-0">
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" stroke="none">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> <strong>{successes}</strong> Acertos</p>
                        <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500"/> <strong>{failures}</strong> Erros</p>
                        <p className="flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/> <strong>{successPercentage.toFixed(0)}%</strong> de Precisão</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 flex flex-col items-start gap-2 bg-black/5 dark:bg-black/20 rounded-b-lg">
                <div>
                    <h4 className="font-semibold text-sm">Objetivo:</h4>
                    <p className="text-sm text-muted-foreground break-words italic">"{objective || 'Nenhum objetivo definido.'}"</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Testado por:</span>
                    <div className="flex -space-x-2">
                        {testedBy.map(user => (
                            <Avatar key={user} className="h-7 w-7 border-2 border-background">
                                <AvatarImage src={legoAvatars[user]} alt={user} />
                                <AvatarFallback>{user.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pl-2">
                        {testedBy.map(user => (
                            <span key={user} className={cn(
                                "text-sm font-medium text-white px-2 py-0.5 rounded",
                                isSuccess ? "bg-green-500" : "bg-red-500"
                            )}>
                                {user}
                            </span>
                        ))}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
