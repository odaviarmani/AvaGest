"use client";

import CoreValuesTracker from "@/components/core-values/CoreValuesTracker";
import { Heart, Gamepad2 } from "lucide-react";
import DrawingCanvas from "@/components/core-values/DrawingCanvas";
import TicTacToe from "@/components/core-values/TicTacToe";
import { useAuth } from "@/contexts/AuthContext";

export default function CoreValuesPage() {
  const { username } = useAuth();

  return (
    <div className="flex-1 p-4 md:p-8 space-y-12">
      <div>
        <header className="mb-8 flex items-center gap-4">
          <Heart className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Core Values</h1>
            <p className="text-muted-foreground">
              Acompanhe as equipes que conhecemos e o alcance dos nossos valores pelo Brasil.
            </p>
          </div>
        </header>
        <CoreValuesTracker />
      </div>

      {username !== 'Lorenzo' && (
        <div className="border-t pt-12">
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
          </div>
        </div>
      )}
    </div>
  );
}
