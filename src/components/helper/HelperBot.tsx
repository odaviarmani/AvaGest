
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
        {/* Head */}
        <path d="M 20 90 C 5 90, 5 70, 5 50 C 5 15, 15 5, 50 5 C 85 5, 95 15, 95 50 C 95 70, 95 90, 80 90 Z" fill="#D1D5DB" stroke="#4B5563" strokeWidth="2" />
        {/* Crown */}
        <path d="M 30 15 L 35 5 L 50 12 L 65 5 L 70 15 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
        
        {/* Eyes */}
        <circle cx="35" cy="45" r="8" fill="white" stroke="black" strokeWidth="1"/>
        <circle cx="65" cy="45" r="8" fill="white" stroke="black" strokeWidth="1"/>
        
        {/* Pupils */}
        <circle cx="35" cy="45" r="3" fill="black"/>
        <circle cx="65" cy="45" r="3" fill="black"/>

        {/* Blinking lids */}
        {isBlinking && (
            <>
                <path d="M 27 45 A 8 8 0 0 1 43 45" fill="#D1D5DB" />
                <path d="M 57 45 A 8 8 0 0 1 73 45" fill="#D1D5DB" />
            </>
        )}

        {/* Mouth */}
        {isTalking ? (
            <ellipse cx="50" cy="70" rx="10" ry="5" fill="#374151" className="transition-all" />
        ) : (
            <path d="M 40 70 Q 50 75, 60 70" stroke="black" strokeWidth="2" fill="none" />
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

    // Drag and Drop state
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

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
        if(isDragging) return;
        setIsOpen(!isOpen);
        setShowProactiveBubble(false);
        if (!isOpen && conversation.length === 0) {
            setConversation([{ type: 'bot', text: "Saudações, nobre equipe! Como posso assisti-los nesta jornada?" }]);
        }
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const buttonRect = e.currentTarget.getBoundingClientRect();
        
        dragStartRef.current = {
            x: clientX,
            y: clientY,
            offsetX: clientX - buttonRect.left,
            offsetY: clientY - buttonRect.top,
        };

        const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
            setIsDragging(true); // Set dragging only on move
            const moveClientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const moveClientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
            
            let newX = moveClientX - dragStartRef.current.offsetX;
            let newY = moveClientY - dragStartRef.current.offsetY;

            // Constrain to viewport
            newX = Math.max(0, Math.min(newX, window.innerWidth - buttonRect.width));
            newY = Math.max(0, Math.min(newY, window.innerHeight - buttonRect.height));

            setPosition({ x: newX, y: newY });
        };
        
        const handleMouseUp = () => {
            setTimeout(() => setIsDragging(false), 0); // Allow click event if no drag occurred
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
    };


    return (
        <div 
            className="fixed z-50 flex flex-col items-end gap-2"
            style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
        >
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
                className="rounded-full w-20 h-20 shadow-2xl relative transition-transform duration-300 hover:scale-110 cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={toggleOpen}
                aria-label="Abrir Conselheiro Real"
            >
               <AnimatedBotIcon isTalking={isLoading} isBlinking={isBlinking}/>
            </button>
        </div>
    );
}
