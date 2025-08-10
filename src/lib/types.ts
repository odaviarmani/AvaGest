import { z } from 'zod';

export const priorities = ['Baixa', 'Média', 'Alta'] as const;
export const columnNames = ['Planejamento', 'Fazer', 'Fazendo', 'Feito', 'Análise', 'Aprimoramento'] as const;
export const areaNames = ['Projeto de Inovação', 'Construção', 'Programação', 'Core Values'] as const;


export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "O nome da tarefa é obrigatório." }),
  priority: z.enum(priorities, { required_error: "A prioridade é obrigatória." }),
  area: z.array(z.string()).min(1, { message: "Selecione ao menos uma área." }),
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  columnId: z.enum(columnNames),
});

export type Task = z.infer<typeof taskSchema>;
export type Priority = Task['priority'];
export type ColumnId = Task['columnId'];

export const attachmentSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'O nome é obrigatório'),
    runExit: z.string().min(1, 'A saída é obrigatória'),
    missions: z.string().min(1, 'As missões são obrigatórias'),
    points: z.coerce.number().min(0, 'Os pontos devem ser positivos'),
    avgTime: z.coerce.number().min(0, 'O tempo deve ser positivo'),
    swapTime: z.coerce.number().min(0, 'O tempo de troca deve ser positivo'),
    precision: z.coerce.number().min(0).max(100, 'A precisão é de 0 a 100'),
    imageUrl: z.string().optional().nullable(),
});

export type Attachment = z.infer<typeof attachmentSchema>;

export const CRITERIA = [
    { key: 'coherence', label: 'Coerências T-P-S' },
    { key: 'alignment', label: 'Alinhamento com a Unearthed' },
    { key: 'feasibility', label: 'Viabilidade' },
    { key: 'originality', label: 'Originalidade' },
    { key: 'clarity', label: 'Clareza/Registros' },
] as const;

export const evaluationSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'O nome do item é obrigatório.'),
    scores: z.record(z.string(), z.number().min(1).max(4)),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

export const libraryItemSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'O título é obrigatório.'),
    author: z.string().min(1, 'O autor é obrigatório.'),
    link: z.string().url('Insira uma URL válida.').optional().or(z.literal('')),
    summary: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
});

export type LibraryItem = z.infer<typeof libraryItemSchema>;
