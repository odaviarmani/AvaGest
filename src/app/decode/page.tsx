
"use client";

import React from 'react';
import DecodeEvaluation from "@/components/decode/DecodeEvaluation";
import { Code } from "lucide-react";

export default function DecodePage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Code className="w-8 h-8" />
            <div>
            <h1 className="text-3xl font-bold">Parâmetro do Decode</h1>
            <p className="text-muted-foreground">
                Ferramenta para avaliar ideias e projetos com base em critérios pré-definidos.
            </p>
            </div>
        </div>
      </header>
      <div>
        <DecodeEvaluation />
      </div>
    </div>
  );
}
