import { z } from 'zod';

export const priorities = ['Baixa', 'Média', 'Alta'] as const;
export const columnNames = ['Planejamento', 'Fazer', 'Fazendo', 'Feito', 'Análise', 'Aprimoramento'] as const;

export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "O nome da tarefa é obrigatório." }),
  priority: z.enum(priorities, { required_error: "A prioridade é obrigatória." }),
  area: z.string().min(1, { message: "A área é obrigatória." }),
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  columnId: z.enum(columnNames),
});

export type Task = z.infer<typeof taskSchema>;
export type Priority = Task['priority'];
export type ColumnId = Task['columnId'];
