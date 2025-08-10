
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, FastForward, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '../ui/separator';

const TOTAL_SECONDS = 150; // 2 minutes and 30 seconds

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const formatSubTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  return `${seconds}.${String(milliseconds).padStart(3, '0')}s`;
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

const STAGE_NAMES = [
    "Saída 1", "Troca de anexo 1-2",
    "Saída 2", "Troca de anexo 2-3",
    "Saída 3", "Troca de anexo 3-4",
    "Saída 4", "Troca de anexo 4-5",
    "Saída 5", "Troca de anexo 5-6",
    "Saída 6"
];

interface StageTime {
    name: string;
    duration: number | null;
}


export default function RoundsTimer() {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Sub-timer state
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageTimings, setStageTimings] = useState<StageTime[]>([]);
  const stageStartTimeRef = useRef<number | null>(null);
  const mainTimerStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
        handlePause(); // Stop everything when main timer ends
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds]);

  const startTimers = () => {
    const now = performance.now();
    setIsActive(true);
    if(mainTimerStartTimeRef.current === null){
        mainTimerStartTimeRef.current = now;
        const initialTimings = STAGE_NAMES.map(name => ({name, duration: null}));
        setStageTimings(initialTimings);
    }
    stageStartTimeRef.current = now;
  };

  const handleStart = () => {
    if (seconds > 0) {
        setShowAnimation(true);
    }
  };

  const handleAnimationFinish = useCallback(() => {
    setShowAnimation(false);
    startTimers();
  },[]);

  const handlePause = () => {
    setIsActive(false);
    // Pause sub-timer logic
    if (stageStartTimeRef.current !== null && stageTimings[currentStageIndex]?.duration === null) {
      const now = performance.now();
      const elapsed = now - stageStartTimeRef.current;
      const newTimings = [...stageTimings];
      const currentDuration = newTimings[currentStageIndex].duration || 0;
      newTimings[currentStageIndex] = { ...newTimings[currentStageIndex], duration: currentDuration + elapsed };
      setStageTimings(newTimings);
      stageStartTimeRef.current = null;
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(TOTAL_SECONDS);
    setCurrentStageIndex(0);
    setStageTimings([]);
    stageStartTimeRef.current = null;
    mainTimerStartTimeRef.current = null;
  };

  const handleNextStage = () => {
      if (!isActive || currentStageIndex >= STAGE_NAMES.length) return;

      const now = performance.now();

      if (stageStartTimeRef.current !== null) {
          const elapsed = now - stageStartTimeRef.current;
          const newTimings = [...stageTimings];
          const currentDuration = newTimings[currentStageIndex].duration || 0;
          newTimings[currentStageIndex] = { ...newTimings[currentStageIndex], duration: currentDuration + elapsed };
          setStageTimings(newTimings);
      }
      
      stageStartTimeRef.current = now;

      if(currentStageIndex < STAGE_NAMES.length - 1) {
          setCurrentStageIndex(prev => prev + 1);
      } else {
        // Last stage finished, stop timers
        setIsActive(false);
      }
  };


  const progress = (seconds / TOTAL_SECONDS) * 100;
  const isFinished = currentStageIndex === STAGE_NAMES.length - 1 && stageTimings[STAGE_NAMES.length - 1]?.duration !== null;

  return (
    <>
    {showAnimation && <CountdownAnimation onFinish={handleAnimationFinish} />}
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
          <Button onClick={handleReset} size="lg" variant="ghost">
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
                    <p className="font-semibold text-lg">{STAGE_NAMES[currentStageIndex]}</p>
                </div>
            )}

            <ScrollArea className="h-48 w-full mt-4">
                <div className="space-y-2 pr-4">
                    {stageTimings.map((stage, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-secondary/50">
                            <span className="font-medium">{stage.name}</span>
                            <Badge variant={stage.duration === null ? 'outline' : 'default'} className="font-mono text-base">
                                {stage.duration !== null ? formatSubTime(stage.duration) : '...'}
                            </Badge>
                        </div>
                    ))}
                </div>
            </ScrollArea>

        </div>
      </CardContent>
    </Card>
    </>
  );
}
