
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, FastForward, CheckCircle, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '../ui/separator';

export interface StageTime {
    name: string;
    duration: number | null;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatSubTime = (ms: number) => {
    const totalSeconds = ms / 1000;
    return `${totalSeconds.toFixed(3)}s`;
};

const CountdownAnimation = ({ onFinish }: { onFinish: () => void }) => {
    const [text, setText] = useState('');
  
    useEffect(() => {
      const sequence: { t: string; duration: number }[] = [
        { t: '3', duration: 1000 },
        { t: '2', duration: 1000 },
        { t: '1', duration: 1000 },
        { t: 'LEGO!!!', duration: 1500 },
      ];
  
      let index = 0;
      const runSequence = () => {
        if (index < sequence.length) {
          setText(sequence[index].t);
          setTimeout(() => {
            index++;
            runSequence();
          }, sequence[index].duration);
        } else {
          onFinish();
        }
      };
  
      runSequence();
    }, [onFinish]);
  
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <h1 className="text-8xl md:text-9xl font-bold animate-pulse text-primary">
          {text}
        </h1>
      </div>
    );
};

interface RoundsTimerProps {
    seconds: number;
    setSeconds: React.Dispatch<React.SetStateAction<number>>;
    isActive: boolean;
    setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
    stageTimings: StageTime[];
    setStageTimings: React.Dispatch<React.SetStateAction<StageTime[]>>;
    currentStageIndex: number;
    setCurrentStageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalSeconds: number;
    stageNames: string[];
    onAnimationFinish: () => void;
}

