"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';
import { Bird } from 'lucide-react';

const GAME_WIDTH = 480;
const GAME_HEIGHT = 500;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const PIPE_INTERVAL = 1500; // ms

const HIGH_SCORE_KEY = 'flappyBirdHighScore';

interface Pipe {
    x: number;
    y: number;
    passed?: boolean;
}

export default function FlappyBirdGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(true);
    const [isClient, setIsClient] = useState(false);

    const gameLoopRef = useRef<number>();
    const birdY = useRef(GAME_HEIGHT / 2);
    const birdVelocity = useRef(0);
    const pipes = useRef<Pipe[]>([]);
    const lastPipeTime = useRef(0);
    const frameCount = useRef(0);
    
    useEffect(() => {
        setIsClient(true);
        const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
    }, []);

    useEffect(() => {
        if(isClient) {
            localStorage.setItem(HIGH_SCORE_KEY, highScore.toString());
        }
    }, [highScore, isClient]);

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = '#70c5ce'; // Sky color
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw bird
        ctx.save();
        ctx.fillStyle = '#fddb63';
        ctx.translate(GAME_WIDTH / 4, birdY.current);
        ctx.rotate(Math.min(Math.max(-Math.PI / 4, birdVelocity.current * 0.1), Math.PI / 4));
        ctx.fillRect(-BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(-BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT);
        ctx.restore();


        // Draw pipes
        ctx.fillStyle = '#73bf2e';
        ctx.strokeStyle = '#548c27';
        ctx.lineWidth = 4;
        pipes.current.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.y);
            // Bottom pipe
            const bottomPipeY = pipe.y + PIPE_GAP;
            ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, GAME_HEIGHT - bottomPipeY);
            ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, GAME_HEIGHT - bottomPipeY);
        });

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(`Score: ${score}`, GAME_WIDTH / 2, 50);
        ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 50);
    };

    const gameOver = () => {
        setIsGameOver(true);
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        if (score > highScore) {
            setHighScore(score);
        }
    };
    
    const gameLoop = (time: number) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Bird physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        // Pipe generation
        if (time - lastPipeTime.current > PIPE_INTERVAL) {
            lastPipeTime.current = time;
            const pipeY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
            pipes.current.push({ x: GAME_WIDTH, y: pipeY, passed: false });
        }

        // Move pipes
        pipes.current.forEach(pipe => {
            pipe.x -= PIPE_SPEED;
            if(pipe.x + PIPE_WIDTH < GAME_WIDTH / 4 && !pipe.passed) {
                 setScore(s => s + 1);
                 pipe.passed = true;
            }
        });
        pipes.current = pipes.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);
        
        // Collision detection
        const birdLeft = GAME_WIDTH / 4 - BIRD_WIDTH / 2;
        const birdRight = GAME_WIDTH / 4 + BIRD_WIDTH / 2;
        const birdTop = birdY.current - BIRD_HEIGHT / 2;
        const birdBottom = birdY.current + BIRD_HEIGHT / 2;

        if (birdBottom > GAME_HEIGHT || birdTop < 0) {
            gameOver();
            return;
        }

        for (const pipe of pipes.current) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + PIPE_WIDTH;
            const pipeTop = pipe.y;
            const pipeBottom = pipe.y + PIPE_GAP;

            if (
                birdRight > pipeLeft &&
                birdLeft < pipeRight &&
                (birdTop < pipeTop || birdBottom > pipeBottom)
            ) {
                gameOver();
                return;
            }
        }
        
        draw(ctx);
        frameCount.current++;
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        setIsGameOver(false);
        setScore(0);
        birdY.current = GAME_HEIGHT / 2;
        birdVelocity.current = 0;
        pipes.current = [];
        lastPipeTime.current = 0;
        frameCount.current = 0;
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    const jump = () => {
        if (!isGameOver) {
            birdVelocity.current = JUMP_STRENGTH;
        }
    };
    
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isGameOver]);

    // Initial render
     useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Flappy Bird', GAME_WIDTH / 2, 50);
            ctx.font = '20px Arial';
            ctx.fillText('Clique ou aperte Espaço para pular', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        }
     }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Flappy Bird</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                 <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    className="border rounded-md w-full bg-[#70c5ce]"
                    onClick={jump}
                />
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <div className="flex justify-around w-full">
                    <p className="font-semibold text-muted-foreground">Score: {score}</p>
                    <p className="font-semibold text-muted-foreground">High Score: {highScore}</p>
                </div>
                 <Button onClick={startGame} className="w-full" disabled={!isGameOver}>
                    {isGameOver && score > 0 ? <RotateCcw className="mr-2"/> : <Play className="mr-2"/>}
                    {isGameOver && score > 0 ? 'Jogar Novamente' : 'Iniciar Jogo'}
                </Button>
            </CardFooter>
        </Card>
    );
}
