
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import CoreValuesTracker from "@/components/core-values/CoreValuesTracker";
import { Heart, Gamepad2, Download, Star } from "lucide-react";
import DrawingCanvas from "@/components/core-values/DrawingCanvas";
import TicTacToe from "@/components/core-values/TicTacToe";
import { useAuth, ADMIN_USERS } from "@/contexts/AuthContext";
import MemoryGame from "@/components/core-values/MemoryGame";
import FlappyBirdGame from "@/components/core-values/FlappyBirdGame";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CoreValuesPage() {
  const { username } = useAuth();
  const isAdmin = username && ADMIN_USERS.includes(username);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_core_values_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-12">
        <header className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Heart className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Core Values</h1>
                    <p className="text-muted-foreground">
                    Acompanhe as equipes que conhecemos e o alcance dos nossos valores pelo Brasil.
                    </p>
                </div>
            </div>
            <Button onClick={handleDownloadCroqui} variant="outline">
                <Download className="mr-2" />
                Download Croqui
            </Button>
        </header>

      <div ref={printRef}>
        <CoreValuesTracker />

        {isAdmin && (
            <div className="border-t pt-12 mt-12">
            <header className="mb-8 flex items-center gap-4">
                <Gamepad2 className="w-8 h-8 text-primary" />
                <div>
                <h1 className="text-3xl font-bold">Diversão</h1>
                <p className="text-muted-foreground">
                    Um espaço para relaxar com um quadro de desenho e minigames.
                </p>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <DrawingCanvas />
                <TicTacToe />
                <MemoryGame />
                <FlappyBirdGame />
            </div>
            </div>
        )}
      </div>

       <div className="mt-8 text-center">
          <Button asChild size="lg">
              <Link href="/core-values/estrelinhas">
                  <Star className="mr-2" />
                  Acessar Estrelinhas
              </Link>
          </Button>
      </div>
    </div>
  );
}
