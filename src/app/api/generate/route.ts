export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generate } from 'genkit/ai';
import { z } from 'zod';

export const runtime = 'edge';

configureGenkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

const StrategyAnalysisRequest = z.object({
  instructions: z.array(z.object({
    step: z.number(),
    action: z.string(),
    value: z.string(),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instructions } = StrategyAnalysisRequest.parse(body);

    if (instructions.length === 0) {
      return NextResponse.json({ error: 'Nenhuma instrução fornecida.' }, { status: 400 });
    }

    const instructionsText = instructions
      .map(instr => `${instr.step}. ${instr.action}: ${instr.value}`)
      .join('\n');

    const prompt = `
      Você é um técnico experiente de FIRST LEGO League. Sua tarefa é analisar uma estratégia de round baseada em uma sequência de passos (pseudocódigo) e descrevê-la em linguagem natural.

      A descrição deve ser clara, concisa e focada na estratégia do robô no tapete.
      - Comece com uma visão geral da estratégia.
      - Descreva o fluxo do robô de forma lógica.
      - Destaque as principais ações, como movimentos e giros.
      - Mantenha a descrição técnica, mas fácil de entender.

      Aqui estão os passos da estratégia:
      ${instructionsText}

      Agora, gere a análise da estratégia.
    `;

    const llmResponse = await generate({
      model: 'gemini-1.5-flash-latest',
      prompt: prompt,
      config: {
        temperature: 0.5,
      },
    });

    const analysis = llmResponse.text();

    return NextResponse.json({ analysis });
  } catch (e: any) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados de entrada inválidos.', details: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro ao analisar a estratégia.', message: e.message }, { status: 500 });
  }
}
