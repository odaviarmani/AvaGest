"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Undo, Trash2, Redo, Upload, Download, MousePointer, Circle, File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from 'next/image';
import StrategySteps from './StrategySteps';
import type { Instruction } from './StrategySteps';

const COLORS = [
    { value: "#ef4444", label: "Vermelho" },
    { value: "#f97316", label: "Laranja" },
    { value: "#eab308", label: "Amarelo" },
    { value: "#84cc16", label: "Verde" },
    { value: "#3b82f6", label: "Azul" },
    { value: "#a855f7", label: "Roxo" },
    { value: "#ec4899", label: "Rosa" },
    { value: "#14b8a6", label: "Ciano" },
];
const NUM_SAIDAS = 6;
const MAT_WIDTH_CM = 240;

type DrawingTool = 'line' | 'circle';

type Line = {
    type: 'line';
    points: [number, number, number, number]; // [x1, y1, x2, y2]
    color: string;
    lineWidth: number;
    lengthCm: number;
    angleDeg: number;
};

type CircleShape = {
    type: 'circle';
    cx: number;
    cy: number;
    radius: number;
    color: string;
    lineWidth: number;
};

type Drawing = Line | CircleShape;

type DrawingHistory = Drawing[];

const initialHistory = () => {
    const history: Record<string, DrawingHistory[]> = {};
    const steps: Record<string, number> = {};
    for (let i = 1; i <= NUM_SAIDAS; i++) {
        history[`saida-${i}`] = [[]];
        steps[`saida-${i}`] = 0;
    }
    return {history, steps};
}

