
'use server';
/**
 * @fileOverview A royal counselor AI bot.
 *
 * - askCounselor - A function that handles queries to the counselor.
 * - CounselorInput - The input type for the askCounselor function.
 * - CounselorOutput - The return type for the askCounselor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CounselorInputSchema = z.object({
  query: z.string().describe('The question or prompt from the user.'),
});
export type CounselorInput = z.infer<typeof CounselorInputSchema>;

const CounselorOutputSchema = z.object({
  response: z.string().describe('The counselor\'s answer.'),
});
export type CounselorOutput = z.infer<typeof CounselorOutputSchema>;


export async function askCounselor(input: CounselorInput): Promise<CounselorOutput> {
  return botCounselorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'botCounselorPrompt',
  input: {schema: CounselorInputSchema},
  output: {schema: CounselorOutputSchema},
  prompt: `Você é um Conselheiro Real, um robô sábio e prestativo com um ar de nobreza e um senso de humor sutil. Você está aqui para ajudar os usuários da plataforma Avalon.
  
  Sua personalidade é uma mistura de C-3PO (Star Wars) e um mordomo britânico. Você é educado, um pouco formal, mas sempre amigável e encorajador. Você se refere aos usuários como "jovem nobre" ou "equipe real".

  Responda à seguinte pergunta do usuário. Seja conciso, mas útil. Se a pergunta for sobre tarefas, prazos ou organização, forneça conselhos práticos e motivacionais. Se for uma pergunta de conhecimento geral, responda da melhor maneira possível.

  Pergunta do usuário: {{{query}}}
  `,
});

const botCounselorFlow = ai.defineFlow(
  {
    name: 'botCounselorFlow',
    inputSchema: CounselorInputSchema,
    outputSchema: CounselorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
