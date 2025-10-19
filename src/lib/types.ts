
import { z } from 'zod';
import type { StageTime } from '@/components/rounds/RoundsTimer';

export const priorities = ['Baixa', 'Média', 'Alta'] as const;
export const statuses = ['Learning', 'Action', 'Decode', 'Feito'] as const;
export const areaNames = ['Projeto de Inovação', 'Construção', 'Programação', 'Core Values'] as const;


export const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "O nome da tarefa é obrigatório." }),
  priority: z.enum(priorities, { required_error: "A prioridade é obrigatória." }),
  area: z.array(z.string()).min(1, { message: "Selecione ao menos uma área." }),
  startDate: z.date().nullable(),
  dueDate: z.date().nullable(),
  columnId: z.string(),
});

export type Task = z.infer<typeof taskSchema>;
export type Priority = Task['priority'];
export type Status = typeof statuses[number];

export const evolutionEntrySchema = z.object({
    id: z.string(),
    date: z.string(),
    name: z.string(),
    missions: z.string(),
    points: z.coerce.number(),
    avgTime: z.coerce.number(),
    swapTime: z.coerce.number(),
    precision: z.coerce.number(),
    imageUrl: z.string().nullable().optional(),
    notes: z.string().optional(),
});

export type EvolutionEntry = z.infer<typeof evolutionEntrySchema>;

export const attachmentSchema = z.object({
    id: z.string(),
    runExit: z.string().min(1, 'A saída é obrigatória'),
    category: z.string().optional(),
    // Current state fields
    name: z.string().min(1, 'O nome é obrigatório'),
    missions: z.string().min(1, 'As missões são obrigatórias'),
    points: z.coerce.number().min(0, 'Os pontos devem ser positivos'),
    imageUrl: z.string().nullable().optional(),
    avgTime: z.coerce.number().min(0, 'O tempo deve ser positivo'),
    swapTime: z.coerce.number().min(0, 'O tempo de troca deve ser positivo'),
    precision: z.coerce.number().min(0).max(100, 'A precisão é de 0 a 100'),
    // Log of previous states
    evolutionLog: z.array(evolutionEntrySchema).optional(),
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
    isPinned: z.boolean(),
});

export type Evaluation = z.infer<typeof evaluationSchema>;

export const customNotificationSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "O título é obrigatório."),
    message: z.string().min(1, "A mensagem é obrigatória."),
    date: z.string(),
    targetUsers: z.array(z.string()).optional(),
});

export type CustomNotification = z.infer<typeof customNotificationSchema>;

export const missionSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "O nome da missão é obrigatório."),
    imageUrl: z.string().nullable().optional(),
    points: z.coerce.number().min(0, "A pontuação não pode ser negativa."),
    description: z.string().min(1, "A descrição é obrigatória."),
    hasBonus: z.boolean(),
    canLeaveAttachment: z.boolean(),
    priority: z.enum(priorities, { required_error: "A prioridade é obrigatória." }),
    location: z.string().min(1, "A localização é obrigatória."),
});

export type Mission = z.infer<typeof missionSchema>;

export const robotTestSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "O nome do teste é obrigatório."),
    type: z.enum(['Robô', 'Anexo', 'Programação']),
    date: z.date(),
    attempts: z.coerce.number().min(1, "Deve haver pelo menos uma tentativa."),
    successes: z.coerce.number().min(0, "O número de acertos não pode ser negativo."),
    objective: z.string().optional(),
    testedBy: z.array(z.string()).min(1, "É obrigatório informar quem realizou o teste."),
}).refine(data => data.successes <= data.attempts, {
    message: "O número de acertos não pode ser maior que o de tentativas.",
    path: ["successes"], 
});


export type RobotTest = z.infer<typeof robotTestSchema>;

export interface SpinResult {
  id: string;
  pairs: {
    pair: [string, string];
    area: string;
  }[];
  date: string;
  source: 'automatic' | 'manual';
}

export type StarRating = Record<string, number>;
export type StarRatingJustification = Record<string, {
    id: string;
    rating: number;
    reason: string;
    date: string;
}[]>;

export const inventoryItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "O nome do item é obrigatório."),
    category: z.string().optional(),
    quantity: z.union([z.string(), z.number()]),
    location: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
}
export interface MissionState {
    m00_equipment_inspection: boolean;
    m01_surface_brushing: { soil_deposits_cleaned: number; brush_not_touching: boolean };
    m02_map_reveal: { part1: boolean; part2: boolean; part3: boolean };
    m03_mine_shaft_explorer: { explored: boolean; gold_retrieved: boolean };
    m04_careful_retrieval: { retrieved: boolean; not_broken: boolean };
    m05_who_lived_here: boolean;
    m06_forge: { part1: boolean; part2: boolean; part3: boolean };
    m07_heavy_lifting: boolean;
    m08_silo: { part1: boolean; part2: boolean; part3: boolean };
    m09_whats_on_sale: { store_open: boolean; item_on_pedestal: boolean };
    m10_tip_the_scales: { tipped: boolean; both_sides_down: boolean };
    m11_fisher_artifacts: { retrieved: boolean; on_pedestal: boolean };
    m12_salvage_operation: { raised: boolean; animals_moved: boolean };
    m13_statue_reconstruction: boolean;
    m14_forum: { artifacts: number };
    m15_site_marking: { locations: number };
    precision_tokens: number;
}

export const initialMissionState: MissionState = {
    m00_equipment_inspection: false,
    m01_surface_brushing: { soil_deposits_cleaned: 0, brush_not_touching: false },
    m02_map_reveal: { part1: false, part2: false, part3: false },
    m03_mine_shaft_explorer: { explored: false, gold_retrieved: false },
    m04_careful_retrieval: { retrieved: false, not_broken: false },
    m05_who_lived_here: false,
    m06_forge: { part1: false, part2: false, part3: false },
    m07_heavy_lifting: false,
    m08_silo: { part1: false, part2: false, part3: false },
    m09_whats_on_sale: { store_open: false, item_on_pedestal: false },
    m10_tip_the_scales: { tipped: false, both_sides_down: false },
    m11_fisher_artifacts: { retrieved: false, on_pedestal: false },
    m12_salvage_operation: { raised: false, animals_moved: false },
    m13_statue_reconstruction: false,
    m14_forum: { artifacts: 0 },
    m15_site_marking: { locations: 0 },
    precision_tokens: 6,
};


const programmingTypes = ["Blocos", "Python", "Pybricks"] as const;
const errorCauses = ["Nenhuma", "Humana", "Código", "Mecânica"] as const;

type ProgrammingType = typeof programmingTypes[number];
type ErrorCause = typeof errorCauses[number];

export interface RoundData {
    id: string;
    date: string;
    programming: ProgrammingType[];
    errors: ErrorCause[];
    score: number;
    timings: StageTime[];
    missions: MissionState;
}
