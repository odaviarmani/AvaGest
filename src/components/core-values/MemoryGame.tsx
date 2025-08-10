"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { icons as allIcons } from 'lucide-react';

const GAME_STATE_KEY = 'memoryGameState';
const CARD_COUNT = 16; // Must be an even number

const getInitialIcons = () => {
    const iconKeys = Object.keys(allIcons);
    const shuffledKeys = iconKeys.sort(() => 0.5 - Math.random());
    return shuffledKeys.slice(0, CARD_COUNT / 2);
}

const createShuffledDeck = (iconNames: string[]) => {
    const cards = [...iconNames, ...iconNames]
      .map((name, index) => ({ id: index, name, isFlipped: false, isMatched: false }))
      .sort(() => 0.5 - Math.random());
    return cards;
}

export default function MemoryGame() {
    const [iconNames, setIconNames] = useState<string[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const savedState = localStorage.getItem(GAME_STATE_KEY);
        if (savedState) {
            const { savedIconNames, savedCards, savedMoves } = JSON.parse(savedState);
            setIconNames(savedIconNames);
            setCards(savedCards);
            setMoves(savedMoves);
            setIsFinished(savedCards.every((c: any) => c.isMatched));
        } else {
            resetGame();
        }
    }, []);

    useEffect(() => {
        if(cards.length > 0) {
            const stateToSave = {
                savedIconNames: iconNames,
                savedCards: cards,
                savedMoves: moves
            };
            localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
            if (cards.every(c => c.isMatched)) {
                setIsFinished(true);
            }
        }
    }, [cards, moves, iconNames]);

    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [firstIndex, secondIndex] = flippedIndices;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.name === secondCard.name) {
                // Match
                setCards(prev => prev.map(card => 
                    card.name === firstCard.name ? { ...card, isMatched: true } : card
                ));
            }
            
            // Flip back after a delay
            setTimeout(() => setFlippedIndices([]), 1000);
        }
    }, [flippedIndices, cards]);

    const resetGame = () => {
        const newIcons = getInitialIcons();
        setIconNames(newIcons);
        setCards(createShuffledDeck(newIcons));
        setFlippedIndices([]);
        setMoves(0);
        setIsFinished(false);
        localStorage.removeItem(GAME_STATE_KEY);
    }

    const handleCardClick = (index: number) => {
        if (flippedIndices.length >= 2 || cards[index].isFlipped) return;

        setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
        setFlippedIndices(prev => [...prev, index]);

        if (flippedIndices.length === 1) {
            setMoves(m => m + 1);
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Jogo da Memória</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {cards.map((card, index) => {
                        const LucideIcon = allIcons[card.name as keyof typeof allIcons];
                        const isCardFlipped = card.isFlipped || flippedIndices.includes(index);
                        return (
                            <div key={card.id} className="w-16 h-16 md:w-20 md:h-20 perspective-1000" onClick={() => handleCardClick(index)}>
                                <div className={cn(
                                    "relative w-full h-full transform-style-3d transition-transform duration-500",
                                    isCardFlipped ? "rotate-y-180" : ""
                                )}>
                                    {/* Card Back */}
                                    <div className="absolute w-full h-full backface-hidden bg-secondary rounded-lg flex items-center justify-center cursor-pointer shadow-md">
                                        
                                    </div>
                                    {/* Card Front */}
                                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-primary/20 rounded-lg flex items-center justify-center shadow-lg">
                                        {LucideIcon && <LucideIcon className={cn("w-8 h-8 md:w-10 md:h-10", card.isMatched ? "text-primary" : "text-primary-foreground/50")} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isFinished && (
                    <div className="text-center p-4 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg animate-in fade-in-50">
                        <Award className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold">Parabéns, você completou em {moves} jogadas!</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <p className="font-semibold text-muted-foreground">Jogadas: {moves}</p>
                 <Button onClick={resetGame} className="w-full">
                    <RotateCcw className="mr-2" />
                    Reiniciar Jogo
                </Button>
            </CardFooter>
        </Card>
    );
}
