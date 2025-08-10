"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface RouletteProps {
  options: string[];
  onSpinResult: (result: string) => void;
}

const colors = ["#FFC107", "#FF5722", "#4CAF50", "#2196F3", "#9C27B0", "#E91E63", "#00BCD4"];

export default function Roulette({ options, onSpinResult }: RouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  const drawRoulette = (rotation = 0) => {
    const canvas = canvasRef.current;
    if (!canvas || !options.length) {
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = "gray";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Adicione opções", 0, 0);
            ctx.restore();
        }
        return
    };
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arc = Math.PI * 2 / options.length;
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
      const textAngle = i * arc + arc / 2;
      ctx.rotate(textAngle);
      // Adjust text position to be more centered in the slice
      const textRadius = radius * 0.6;
      ctx.fillText(option, textRadius, 0);
      ctx.restore();
    });

    ctx.restore();

    // Draw pointer
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, 5);
    ctx.lineTo(canvas.width / 2 + 10, 5);
    ctx.lineTo(canvas.width / 2, 25);
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
    const spinAngle = Math.random() * 4 * Math.PI + Math.PI * 8; // Spin at least 4 times
    const duration = 5000; // 5 seconds
    const startRotation = rotationRef.current;
    
    const animate = (time: number) => {
        if (!start) start = time;
        const elapsed = time - start;
        
        // Ease-out cubic function
        const t = Math.min(elapsed / duration, 1);
        const progress = 1 - Math.pow(1 - t, 3);

        const currentAngle = startRotation + spinAngle * progress;
        rotationRef.current = currentAngle;
        drawRoulette(currentAngle);
        
        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            const finalAngle = currentAngle % (2 * Math.PI);
            const arc = (2 * Math.PI) / options.length;
            // The pointer is at the top (pointing down). In a circle where 0 is at 3 o'clock, the top is at 1.5 * PI (270 degrees).
            // We adjust the final angle to determine the winning segment.
            const pointerAngle = 1.5 * Math.PI; // The pointer is at the top (270 degrees)
            const winningAngle = (2 * Math.PI - finalAngle + pointerAngle) % (2 * Math.PI);
            const winningSegmentIndex = Math.floor(winningAngle / arc);
            
            const winningResult = options[winningSegmentIndex];
            setResult(winningResult);
            if (onSpinResult) {
                onSpinResult(winningResult);
            }
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
            <div className="mt-4 p-4 bg-primary text-primary-foreground rounded-lg animate-in fade-in-50">
                <p className="text-lg font-bold">O escolhido é: {result}</p>
            </div>
        )}
    </div>
  );
}
