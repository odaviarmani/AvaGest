"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Circle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Player = 'X' | 'O';
type SquareValue = Player | null;

const Square = ({ value, onClick }: { value: SquareValue, onClick: () => void }) => {
    return (
        <button className="w-20 h-20 md:w-24 md:h-24 bg-secondary flex items-center justify-center rounded-lg shadow-inner" onClick={onClick}>
            {value === 'X' && <X className="w-12 h-12 text-blue-500" />}
            {value === 'O' && <Circle className="w-12 h-12 text-red-500" />}
        </button>
    )
}

const calculateWinner = (squares: SquareValue[]): SquareValue => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
};

export default function TicTacToe() {
    const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const winner = calculateWinner(squares);
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
        setSquares(newSquares);
        setXIsNext(!xIsNext);
    };
    
    const handleReset = () => {
        setSquares(Array(9).fill(null));
        setXIsNext(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Jogo da Velha</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className={cn("text-lg font-semibold p-2 rounded-md", 
                    winner ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                    {status}
                </div>
                <div className="grid grid-cols-3 gap-2 p-2 bg-background rounded-xl shadow-md">
                    {squares.map((square, i) => (
                        <Square key={i} value={square} onClick={() => handleClick(i)} />
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
