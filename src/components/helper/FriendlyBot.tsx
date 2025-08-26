
"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const friendlyMessages = [
    { text: "Bom dia! ☀️", emoji: "😊" },
    { text: "Espero que seu dia seja ótimo!", emoji: "👍" },
    { text: "Você consegue!", emoji: "💪" },
    { text: "Vamos com tudo!", emoji: "🚀" },
    { text: "Hoje será um dia produtivo!", emoji: "💡" },
    { text: "Um passo de cada vez.", emoji: "🐾" },
    { text: "Continue o ótimo trabalho!", emoji: "🌟" },
    { text: "Estou aqui se precisar!", emoji: "🤖" },
];

const BlinkingRobot = ({ isBlinking }: { isBlinking: boolean }) => (
    <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
        {/* Crown */}
        <path d="M20 28 L 22 18 L 30 22 L 40 14 L 50 22 L 58 18 L 60 28 Z" fill="#FFD700" stroke="#FDB813" strokeWidth="2" strokeLinejoin="round"/>
        {/* Robot Body */}
        <path d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z" fill="url(#paint0_linear_1_2)"/>
        <circle cx="40" cy="40" r="32" fill="#E0E0E0"/>
        <rect x="18" y="32" width="44" height={isBlinking ? 0 : 16} rx="8" fill="#212121"/>
        {/* Eyes */}
        {!isBlinking && (
            <>
                <circle cx="30" cy="40" r="3" fill="white"/>
                <circle cx="50" cy="40" r="3" fill="white"/>
            </>
        )}
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#BDBDBD"/>
                <stop offset="1" stopColor="#616161"/>
            </linearGradient>
        </defs>
    </svg>
);


export default function FriendlyBot() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(friendlyMessages[0]);
    const [isDismissed, setIsDismissed] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Ensure component only renders on client to avoid hydration errors
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initial delay before showing the bot
    useEffect(() => {
        if (!isClient) return;

        const timer = setTimeout(() => {
            if (!isDismissed) {
                setIsVisible(true);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [isDismissed, isClient]);

    // Message cycling
    useEffect(() => {
        if (!isVisible || !isClient) return;

        const messageInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * friendlyMessages.length);
            setCurrentMessage(friendlyMessages[randomIndex]);
        }, 15000); // Change message every 15 seconds

        return () => clearInterval(messageInterval);
    }, [isVisible, isClient]);
    
    // Blinking animation
    useEffect(() => {
        if (!isVisible || !isClient) return;
        
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }, 4000); // Blink every 4 seconds

        return () => clearInterval(blinkInterval);
    }, [isVisible, isClient]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (!isClient || isDismissed) return null;

    return (
        <div className={cn(
            "fixed bottom-5 right-5 z-50 flex items-end gap-3 transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            <div className="relative bg-background border rounded-lg p-3 max-w-xs shadow-lg animate-in fade-in-0 slide-in-from-bottom-5">
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={handleDismiss}>
                    <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentMessage.emoji}</span>
                    <p className="text-sm text-foreground">{currentMessage.text}</p>
                </div>
            </div>
            
            <div className="animate-bounce" style={{ animationIterationCount: 3, animationDuration: '1.5s' }}>
                <BlinkingRobot isBlinking={isBlinking} />
            </div>
        </div>
    );
}
