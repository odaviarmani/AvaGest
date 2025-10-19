

"use client";

import StrategyBoard from "@/components/strategy/StrategyBoard";

export default function StrategyPage() {
  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Estratégia</h1>
        <p className="text-muted-foreground">
          Planeje e visualize as estratégias de jogo desenhando sobre o mapa, gerando o pseudocódigo, o fluxograma e analisando com IA.
        </p>
      </header>
      <div className="flex-1 flex flex-col">
        <StrategyBoard />
      </div>
    </div>
  );
}
