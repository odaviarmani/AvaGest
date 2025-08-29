
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Target, Download } from 'lucide-react';
import { Mission } from '@/lib/types';
import MissionCard from '@/components/missions/MissionCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MissionForm from '@/components/missions/MissionForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Helper to shuffle arrays
const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMission, setEditingMission] = useState<Mission | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const savedMissions = localStorage.getItem('missions');
        if (savedMissions) {
            setMissions(JSON.parse(savedMissions));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('missions', JSON.stringify(missions));
            } catch (error) {
                console.error("Failed to save missions to localStorage:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: "Não foi possível salvar as missões."
                });
            }
        }
    }, [missions, isClient, toast]);

    const handleOpenDialog = (mission: Mission | null) => {
        setEditingMission(mission);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingMission(null);
        setIsDialogOpen(false);
    };

    const handleSaveMission = (data: Mission) => {
        if (missions.some(m => m.id === data.id)) {
            setMissions(missions.map(m => (m.id === data.id ? data : m)));
            toast({ title: "Missão atualizada!", description: `A missão "${data.name}" foi atualizada.` });
        } else {
            setMissions([...missions, data]);
            toast({ title: "Missão adicionada!", description: `A missão "${data.name}" foi criada.` });
        }
        handleCloseDialog();
    };

    const handleDeleteRequest = (missionId: string) => {
        setMissionToDelete(missionId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (missionToDelete) {
            const missionName = missions.find(m => m.id === missionToDelete)?.name;
            setMissions(missions.filter(m => m.id !== missionToDelete));
            toast({ title: "Missão removida!", description: `A missão "${missionName}" foi excluída.`, variant: 'destructive' });
            setMissionToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };
    
     const generateQuiz = () => {
        if (missions.length < 2) {
            toast({
                variant: 'destructive',
                title: 'Missões insuficientes',
                description: 'Cadastre pelo menos 2 missões para gerar um quiz.',
            });
            return;
        }

        let questions: string[] = [];
        const questionTemplates = [
            // Pontuação
            (m: Mission) => `Qual é a pontuação base da missão "${m.name}"?`,
            // Localização
            (m: Mission) => `Em qual local do tapete a missão "${m.name}" está?`,
            // Prioridade
            (m: Mission) => `A missão "${m.name}" tem qual prioridade de execução?`,
            // Bônus
            (m: Mission) => `Verdadeiro ou Falso: A missão "${m.name}" concede pontos de bônus.`,
            // Deixar Anexo
            (m: Mission) => `É permitido deixar um anexo para completar a missão "${m.name}"?`,
            // Descrição/Objetivo
            (m: Mission) => `Qual o principal objetivo da missão "${m.name}"?`,
            // Comparação de pontos
            (m1: Mission, m2: Mission) => `Qual missão vale mais pontos: "${m1.name}" ou "${m2.name}"?`,
             // Comparação de prioridade
            (m1: Mission, m2: Mission) => `Considerando a estratégia da equipe, qual missão tem maior prioridade entre "${m1.name}" e "${m2.name}"?`,
            // Múltipla escolha - Pontos
            (m: Mission) => {
                const options = shuffle([m.points, m.points + 10, m.points - 5, m.points + 5].filter(p => p>=0)).slice(0, 4);
                return `Qual a pontuação correta para a missão "${m.name}"?\n(a) ${options[0]} (b) ${options[1]} (c) ${options[2]} (d) ${options[3]}`;
            },
             // Múltipla escolha - Localização
            (m: Mission) => {
                const otherMissions = missions.filter(om => om.id !== m.id);
                const randomLocations = shuffle(otherMissions).slice(0, 3).map(om => om.location);
                const options = shuffle([m.location, ...randomLocations]);
                return `Onde fica a missão "${m.name}"?\n(a) ${options[0]} (b) ${options[1]} (c) ${options[2]} (d) ${options[3]}`;
            },
            // Cenário
            (m1: Mission, m2: Mission) => `Se a equipe completar as missões "${m1.name}" e "${m2.name}", quantos pontos seriam obtidos no total?`,
            // Identificação por descrição
            (m: Mission) => `Qual é o nome da missão que envolve "${m.description.substring(0, 30)}..."?`
        ];

        while (questions.length < 50) {
            const templateIndex = Math.floor(Math.random() * questionTemplates.length);
            const template = questionTemplates[templateIndex];
            
            const shuffledMissions = shuffle(missions);
            const m1 = shuffledMissions[0];
            const m2 = shuffledMissions.length > 1 ? shuffledMissions[1] : shuffledMissions[0];

            let newQuestion = '';
            if (template.length === 1) { // Template de 1 missão
                newQuestion = template(m1);
            } else { // Template de 2 missões
                newQuestion = (template as (m1: Mission, m2: Mission) => string)(m1, m2);
            }

            if (!questions.includes(newQuestion)) {
                questions.push(`${questions.length + 1}. ${newQuestion}`);
            }
        }
        
        const fileContent = `Quiz Dinâmico - Missões da Temporada\n\n${questions.join('\n\n')}`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz_missoes_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ title: "Quiz gerado!", description: "O arquivo de texto com as perguntas foi baixado."});
    };


    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Target className="w-8 h-8 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold">Missões da Temporada</h1>
                        <p className="text-muted-foreground">
                            Cadastre e gerencie as missões do tapete.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2" />
                        Adicionar Missão
                    </Button>
                    <Button variant="outline" onClick={generateQuiz} disabled={missions.length < 2}>
                        <Download className="mr-2" />
                        Gerar Quiz
                    </Button>
                </div>
            </header>

            {isClient && missions.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {missions.map(mission => (
                        <MissionCard 
                            key={mission.id} 
                            mission={mission}
                            onEdit={() => handleOpenDialog(mission)}
                            onDelete={() => handleDeleteRequest(mission.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                    <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Nenhuma missão encontrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Comece adicionando missões para vê-las listadas aqui.
                    </p>
                    </div>
                </div>
            )}
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingMission ? 'Editar Missão' : 'Nova Missão'}</DialogTitle>
                    </DialogHeader>
                    <MissionForm
                        mission={editingMission}
                        onSave={handleSaveMission}
                        onCancel={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a missão.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
