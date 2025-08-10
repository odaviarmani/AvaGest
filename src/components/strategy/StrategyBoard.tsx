"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Undo, Trash2, Redo, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
const MAT_WIDTH_CM = 240;
const MAT_HEIGHT_CM = 120;

type Line = [number, number, number, number, string, number]; // [x1, y1, x2, y2, color, lineWidth]
type Drawing = {
    line: Line;
    lengthCm: number;
    angleDeg: number;
};
type DrawingHistory = Drawing[];

const initialHistory = () => {
    const history: Record<string, DrawingHistory[]> = {};
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
  const [_, forceRender] = useState({}); // Helper to force re-renders for previews

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  
  const historyRef = useRef<Record<string, DrawingHistory[]>>({});
  const currentStepRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setIsClient(true);
    const savedImage = localStorage.getItem('strategyMapImage');
    if (savedImage) {
        setMapImage(savedImage);
    }
    
    const savedHistory = localStorage.getItem('strategyHistory');
    const savedSteps = localStorage.getItem('strategySteps');
    if (savedHistory && savedSteps) {
        historyRef.current = JSON.parse(savedHistory);
        currentStepRef.current = JSON.parse(savedSteps);
    } else {
        const { history, steps } = initialHistory();
        historyRef.current = history;
        currentStepRef.current = steps;
    }
    forceRender({}); // render previews on initial load
  }, []);

  const saveData = useCallback(() => {
      if(!isClient) return;
      try {
        localStorage.setItem('strategyHistory', JSON.stringify(historyRef.current));
        localStorage.setItem('strategySteps', JSON.stringify(currentStepRef.current));
      } catch (error) {
        console.error("Failed to save drawing history to localStorage:", error);
      }
      forceRender({}); // Re-render previews on data change
  }, [isClient]);

   const drawMetricsOnCanvas = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number, y: number,
    textOffset = 10
  ) => {
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y - textOffset);
    ctx.fillText(text, x, y - textOffset);
  };


  const drawLineWithMetrics = (
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number, x2: number, y2: number,
    lineColor: string, lineThickness: number,
    lengthText: string
  ) => {
    // Draw the main line
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    drawMetricsOnCanvas(ctx, lengthText, midX, midY);
  };

  const drawAllLinesForCanvas = useCallback((canvas: HTMLCanvasElement | null, saidaKey: string, isPreview: boolean) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale for previews
    const scale = isPreview ? (canvas.width / (canvasRef.current?.width || canvas.width)) : 1;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentHistory = historyRef.current[saidaKey] || [];
    const currentStep = currentStepRef.current[saidaKey] || 0;
    const drawings = currentHistory.slice(0, currentStep).flat();
    
    drawings.forEach((drawing, index) => {
      const [x1, y1, x2, y2, c, lw] = drawing.line;
      const scaledX1 = x1 * scale;
      const scaledY1 = y1 * scale;
      const scaledX2 = x2 * scale;
      const scaledY2 = y2 * scale;
      const scaledLw = lw * scale;

      // Don't draw metrics on previews to avoid clutter
      if (isPreview) {
        ctx.beginPath();
        ctx.strokeStyle = c;
        ctx.lineWidth = Math.max(1, scaledLw); // Ensure line is at least 1px
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(scaledX1, scaledY1);
        ctx.lineTo(scaledX2, scaledY2);
        ctx.stroke();
      } else {
        const lengthText = `${drawing.lengthCm.toFixed(1)}cm`;
        drawLineWithMetrics(ctx, scaledX1, scaledY1, scaledX2, scaledY2, c, scaledLw, lengthText);
        
        // Draw transition angle
        if (index > 0) {
          const prevDrawing = drawings[index - 1];
          const angleDiff = drawing.angleDeg - prevDrawing.angleDeg;
          const displayAngle = Math.round((angleDiff + 180) % 360 - 180);
          const angleText = `${displayAngle}°`;
          drawMetricsOnCanvas(ctx, angleText, scaledX1, scaledY1, -5);
        }
      }
    });

    if (!isPreview && isDrawing && startPoint && endPoint) {
        const pixelLength = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        const cmLength = (pixelLength / (canvasRef.current?.width || 1)) * MAT_WIDTH_CM;
        const lengthText = `${cmLength.toFixed(1)}cm`;
        drawLineWithMetrics(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, color, lineWidth, lengthText);
    }
  }, [isDrawing, startPoint, endPoint, color, lineWidth]);


  const drawMainCanvas = useCallback(() => {
      drawAllLinesForCanvas(canvasRef.current, activeTab, false);
  }, [activeTab, drawAllLinesForCanvas]);

  const drawPreviewCanvases = useCallback(() => {
    for (let i = 1; i <= NUM_SAIDAS; i++) {
        const saidaKey = `saida-${i}`;
        const previewCanvas = previewCanvasRefs.current[saidaKey];
        if (previewCanvas) {
            const previewCtx = previewCanvas.getContext('2d');
            if (previewCtx && mapImage) {
                const img = new window.Image();
                img.src = mapImage;
                img.onload = () => {
                    previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                    drawAllLinesForCanvas(previewCanvas, saidaKey, true);
                };
                 if (img.complete) {
                    previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
                    drawAllLinesForCanvas(previewCanvas, saidaKey, true);
                }
            }
        }
    }
  }, [mapImage, drawAllLinesForCanvas]);


  useEffect(() => {
    drawMainCanvas();
  }, [activeTab, drawMainCanvas]);

  useEffect(() => {
    drawPreviewCanvases();
  }, [activeTab, mapImage, _, drawPreviewCanvases]); // Re-draw previews when map or data changes

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image) {
      const resizeCanvas = () => {
        const { width, height } = image.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        drawMainCanvas();
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
  }, [drawMainCanvas, mapImage]);

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
    if(!isDrawing || !startPoint || !endPoint || (startPoint.x === endPoint.x && startPoint.y === endPoint.y)) {
        setIsDrawing(false);
        setStartPoint(null);
        setEndPoint(null);
        return
    };
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelLength = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
    const cmLength = (pixelLength / canvas.width) * MAT_WIDTH_CM;
    
    const angleRad = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const angleDeg = angleRad * (180 / Math.PI);

    const currentDrawing: DrawingHistory = [{
        line: [startPoint.x, startPoint.y, endPoint.x, endPoint.y, color, lineWidth],
        lengthCm: cmLength,
        angleDeg: angleDeg,
    }];
    
    const step = currentStepRef.current[activeTab] || 0;
    const newHistory = [...(historyRef.current[activeTab] || []).slice(0, step), currentDrawing];
    
    historyRef.current[activeTab] = newHistory;
    currentStepRef.current[activeTab] = newHistory.length;

    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
    drawMainCanvas();
    saveData();
  };

  const handleDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const coords = getCoordinates(event);
    if (!coords) return;
    
    setEndPoint(coords);
    drawMainCanvas();
  };

  const undo = () => {
    if ((currentStepRef.current[activeTab] || 0) > 0) {
        currentStepRef.current[activeTab]--;
        drawMainCanvas();
        saveData();
    }
  };

  const redo = () => {
    const history = historyRef.current[activeTab] || [];
    if ((currentStepRef.current[activeTab] || 0) < history.length) {
      currentStepRef.current[activeTab]++;
      drawMainCanvas();
      saveData();
    }
  };

  const clearCanvas = () => {
    historyRef.current[activeTab] = [];
    currentStepRef.current[activeTab] = 0;
    drawMainCanvas();
    saveData();
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

  const handleDownload = () => {
    const mainCanvas = canvasRef.current;
    const bgImage = imageRef.current;
    if (!mainCanvas || !bgImage) return;

    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = mainCanvas.width;
    downloadCanvas.height = mainCanvas.height;
    const ctx = downloadCanvas.getContext('2d');
    
    if(!ctx) return;

    // Draw the background image first
    ctx.drawImage(bgImage, 0, 0, mainCanvas.width, mainCanvas.height);
    
    // Draw the drawings canvas on top
    ctx.drawImage(mainCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `estrategia_${activeTab}_${new Date().toISOString()}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
        <div className="w-full flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-full aspect-[2/1] rounded-lg border overflow-hidden shadow-lg bg-muted flex items-center justify-center">
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
                            crossOrigin="anonymous" // Required for canvas toDataURL
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

                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={undo} disabled={!mapImage || (currentStepRef.current[activeTab] || 0) === 0}>
                                    <Undo className="mr-2 h-4 w-4"/> Desfazer
                                </Button>
                                <Button variant="outline" onClick={redo} disabled={!mapImage || ((currentStepRef.current[activeTab] || 0) >= (historyRef.current[activeTab] || []).length)}>
                                    <Redo className="mr-2 h-4 w-4"/> Refazer
                                </Button>
                            </div>
                            
                            <Button variant="destructive" onClick={clearCanvas} className="w-full" disabled={!mapImage}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Limpar Desenho
                            </Button>

                            <Button onClick={handleDownload} className="w-full" disabled={!mapImage}>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar Desenho
                            </Button>

                            {mapImage && (
                                <Button variant="secondary" onClick={() => {
                                    setMapImage(null);
                                    localStorage.removeItem('strategyMapImage');
                                    const { history, steps } = initialHistory();
                                    historyRef.current = history;
                                    currentStepRef.current = steps;
                                    saveData();
                                    drawMainCanvas();
                                }} className="w-full mt-2">
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

        {isClient && mapImage && (
            <div className="mt-12 w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">Visão Geral das Saídas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: NUM_SAIDAS }, (_, i) => {
                        const saidaKey = `saida-${i + 1}`;
                        return (
                            <Card key={saidaKey} className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle>Saída {i + 1}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-[2/1] bg-muted rounded-md overflow-hidden relative">
                                        <canvas
                                            ref={el => (previewCanvasRefs.current[saidaKey] = el)}
                                            width={480} // Larger base size for better resolution
                                            height={240}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        )}
    </>
  );
}