export default function RoundsTimer({
    seconds, setSeconds, isActive, setIsActive, stageTimings, setStageTimings,
    currentStageIndex, setCurrentStageIndex, totalSeconds, stageNames, onAnimationFinish
}: RoundsTimerProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  
  const stageStartTimeRef = useRef<number | null>(null);
  const mainTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const handlePause = useCallback(() => {
    setIsActive(false);
    if (mainTimerIntervalRef.current) {
        clearInterval(mainTimerIntervalRef.current);
        mainTimerIntervalRef.current = null;
    }

    if (stageStartTimeRef.current !== null) {
      const now = performance.now();
      const elapsed = now - stageStartTimeRef.current;
      
      setStageTimings(prevTimings => {
        const newTimings = [...prevTimings];
        if(newTimings[currentStageIndex]) {
            const currentDuration = newTimings[currentStageIndex].duration || 0;
            newTimings[currentStageIndex] = { 
              ...newTimings[currentStageIndex], 
              duration: currentDuration + elapsed 
            };
        }
        return newTimings;
      });

      stageStartTimeRef.current = null;
    }
  }, [currentStageIndex, setIsActive, setStageTimings]);


  useEffect(() => {
    if (isActive && seconds <= 0) {
        handlePause();
        if (stageStartTimeRef.current !== null) {
            const now = performance.now();
            const elapsed = now - stageStartTimeRef.current;
            setStageTimings(prevTimings => {
                const newTimings = [...prevTimings];
                const currentDuration = newTimings[currentStageIndex].duration || 0;
                newTimings[currentStageIndex] = { ...newTimings[currentStageIndex], duration: currentDuration + elapsed };
                return newTimings;
            });
            stageStartTimeRef.current = null;
        }
    }
  }, [seconds, isActive, handlePause, currentStageIndex, setStageTimings]);

  const startTimers = useCallback(() => {
    if (mainTimerIntervalRef.current) return;

    setIsActive(true);

    mainTimerIntervalRef.current = setInterval(() => {
        setSeconds(s => s > 0 ? s - 1 : 0);
    }, 1000);

    if (stageTimings.length === 0) {
        const initialTimings = stageNames.map(name => ({name, duration: null}));
        setStageTimings(initialTimings);
        setCurrentStageIndex(0);
    }
    
    stageStartTimeRef.current = performance.now();
  }, [stageTimings.length, setIsActive, setSeconds, setStageTimings, setCurrentStageIndex, stageNames]);

  const handleStart = () => {
    if (seconds > 0) {
        if(stageTimings.length === 0) {
            setShowAnimation(true);
        } else {
            startTimers();
        }
    }
  };

  const handleAnimationFinishInternal = useCallback(() => {
    setShowAnimation(false);
    startTimers();
    onAnimationFinish();
  },[startTimers, onAnimationFinish]);

  const handleResetTimer = () => {
    handlePause();
    setSeconds(totalSeconds);
  };
  
  const handleResetData = () => {
    handlePause();
    setSeconds(totalSeconds);
    setStageTimings([]);
    setCurrentStageIndex(0);
    stageStartTimeRef.current = null;
  };

  const handleNextStage = () => {
      if (!isActive || currentStageIndex >= stageNames.length - 1) {
        if(isActive && currentStageIndex === stageNames.length -1) {
            const now = performance.now();
            if (stageStartTimeRef.current !== null) {
                const elapsed = now - stageStartTimeRef.current;
                setStageTimings(prevTimings => {
                    const newTimings = [...prevTimings];
                    const currentDuration = newTimings[currentStageIndex].duration || 0;
                    newTimings[currentStageIndex] = { ...newTimings[currentStageIndex], duration: currentDuration + elapsed };
                    return newTimings;
                });
            }
            stageStartTimeRef.current = null;
            handlePause();
        }
        return;
      };

      const now = performance.now();

      if (stageStartTimeRef.current !== null) {
          const elapsed = now - stageStartTimeRef.current;
          setStageTimings(prevTimings => {
            const newTimings = [...prevTimings];
            const currentDuration = newTimings[currentStageIndex].duration || 0;
            newTimings[currentStageIndex] = { ...newTimings[currentStageIndex], duration: currentDuration + elapsed };
            return newTimings;
          });
      }
      
      stageStartTimeRef.current = now;
      setCurrentStageIndex(prevIndex => prevIndex + 1);
  };


  const progress = (seconds / totalSeconds) * 100;
  const isFinished = currentStageIndex === stageNames.length - 1 && stageTimings[stageNames.length - 1]?.duration !== null && !isActive;

  return (
    <>
    {showAnimation && <CountdownAnimation onFinish={handleAnimationFinishInternal} />}
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cronômetro do Round</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
            <Progress value={progress} className="absolute w-full h-full rounded-full" />
            <div className="absolute w-[90%] h-[90%] bg-card rounded-full flex items-center justify-center">
                 <span className="text-5xl font-bold font-mono tabular-nums">
                    {formatTime(seconds)}
                </span>
            </div>
        </div>

        <div className="flex gap-4">
          {!isActive && seconds > 0 && !isFinished ? (
            <Button onClick={handleStart} size="lg" disabled={seconds === 0}>
              <Play className="mr-2 h-5 w-5" />
              {stageTimings.length > 0 ? 'Continuar' : 'Iniciar'}
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="outline" disabled={!isActive}>
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          )}
          <Button onClick={handleResetTimer} size="lg" variant="ghost">
            <RotateCcw className="mr-2 h-5 w-5" />
            Resetar
          </Button>
        </div>
        
        <Separator className="my-2" />

        <div className="w-full flex flex-col items-center gap-4">
            <Button onClick={handleNextStage} disabled={!isActive || isFinished} className="w-full">
                {isFinished ? <><CheckCircle className="mr-2 h-5 w-5" />Finalizado</> : <><FastForward className="mr-2 h-5 w-5" />Próxima Etapa</>}
            </Button>
            
            {stageTimings.length > 0 && (
                <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground">Etapa Atual:</p>
                    <p className="font-semibold text-lg">{stageNames[currentStageIndex]}</p>
                </div>
            )}

            <ScrollArea className="h-48 w-full mt-4">
                <div className="space-y-2 pr-4">
                    {stageTimings.map((stage, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                            <span className="font-medium">{stage.name}</span>
                            <Badge variant={(stage.duration === null || stage.duration === 0) ? 'outline' : 'default'} className="font-mono text-base">
                                {stage.duration !== null && stage.duration > 0 ? formatSubTime(stage.duration) : '...'}
                            </Badge>
                        </div>
                    ))}
                </div>
            </ScrollArea>
             {stageTimings.length > 0 && (
                <Button onClick={handleResetData} size="sm" variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetar Informações
                </Button>
            )}

        </div>
      </CardContent>
    </Card>
    </>
  );
}
