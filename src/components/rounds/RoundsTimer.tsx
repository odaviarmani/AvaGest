
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TOTAL_SECONDS = 150; // 2 minutes and 30 seconds

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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

export default function RoundsTimer() {
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      // Optional: Add a sound or visual notification when time is up
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds]);

  const handleStart = () => {
    if (seconds > 0) {
        setShowAnimation(true);
    }
  };

  const handleAnimationFinish = useCallback(() => {
    setShowAnimation(false);
    setIsActive(true);
  },[]);

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(TOTAL_SECONDS);
  };

  const progress = (seconds / TOTAL_SECONDS) * 100;

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
          {!isActive ? (
            <Button onClick={handleStart} size="lg" disabled={seconds === 0}>
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="outline">
              <Pause className="mr-2 h-5 w-5" />
              Pausar
            </Button>
          )}
          <Button onClick={handleReset} size="lg" variant="ghost">
            <RotateCcw className="mr-2 h-5 w-5" />
            Resetar
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