const SaidaResources = ({ saidaKey }: { saidaKey: string }) => {
    const [fileInfo, setFileInfo] = useState<{ name: string; url: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedFiles = JSON.parse(localStorage.getItem('strategyResources') || '{}');
        if (savedFiles[saidaKey]) {
            setFileInfo(savedFiles[saidaKey]);
        }
    }, [saidaKey]);

    const saveFileToLocalStorage = (info: { name: string; url: string } | null) => {
        const savedFiles = JSON.parse(localStorage.getItem('strategyResources') || '{}');
        savedFiles[saidaKey] = info;
        localStorage.setItem('strategyResources', JSON.stringify(savedFiles));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                const newFileInfo = { name: file.name, url };
                setFileInfo(newFileInfo);
                saveFileToLocalStorage(newFileInfo);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setFileInfo(null);
        saveFileToLocalStorage(null);
        // Also clear the file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const isImage = fileInfo?.url.startsWith('data:image');

    return (
        <Card className="overflow-hidden flex flex-col">
            <CardHeader>
                <CardTitle>Recursos Saída {saidaKey.split('-')[1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                
                <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-md aspect-video">
                     {fileInfo ? (
                        isImage ? (
                            <Image 
                                src={fileInfo.url} 
                                alt={fileInfo.name} 
                                width={300} 
                                height={169} 
                                className="object-contain w-full h-full"
                                unoptimized
                            />
                        ) : (
                           <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <File className="w-16 h-16"/>
                                <span className="text-sm font-medium">Arquivo Genérico</span>
                           </div>
                        )
                    ) : (
                        <div className="text-center text-muted-foreground">
                             <p>Nenhum anexo</p>
                        </div>
                    )}
                </div>

                {fileInfo ? (
                    <div className="space-y-2">
                        <p className="text-sm font-medium truncate pr-2 text-center" title={fileInfo.name}>{fileInfo.name}</p>
                        <div className="flex gap-2 justify-center">
                             <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>Trocar</Button>
                             <Button size="sm" variant="destructive" onClick={handleRemoveFile}>Remover</Button>
                        </div>
                    </div>
                ) : (
                    <Button className="w-full" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Anexar Arquivo
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};


export default function StrategyBoard() {
  const [activeTab, setActiveTab] = useState(`saida-1`);
  const [color, setColor] = useState(COLORS[0].value);
  const [lineWidth, setLineWidth] = useState(3);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('line');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number, y: number } | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [_, setForceRender] = useState(0); // Helper to force re-render on history change

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    drawMainCanvas();
  }, []);
  
  const forceUpdate = () => setForceRender(v => v + 1);

  const saveData = useCallback(() => {
      if(!isClient) return;
      try {
        localStorage.setItem('strategyHistory', JSON.stringify(historyRef.current));
        localStorage.setItem('strategySteps', JSON.stringify(currentStepRef.current));
      } catch (error) {
        console.error("Failed to save drawing history to localStorage:", error);
      }
      forceUpdate();
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
    ctx.strokeText(text, x + textOffset, y - textOffset);
    ctx.fillText(text, x + textOffset, y - textOffset);
  };

  const drawAllLinesForCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentHistory = historyRef.current[activeTab] || [];
    const currentStep = currentStepRef.current[activeTab] || 0;
    const drawings = (currentStep > 0 ? currentHistory.slice(0, currentStep) : []).flat();
    
    drawings.forEach((drawing, index) => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (drawing.type === 'line') {
        const [x1, y1, x2, y2] = drawing.points;
        const lengthText = `${drawing.lengthCm.toFixed(1)}cm`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        drawMetricsOnCanvas(ctx, lengthText, (x1 + x2) / 2, (y1 + y2) / 2);

        const lineDrawings = drawings.filter(d => d.type === 'line') as Line[];
        const currentLineIndex = lineDrawings.findIndex(l => l === drawing);
        const prevDrawing = currentLineIndex > 0 ? lineDrawings[currentLineIndex - 1] : null;

        if (prevDrawing) {
          const angleDiff = drawing.angleDeg - prevDrawing.angleDeg;
          const displayAngle = (angleDiff + 360) % 360;
          if(displayAngle !== 0 && displayAngle !== 360) {
            const finalAngle = displayAngle > 180 ? 360 - displayAngle : displayAngle;
            if (finalAngle > 1) { // Threshold to avoid tiny angle displays
                 const angleText = `${Math.round(finalAngle)}°`;
                 drawMetricsOnCanvas(ctx, angleText, x1, y1, -15);
            }
          }
        }
      } else if (drawing.type === 'circle') {
          ctx.beginPath();
          ctx.arc(drawing.cx, drawing.cy, drawing.radius, 0, 2 * Math.PI);
          ctx.stroke();
      }
    });

    if (isDrawing && startPoint && endPoint) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        if (drawingTool === 'line') {
            const pixelLength = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
            const cmLength = (pixelLength / (canvasRef.current?.width || 1)) * MAT_WIDTH_CM;
            const lengthText = `${cmLength.toFixed(1)}cm`;

            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
            drawMetricsOnCanvas(ctx, lengthText, (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2);
        } else if (drawingTool === 'circle') {
            const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
  }, [activeTab, isDrawing, startPoint, endPoint, color, lineWidth, drawingTool]);

  const drawMainCanvas = useCallback(() => {
      drawAllLinesForCanvas();
  }, [drawAllLinesForCanvas]);

  useEffect(() => {
    drawMainCanvas();
  }, [drawMainCanvas, activeTab, _]);

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
      
      image.onload = () => resizeCanvas();
      if (image.complete) resizeCanvas();

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
    const historyForTab = historyRef.current[activeTab] || [];
    const newHistory = historyForTab.slice(0, step);
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
    
    let newDrawing: Drawing;
    
    if (drawingTool === 'line') {
        const pixelLength = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        const cmLength = (pixelLength / canvas.width) * MAT_WIDTH_CM;
        const angleRad = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        const angleDeg = angleRad * (180 / Math.PI);
        newDrawing = {
            type: 'line',
            points: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
            color,
            lineWidth,
            lengthCm: cmLength,
            angleDeg: angleDeg,
        };
    } else { // circle
        const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        newDrawing = {
            type: 'circle',
            cx: startPoint.x,
            cy: startPoint.y,
            radius,
            color,
            lineWidth,
        };
    }
    
    const step = currentStepRef.current[activeTab] || 0;
    const newHistory = [...(historyRef.current[activeTab] || []).slice(0, step), [newDrawing]];
    
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
    const currentStep = currentStepRef.current[activeTab] || 0;
    if (currentStep > 0) {
        currentStepRef.current[activeTab] = currentStep - 1;
        drawMainCanvas();
        saveData();
    }
  };

  const redo = () => {
    const history = historyRef.current[activeTab] || [];
    const currentStep = currentStepRef.current[activeTab] || 0;
    if (currentStep < history.length) {
      currentStepRef.current[activeTab] = currentStep + 1;
      drawMainCanvas();
      saveData();
    }
  };

  const clearCanvas = () => {
    historyRef.current[activeTab] = [[]];
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

    const tableData = instructions;
    const tableWidth = 400;
    const tablePadding = 20;
    const cellPadding = 8;
    const headerHeight = 40;
    const rowHeight = 28;
    const titleHeight = 50;

    const tableHeight = titleHeight + headerHeight + tableData.length * rowHeight;
    const finalCanvasWidth = mainCanvas.width + tableWidth + tablePadding;
    const finalCanvasHeight = Math.max(mainCanvas.height, tableHeight);

    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = finalCanvasWidth;
    downloadCanvas.height = finalCanvasHeight;
    const ctx = downloadCanvas.getContext('2d');
    
    if(!ctx) return;

    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalCanvasWidth, finalCanvasHeight);

    // Draw map and drawings
    ctx.drawImage(bgImage, 0, 0, mainCanvas.width, mainCanvas.height);
    ctx.drawImage(mainCanvas, 0, 0);

    // Draw table
    const tableStartX = mainCanvas.width + tablePadding;
    let currentY = tablePadding;

    // Table Title
    ctx.fillStyle = '#111827'; // a dark gray
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Pseudocódigo', tableStartX, currentY);
    currentY += titleHeight;

    // Table Header
    ctx.fillStyle = '#f3f4f6'; // a light gray for header bg
    ctx.fillRect(tableStartX - cellPadding, currentY - cellPadding, tableWidth, headerHeight);
    ctx.fillStyle = '#374151'; // a medium gray for header text
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Passo', tableStartX, currentY);
    ctx.fillText('Ação', tableStartX + 80, currentY);
    ctx.textAlign = 'right';
    ctx.fillText('Valor', tableStartX + tableWidth - (cellPadding * 2), currentY);
    currentY += headerHeight;
    
    // Table Rows
    ctx.font = '14px sans-serif';
    tableData.forEach((row, index) => {
        ctx.fillStyle = (index % 2 === 0) ? '#ffffff' : '#f9fafb'; // alternating row colors
        ctx.fillRect(tableStartX - cellPadding, currentY - cellPadding, tableWidth, rowHeight);
        ctx.fillStyle = '#111827';
        ctx.textAlign = 'left';
        ctx.fillText(row.step.toString(), tableStartX, currentY);
        ctx.fillText(row.action, tableStartX + 80, currentY);
        ctx.textAlign = 'right';
        ctx.fillText(row.value, tableStartX + tableWidth - (cellPadding*2), currentY);
        currentY += rowHeight;
    });

    const link = document.createElement('a');
    link.download = `estrategia_${activeTab}_${new Date().toISOString()}.png`;
    link.href = downloadCanvas.toDataURL('image/png');
    link.click();
  };
  
    const instructions = useMemo((): Instruction[] => {
        if (!isClient) return [];
        const currentDrawings = (historyRef.current[activeTab] || [])
            .slice(0, currentStepRef.current[activeTab] || 0)
            .flat()
            .filter(d => d.type === 'line') as Line[];

        const result: Instruction[] = [];
        let stepCounter = 1;

        currentDrawings.forEach((line, index) => {
            // Add move instruction
            result.push({
                step: stepCounter++,
                action: "Mover para frente",
                value: `${line.lengthCm.toFixed(1)}cm`,
            });

            // Add turn instruction if there is a next line
            if (index < currentDrawings.length - 1) {
                const nextLine = currentDrawings[index + 1];
                const angle1 = line.angleDeg;
                const angle2 = nextLine.angleDeg;

                // Calculate cross product to determine direction
                const p1 = { x: line.points[2] - line.points[0], y: line.points[3] - line.points[1] };
                const p2 = { x: nextLine.points[2] - nextLine.points[0], y: nextLine.points[3] - nextLine.points[1] };
                const crossProduct = p1.x * p2.y - p1.y * p2.x;
                const direction = crossProduct > 0 ? "Direita" : "Esquerda";
                
                let angleDiff = Math.abs(angle1 - angle2);
                if (angleDiff > 180) {
                    angleDiff = 360 - angleDiff;
                }

                if (angleDiff > 1) { // Threshold for turning
                    result.push({
                        step: stepCounter++,
                        action: `Girar para ${direction}`,
                        value: `${angleDiff.toFixed(0)}°`,
                    });
                }
            }
        });

        return result;
    }, [activeTab, isClient, _]);


  return (
    <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
             <div className="lg:col-span-2 relative w-full aspect-[2/1] rounded-lg border overflow-hidden shadow-lg bg-muted flex items-center justify-center">
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
                            crossOrigin="anonymous"
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

            <div className="lg:col-span-1">
                 <Card className="w-full shrink-0">
                    <CardContent className="p-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                {Array.from({ length: NUM_SAIDAS }, (_, i) => (
                                <TabsTrigger key={i + 1} value={`saida-${i + 1}`}>
                                    Saída {i + 1}
                                </TabsTrigger>
                                ))}
                            </TabsList>
                            
                            <div className="p-1 pt-4 space-y-6">
                                <div>
                                    <Label className="text-base font-semibold">Ferramenta</Label>
                                    <RadioGroup value={drawingTool} onValueChange={(v) => setDrawingTool(v as DrawingTool)} className="grid grid-cols-2 gap-2 mt-2">
                                        <Label htmlFor="tool-line" className="border rounded-md p-2 flex items-center justify-center gap-2 cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary">
                                            <RadioGroupItem value="line" id="tool-line" className="sr-only"/>
                                            <MousePointer className="w-4 h-4"/> Linha
                                        </Label>
                                        <Label htmlFor="tool-circle" className="border rounded-md p-2 flex items-center justify-center gap-2 cursor-pointer has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary">
                                            <RadioGroupItem value="circle" id="tool-circle" className="sr-only"/>
                                            <Circle className="w-4 h-4"/> Círculo
                                        </Label>
                                    </RadioGroup>
                                </div>

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
                                        Espessura: {lineWidth}px
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
            
            <div className="lg:col-span-1">
                <StrategySteps instructions={instructions} />
            </div>
        </div>

        {isClient && mapImage && (
            <div className="mt-12 w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">Recursos das Saídas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: NUM_SAIDAS }, (_, i) => {
                        const saidaKey = `saida-${i + 1}`;
                        return (
                           <SaidaResources key={saidaKey} saidaKey={saidaKey} />
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
}
