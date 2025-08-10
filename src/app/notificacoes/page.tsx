"use client";

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/types';
import { differenceInDays, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    date: string;
    icon: React.ReactNode;
}

const generateDeadlineNotifications = (tasks: Task[]): Notification[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
        .filter(task => task.dueDate && task.columnId !== 'Feito')
        .map(task => ({
            ...task,
            dueDate: typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate
        }))
        .filter(task => {
            const dueDate = task.dueDate!;
            dueDate.setHours(0, 0, 0, 0);
            const daysUntilDue = differenceInDays(dueDate, today);
            return daysUntilDue >= 0 && daysUntilDue <= 3;
        })
        .map(task => {
            const dueDate = task.dueDate!;
            const timeDistance = formatDistanceToNow(dueDate, { addSuffix: true, locale: ptBR });
            return {
                id: `task-${task.id}`,
                type: 'warning',
                title: `Atenção ao Prazo: ${task.name}`,
                message: `Esta tarefa vence ${timeDistance}. Não se esqueça de concluir!`,
                date: new Date().toISOString(),
                icon: <CalendarClock className="h-6 w-6 text-yellow-500" />,
            };
        });
};


const staticNotifications: Notification[] = [
    {
        id: 'new-version',
        type: 'success',
        title: 'Nova versão do App!',
        message: 'A versão 2.1 já está disponível com melhorias de performance e novas funcionalidades na aba de Roletas.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
        id: 'maintenance',
        type: 'info',
        title: 'Manutenção Programada',
        message: 'O sistema estará em manutenção no próximo sábado das 14:00 às 15:00 para atualizações no servidor.',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        icon: <Info className="h-6 w-6 text-blue-500" />
    },
];


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedTasks = localStorage.getItem('kanbanTasks');
        if (savedTasks) {
            const tasks: Task[] = JSON.parse(savedTasks);
            const deadlineNotifications = generateDeadlineNotifications(tasks);
            const allNotifications = [...deadlineNotifications, ...staticNotifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotifications(allNotifications);
        } else {
             setNotifications(staticNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, []);
    

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex items-center gap-4">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Notificações</h1>
                    <p className="text-muted-foreground">
                        Fique por dentro das últimas atualizações e avisos importantes.
                    </p>
                </div>
            </header>

            <div className="max-w-3xl mx-auto space-y-4">
                {isClient && notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <Card key={notification.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {notification.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold">{notification.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                           {formatDistanceToNow(new Date(notification.date), { locale: ptBR, addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                     <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[40vh]">
                        <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Nenhuma notificação
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Você não possui novas notificações no momento.
                        </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
