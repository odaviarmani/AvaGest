
"use client";

import React, { useState, useEffect } from 'react';
import { Robot, MessageSquare, X, Frown, Smile, Meh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const messagesByPath: Record<string, string[]> = {
    '/kanban': [
        "Organize suas tarefas para mantermos o foco!",
        "Arraste e solte as tarefas para mudar o status delas.",
        "Não se esqueça de definir as prioridades!"
    ],
    '/calendar': [
        "Veja as datas de entrega no calendário para não perder nenhum prazo.",
        "Clique em um dia para ver as tarefas associadas.",
        "Uma boa organização do tempo é a chave do sucesso!"
    ],
    '/strategy': [
        "Use esta tela para planejar nossas estratégias de round.",
        "Desenhe no mapa e o pseudocódigo será gerado. Que demais!",
        "Cada saída é um plano. Vamos pensar em todas as possibilidades."
    ],
    '/rounds': [
        "Aqui registramos cada round. A evolução é o mais importante!",
        "Lembre-se de preencher a causa do erro, isso nos ajuda a melhorar.",
        "Compare os tempos das etapas para ver onde podemos otimizar."
    ],
    'default': [
        "Olá! Tudo bem por aqui?",
        "Precisando de ajuda com alguma coisa?",
        "Vamos lá, equipe! Foco total!",
        "Lembre-se: Gracious Professionalism sempre!",
        "Que tal ouvir nossa playlist para se concentrar?",
        "Já deu uma olhada nas notificações hoje?",
        "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    ]
};

const emotions = [
    { name: 'happy', icon: <Smile className="w-8 h-8 text-green-400" /> },
    { name: 'neutral', icon: <Meh className="w-8 h-8 text-yellow-400" /> },
    { name: 'thinking', icon: <Robot className="w-8 h-8 text-blue-400" /> },
    { name: 'sad', icon: <Frown className="w-8 h-8 text-red-400" /> },
];


export default function HelperBot() {
    const [isVisible, setIsVisible] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
    const pathname = usePathname();

    useEffect(() => {
        // Show the bot after a delay when the component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        // Change message and emotion every 15 seconds
        const interval = setInterval(() => {
            const possibleMessages = messagesByPath[pathname] || messagesByPath.default;
            const randomMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
            const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
            
            setCurrentMessage(randomMessage);
            setCurrentEmotion(randomEmotion);
            setIsChatting(true);
        }, 15000);

        return () => clearInterval(interval);
    }, [isVisible, pathname]);

    useEffect(() => {
        // Hide message bubble after 8 seconds
        if (isChatting) {
            const timer = setTimeout(() => {
                setIsChatting(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [isChatting]);

    const handleBotClick = () => {
        if (isChatting) {
            setIsChatting(false);
        } else {
             const possibleMessages = messagesByPath[pathname] || messagesByPath.default;
            const randomMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
            setCurrentMessage(randomMessage);
            setIsChatting(true);
        }
    };
    
    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
            {isChatting && (
                <div className={cn(
                    "relative max-w-xs bg-card border rounded-lg p-4 shadow-lg animate-in fade-in-50 slide-in-from-bottom-5"
                )}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => setIsChatting(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <p className="text-sm text-card-foreground">{currentMessage}</p>
                </div>
            )}
            <Button
                size="icon"
                className={cn(
                    "rounded-full w-16 h-16 shadow-2xl relative transition-transform duration-300 hover:scale-110",
                    isChatting ? 'animate-none' : 'animate-bounce'
                )}
                style={{ animationIterationCount: isChatting ? 0 : 3 }}
                onClick={handleBotClick}
            >
                {currentEmotion.icon}
            </Button>
        </div>
    );
}
