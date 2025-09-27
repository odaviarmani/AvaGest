
"use client";

import React from 'react';
import PairingRoulette from '@/components/roulette/PairingRoulette';
import RouletteCreator from '@/components/roulette/RouletteCreator';

export default function RoulettePage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold">Roletas de Revezamento</h1>
          <p className="text-muted-foreground">Crie e gerencie suas roletas personalizadas ou use a roleta de duplas.</p>
        </div>
      </header>
      
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <PairingRoulette />
          </div>
          <div className="space-y-8">
            <RouletteCreator />
          </div>
        </div>
      </div>

    </div>
  );
}
