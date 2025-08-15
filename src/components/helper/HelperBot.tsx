
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { askCounselor } from '@/ai/flows/bot-counselor-flow';

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
        "Olá, nobre equipe! Em que posso ser útil hoje?",
        "Precisando de um conselho real?",
        "Vamos lá, equipe! Rumo à glória!",
        "Lembre-se: Gracious Professionalism sempre nos guia!",
        "Que tal ouvir nossa playlist real para inspirar a jornada?",
        "Já conferiu as notificações do reino hoje?",
        "O sucesso é a soma de pequenos esforços, repetidos com majestade dia após dia.",
    ]
};

interface ChatMessage {
    type: 'user' | 'bot';
    text: string;
}


const AnimatedBotIcon = ({ isTalking, isBlinking }: { isTalking: boolean, isBlinking: boolean }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Headset Earpiece Right */}
        <path d="M 88,45 a 12,12 0 1,1 0,20 a 10,10 0 0,0 0,-20" fill="#3b82f6" />

        {/* Head */}
        <path d="M 15 75 Q 10 50, 15 25 L 85 25 Q 90 50, 85 75 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="2" />
        
        {/* Headset Band */}
        <path d="M 30 25 C 30 10, 70 10, 70 25" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* Headset Earpiece Left */}
        <path d="M 12,45 a 12,12 0 1,0 0,20 a 10,10 0 0,1 0,-20" fill="#3b82f6" />
        
        {/* Face Screen */}
        <rect x="20" y="30" width="60" height="50" rx="10" fill="#000000" />
        
        {/* Eyes */}
        {!isBlinking && (
            <>
                <circle cx="38" cy="48" r="6" fill="#22d3ee" className="animate-pulse" />
                <circle cx="62" cy="48" r="6" fill="#22d3ee" className="animate-pulse" />
            </>
        )}
        
        {/* Blinking Lids */}
        {isBlinking && (
            <>
                <path d="M 32 50 C 38 46, 44 46, 50 50" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round" transform="translate(-6, -2)"/>
                <path d="M 56 50 C 62 46, 68 46, 74 50" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round" transform="translate(-2, -2)"/>
            </>
        )}

        {/* Mouth */}
        {isTalking ? (
            <ellipse cx="50" cy="68" rx="8" ry="4" fill="#22d3ee" />
        ) : (
            <path d="M 42 68 Q 50 73, 58 68" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        )}
    </svg>
);


export default function HelperBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [conversation, setConversation] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [proactiveMessage, setProactiveMessage] = useState('');
    const [showProactiveBubble, setShowProactiveBubble] = useState(false);
    
    // Animation state
    const [isBlinking, setIsBlinking] = useState(false);

    const pathname = usePathname();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Blinking effect
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }, 4000);
        return () => clearInterval(blinkInterval);
    }, []);

    // Proactive message bubble
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isOpen) {
                const possibleMessages = messagesByPath[pathname] || messagesByPath.default;
                const randomMessage = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
                setProactiveMessage(randomMessage);
                setShowProactiveBubble(true);
            }
        }, 20000);
        return () => clearInterval(interval);
    }, [isOpen, pathname]);

    // Hide proactive bubble after some time
    useEffect(() => {
        if (showProactiveBubble) {
            const timer = setTimeout(() => {
                setShowProactiveBubble(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [showProactiveBubble]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                setTimeout(() => scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' }), 100);
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { type: 'user', text: inputValue };
        setConversation(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInputValue('');
        
        setTimeout(scrollToBottom, 0);

        try {
            const result = await askCounselor({ query: userMessage.text });
            const botMessage: ChatMessage = { type: 'bot', text: result.response };
            setConversation(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { type: 'bot', text: "Oh, céus! Parece que meus circuitos reais estão um pouco confusos. Poderia tentar novamente?" };
            setConversation(prev => [...prev, errorMessage]);
            console.error("Error asking counselor:", error);
        } finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 0);
        }
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setShowProactiveBubble(false);
        if (!isOpen && conversation.length === 0) {
            setConversation([{ type: 'bot', text: "Saudações, nobre equipe! Como posso assisti-los nesta jornada?" }]);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
            {isOpen && (
                <Card className="w-80 h-[500px] flex flex-col shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5">
                    <CardHeader className="flex-row items-center justify-between border-b p-3">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <CardTitle className="text-lg">Conselheiro Real</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={toggleOpen}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-3" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {conversation.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "flex items-start gap-2 text-sm",
                                            msg.type === 'user' ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "rounded-lg px-3 py-2 max-w-[85%]",
                                            msg.type === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="rounded-lg px-3 py-2 bg-secondary flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Pensando...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-3 border-t">
                        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Pergunte ao conselheiro..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ''}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {!isOpen && showProactiveBubble && (
                <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs animate-in fade-in-20 slide-in-from-bottom-2">
                    <p className="text-sm text-card-foreground">{proactiveMessage}</p>
                </div>
            )}
            
            <button
                className="rounded-full w-20 h-20 bg-background/80 backdrop-blur-sm border shadow-2xl relative transition-transform duration-300 hover:scale-110 cursor-pointer"
                onClick={toggleOpen}
                aria-label="Abrir Conselheiro Real"
            >
               <AnimatedBotIcon isTalking={isLoading} isBlinking={isBlinking}/>
            </button>
        </div>
    );
}
