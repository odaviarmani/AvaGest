"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Circle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Player = 'X' | 'O';
type SquareValue = Player | null;

const GAME_STATE_KEY = 'ticTacToeState';

const Square = ({ value, onClick, isWinner }: { value: SquareValue, onClick: () => void, isWinner: boolean }) => {
    return (
        <button 
            className={cn(
                "w-20 h-20 md:w-24 md:h-24 bg-secondary flex items-center justify-center rounded-lg shadow-inner transition-colors duration-300",
                isWinner && "bg-primary/30"
            )} 
            onClick={onClick}
        >
            {value === 'X' && <X className="w-12 h-12 text-blue-500" />}
            {value === 'O' && <Circle className="w-12 h-12 text-red-500" />}
        </button>
    )
}

const calculateWinner = (squares: SquareValue[]): { winner: Player | null, line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return { winner: null, line: null };
};

const getInitialState = () => ({
    squares: Array(9).fill(null),
    xIsNext: true,
});

export default function TicTacToe() {
    const [gameState, setGameState] = useState(getInitialState());

    useEffect(() => {
        const savedState = localStorage.getItem(GAME_STATE_KEY);
        if (savedState) {
            setGameState(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
    }, [gameState]);

    const { squares, xIsNext } = gameState;
    const { winner, line: winningLine } = calculateWinner(squares);
    const isBoardFull = squares.every(Boolean);

    let status;
    if (winner) {
        status = `Vencedor: Jogador ${winner}`;
    } else if(isBoardFull) {
        status = "Empate!";
    } else {
        status = `Próximo a jogar: Jogador ${xIsNext ? 'X' : 'O'}`;
    }

    const handleClick = (i: number) => {
        if (winner || squares[i]) {
            return;
        }
        const newSquares = squares.slice();
        newSquares[i] = xIsNext ? 'X' : 'O';
        setGameState({
            squares: newSquares,
            xIsNext: !xIsNext
        });
    };
    
    const handleReset = () => {
        setGameState(getInitialState());
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jogo da Velha</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className={cn("text-lg font-semibold p-2 rounded-md transition-colors", 
                    winner ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {status}
                </div>
                <div className="grid grid-cols-3 gap-2 p-2 bg-background rounded-xl shadow-md">
                    {squares.map((square, i) => (
                        <Square 
                            key={i} 
                            value={square} 
                            onClick={() => handleClick(i)}
                            isWinner={!!(winningLine && winningLine.includes(i))}
                        />
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleReset} className="w-full">
                    <RotateCcw className="mr-2" />
                    Reiniciar Jogo
                </Button>
            </CardFooter>
        </Card>
    )
}
