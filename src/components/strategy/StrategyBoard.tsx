"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Undo, Trash2, Redo, Upload } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';

const COLORS = [
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#14b8a6", label: "Ciano" },
];
const NUM_SAIDAS = 6;

type Line = [number, number, number, number, string, number]; // [x1, y1, x2, y2, color, lineWidth]
type Drawing = Line[];

const initialHistory = () => {
    const history: Record<string, Drawing[]> = {};
    const steps: Record<string, number> = {};
    for (let i = 1; i <= NUM_SAIDAS; i++) {
        history[`saida-${i}`] = [];
        steps[`saida-${i}`] = 0;
    }
    return {history, steps};
}

export default function StrategyBoard() {
  const [activeTab, setActiveTab] = useState(`saida-1`);
  const [color, setColor] = useState(COLORS[0].value);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number, y: number } | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { history: initialHistoryState, steps: initialStepsState } = useMemo(initialHistory, []);
  const historyRef = useRef<Record<string, Drawing[]>>(initialHistoryState);
  const currentStepRef = useRef<Record<string, number>>(initialStepsState);

  useEffect(() => {
    setIsClient(true);
    const savedImage = localStorage.getItem('strategyMapImage');
    if (savedImage) {
        setMapImage(savedImage);
    }
  }, []);

  const drawAllLines = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!mapImage) return;

    const currentHistory = historyRef.current[activeTab] || [];
    const currentStep = currentStepRef.current[activeTab] || 0;
    const drawings = currentHistory.slice(0, currentStep).flat();
    
    drawings.forEach(([x1, y1, x2, y2, c, lw]) => {
      ctx.beginPath();
      ctx.strokeStyle = c;
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    if (isDrawing && startPoint && endPoint) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
  }, [activeTab, startPoint, endPoint, color, lineWidth, isDrawing, mapImage]);


  useEffect(() => {
    drawAllLines();
  }, [activeTab, drawAllLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image) {
      const resizeCanvas = () => {
        const { width, height } = image.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        drawAllLines();
      };
      
      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(image);
      window.addEventListener('resize', resizeCanvas);
      
      image.onload = () => {
          resizeCanvas();
      }

      if (image.complete) {
          resizeCanvas();
      }

      return () => {
        observer.disconnect();
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [drawAllLines, mapImage]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
        if(event.touches.length === 0) return null;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!mapImage) return;
    const coords = getCoordinates(event);
    if (!coords) return;
    
    setIsDrawing(true);
    setStartPoint(coords);
    setEndPoint(coords);

    const step = currentStepRef.current[activeTab] || 0;
    const newHistory = (historyRef.current[activeTab] || []).slice(0, step);
    historyRef.current[activeTab] = newHistory;
  };

  const stopDrawing = () => {
    if(!isDrawing || !startPoint || !endPoint) return;
    
    const currentDrawing: Drawing = [[startPoint.x, startPoint.y, endPoint.x, endPoint.y, color, lineWidth]];
    
    const step = currentStepRef.current[activeTab] || 0;
    const newHistory = [...(historyRef.current[activeTab] || []).slice(0, step), currentDrawing];
    
    historyRef.current[activeTab] = newHistory;
    currentStepRef.current[activeTab] = newHistory.length;

    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
    drawAllLines();
  };

  const handleDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords) return;
    
    setEndPoint(coords);
    drawAllLines();
  };

  const undo = () => {
    if (currentStepRef.current[activeTab] > 0) {
        currentStepRef.current[activeTab]--;
        drawAllLines();
    }
  };

  const redo = () => {
    const history = historyRef.current[activeTab] || [];
    if (currentStepRef.current[activeTab] < history.length) {
      currentStepRef.current[activeTab]++;
      drawAllLines();
    }
  };

  const clearCanvas = () => {
    historyRef.current[activeTab] = [];
    currentStepRef.current[activeTab] = 0;
    drawAllLines();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setMapImage(result);
            try {
                localStorage.setItem('strategyMapImage', result);
            } catch (error) {
                console.error("Failed to save image to localStorage:", error);
                alert("Não foi possível salvar a imagem. Ela pode ser muito grande.");
            }
        };
        reader.readAsDataURL(file);
    }
  };


  return (
    <div className="w-full flex flex-col md:flex-row gap-8 items-start">
        <div className="relative w-full aspect-[1.84/1] rounded-lg border overflow-hidden shadow-lg bg-muted flex items-center justify-center">
            {isClient && mapImage ? (
                <>
                    <Image
                        ref={imageRef}
                        src={mapImage}
                        alt="Mapa da FLL"
                        fill
                        className='object-contain'
                        priority
                        unoptimized
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onMouseMove={handleDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={handleDrawing}
                    />
                </>
            ) : (
                <div className="flex flex-col gap-4 items-center">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Fazer Upload do Mapa
                    </Button>
                    <p className="text-sm text-muted-foreground">Carregue a imagem do tapete da temporada.</p>
                </div>
            )}
        </div>

        <Card className="w-full md:w-[320px] shrink-0">
            <CardContent className="p-4">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        {Array.from({ length: NUM_SAIDAS }, (_, i) => (
                        <TabsTrigger key={i + 1} value={`saida-${i + 1}`}>
                            Saída {i + 1}
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    <div className="p-4 space-y-6">
                        <div>
                            <Label className="text-base font-semibold">Cor do Pincel</Label>
                            <RadioGroup value={color} onValueChange={setColor} className="grid grid-cols-4 gap-2 mt-2">
                                {COLORS.map(c => (
                                    <div key={c.value} className="flex items-center">
                                        <RadioGroupItem value={c.value} id={c.value} className="sr-only" />
                                        <Label htmlFor={c.value} className="w-10 h-10 rounded-full border-2 border-transparent cursor-pointer" style={{ backgroundColor: c.value, 'boxShadow': color === c.value ? `0 0 0 3px ${c.value}` : 'none' }}></Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        
                        <div>
                            <Label htmlFor="lineWidth" className="text-base font-semibold">
                                Espessura do Traço: {lineWidth}px
                            </Label>
                            <Slider
                                id="lineWidth"
                                value={[lineWidth]}
                                onValueChange={(val) => setLineWidth(val[0])}
                                min={1}
                                max={20}
                                step={1}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex justify-between gap-2">
                            <Button variant="outline" onClick={undo} disabled={!mapImage || (currentStepRef.current[activeTab] || 0) === 0}>
                                <Undo className="mr-2 h-4 w-4"/> Desfazer
                            </Button>
                            <Button variant="outline" onClick={redo} disabled={!mapImage || (currentStepRef.current[activeTab] >= (historyRef.current[activeTab] || []).length)}>
                                <Redo className="mr-2 h-4 w-4"/> Refazer
                            </Button>
                        </div>
                        
                        <Button variant="destructive" onClick={clearCanvas} className="w-full" disabled={!mapImage}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Limpar Desenho
                        </Button>

                         {mapImage && (
                            <Button variant="secondary" onClick={() => {
                                setMapImage(null);
                                localStorage.removeItem('strategyMapImage');
                            }} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Trocar Imagem
                            </Button>
                        )}
                    </div>

                    {Array.from({ length: NUM_SAIDAS }, (_, i) => (
                        <TabsContent key={i + 1} value={`saida-${i + 1}`} />
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}
