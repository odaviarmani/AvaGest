
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Target, BrainCircuit } from 'lucide-react';
import { Mission } from '@/lib/types';
import MissionCard from '@/components/missions/MissionCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MissionForm from '@/components/missions/MissionForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';


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
                    <Button variant="outline" asChild disabled={missions.length < 4}>
                        <Link href="/missions/quiz">
                             <BrainCircuit className="mr-2" />
                            Iniciar Quiz
                        </Link>
                    </Button>
                </div>
            </header>

            <div>
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
            </div>
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
