import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const notifications = [
    {
        id: 1,
        type: 'success',
        title: 'Nova versão do App!',
        message: 'A versão 2.1 já está disponível com melhorias de performance e novas funcionalidades na aba de Roletas.',
        date: '2 dias atrás',
        icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
        id: 2,
        type: 'warning',
        title: 'Atenção ao Prazo',
        message: 'A tarefa "Revisar copy do site" do Kanban vence em 3 dias. Não se esqueça de concluir!',
        date: '1 dia atrás',
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />
    },
    {
        id: 3,
        type: 'info',
        title: 'Manutenção Programada',
        message: 'O sistema estará em manutenção no próximo sábado das 14:00 às 15:00 para atualizações no servidor.',
        date: '4 dias atrás',
        icon: <Info className="h-6 w-6 text-blue-500" />
    },
    {
        id: 4,
        type: 'info',
        title: 'Core Values',
        message: 'Nova equipe de Alagoas registrada no mapa de Core Values. Confira!',
        date: '5 dias atrás',
        icon: <Info className="h-6 w-6 text-blue-500" />
    },
];


export default function NotificationsPage() {
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
                {notifications.map((notification) => (
                    <Card key={notification.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {notification.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    <span className="text-xs text-muted-foreground">{notification.date}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                 {notifications.length === 0 && (
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
