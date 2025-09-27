
"use client";

import React from 'react';
import RoundsStats from "@/components/rounds/RoundsStats";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RoundsStatsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
            <Link href="/rounds">
                <ArrowLeft />
                <span className="sr-only">Voltar para Rounds</span>
            </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Estatísticas dos Rounds</h1>
                <p className="text-muted-foreground">
                Análise do histórico de pontuações, tempos e erros.
                </p>
            </div>
        </div>
      </header>
      <div>
        <RoundsStats />
      </div>
    </div>
  );
}
