"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trash2, Undo } from 'lucide-react';

const COLORS = ["#ef4444", "#f97316", "#84cc16", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#222222"];

export default function DrawingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(COLORS[7]);
    const [history, setHistory] = useState<ImageData[]>([]);
    
    const getContext = () => canvasRef.current?.getContext('2d');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = getContext();
        if(!ctx) return;
        
        // Set a white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Save initial state
        saveHistory();
    }, []);

    const saveHistory = () => {
        const ctx = getContext();
        if(!ctx || !canvasRef.current) return;
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setHistory(prev => [...prev, imageData]);
    };

    const undo = () => {
        if(history.length <= 1) return; // Don't undo the initial blank state

        const newHistory = [...history];
        newHistory.pop(); // Remove current state
        const lastImage = newHistory[newHistory.length - 1]; // Get previous state

        const ctx = getContext();
        if(ctx) {
            ctx.putImageData(lastImage, 0, 0);
        }
        setHistory(newHistory);
    };

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = getContext();
        if (!ctx) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = getContext();
        if (!ctx) return;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = getContext();
        if(!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
        saveHistory();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveHistory();
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Quadro de Desenho</CardTitle>
            </CardHeader>
            <CardContent>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={400}
                    className="border rounded-md cursor-crosshair w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                 <div>
                    <Label className="font-semibold">Cor</Label>
                    <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-8 gap-2 mt-2">
                        {COLORS.map(c => (
                            <div key={c} className="flex items-center">
                                <RadioGroupItem value={c} id={c} className="sr-only" />
                                <Label htmlFor={c} className="w-8 h-8 rounded-full border-2 border-transparent cursor-pointer" style={{ backgroundColor: c, 'boxShadow': color === c ? `0 0 0 3px ${c}` : 'none' }}></Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={undo} disabled={history.length <= 1}>
                        <Undo className="mr-2" /> Desfazer
                    </Button>
                    <Button variant="destructive" onClick={clearCanvas}>
                        <Trash2 className="mr-2" /> Limpar
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
