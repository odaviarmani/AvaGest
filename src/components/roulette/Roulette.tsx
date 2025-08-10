"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface RouletteProps {
  options: string[];
}

const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0", "#E91E63", "#00BCD4"];

export default function Roulette({ options }: RouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawRoulette = (rotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !options.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arc = Math.PI / (options.length / 2);
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);

    options.forEach((option, i) => {
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, i * arc, (i + 1) * arc);
      ctx.lineTo(0, 0);
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.rotate(i * arc + arc / 2);
      ctx.fillText(option, radius / 2 + 10, 0);
      ctx.restore();
    });

    ctx.restore();

    // Draw pointer
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, 10);
    ctx.lineTo(canvas.width / 2 + 10, 10);
    ctx.lineTo(canvas.width / 2, 30);
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    drawRoulette();
  }, [options]);

  const spin = () => {
    if (isSpinning || options.length < 2) return;
    setIsSpinning(true);
    setResult(null);

    let start = 0;
    const spinAngle = Math.random() * 2 * Math.PI + Math.PI * 4; // Spin at least 2 times
    const duration = 5000; // 5 seconds
    
    const animate = (time: number) => {
        if (!start) start = time;
        const elapsed = time - start;
        const t = Math.min(elapsed / duration, 1);
        const easeOut = t * (2 - t); // Ease-out quadratic
        const currentAngle = spinAngle * easeOut;
        drawRoulette(currentAngle);
        
        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            const finalAngle = spinAngle % (2 * Math.PI);
            const winningSegment = Math.floor((2 * Math.PI - finalAngle) / (2 * Math.PI / options.length));
            setResult(options[winningSegment]);
            setIsSpinning(false);
        }
    };
    
    requestAnimationFrame(animate);
  };


  return (
    <div className="flex flex-col items-center justify-center gap-4">
        <canvas ref={canvasRef} width="250" height="250"></canvas>
        <Button onClick={spin} disabled={isSpinning || options.length < 2}>
            <Play className="mr-2 h-4 w-4" />
            {isSpinning ? 'Girando...' : 'Girar Roleta'}
        </Button>
        {result && !isSpinning && (
            <div className="mt-4 p-4 bg-primary text-primary-foreground rounded-lg">
                <p className="text-lg font-bold">O escolhido é: {result}</p>
            </div>
        )}
    </div>
  );
}
