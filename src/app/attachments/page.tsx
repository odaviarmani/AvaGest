
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Attachment, EvolutionEntry } from '@/lib/types';
import AttachmentCard from '@/components/attachments/AttachmentCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AttachmentForm from '@/components/attachments/AttachmentForm';
import EvolutionForm from '@/components/attachments/EvolutionForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function AttachmentsPage() {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isClient, setIsClient] = useState(false);
    
    const [isAttachmentFormOpen, setIsAttachmentFormOpen] = useState(false);
    const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
    
    const [isEvolutionFormOpen, setIsEvolutionFormOpen] = useState(false);
    const [evolvingAttachment, setEvolvingAttachment] = useState<Attachment | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
    
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        try {
            const savedAttachments = localStorage.getItem('attachments');
            if (savedAttachments) {
                setAttachments(JSON.parse(savedAttachments));
            }
        } catch (error) {
            console.error("Failed to load attachments from localStorage:", error);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('attachments', JSON.stringify(attachments));
            } catch (error) {
                console.error("Failed to save attachments to localStorage:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: "Não foi possível salvar os anexos. O armazenamento local pode estar cheio."
                })
            }
        }
    }, [attachments, isClient, toast]);
    
    const groupedAttachments = useMemo(() => {
        const groups: Record<string, Attachment[]> = {};
        if (!isClient) return groups;

        attachments.forEach(attachment => {
            const category = attachment.category || 'Sem Categoria';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(attachment);
        });
        
        return Object.keys(groups)
            .sort((a, b) => a.localeCompare(b))
            .reduce((acc, key) => {
                acc[key] = groups[key];
                return acc;
            }, {} as Record<string, Attachment[]>);
            
    }, [attachments, isClient]);

    const handleOpenAttachmentForm = (attachment: Attachment | null) => {
        setEditingAttachment(attachment);
        setIsAttachmentFormOpen(true);
    };

    const handleOpenEvolutionForm = (attachment: Attachment) => {
        setEvolvingAttachment(attachment);
        setIsEvolutionFormOpen(true);
    };

    const handleCloseForms = () => {
        setEditingAttachment(null);
        setEvolvingAttachment(null);
        setIsAttachmentFormOpen(false);
        setIsEvolutionFormOpen(false);
    };

    const handleSaveAttachment = (data: Attachment) => {
        if (attachments.some(a => a.id === data.id)) {
            setAttachments(attachments.map(a => (a.id === data.id ? data : a)));
            toast({ title: "Anexo atualizado!", description: `O anexo "${data.name}" foi atualizado.` });
        } else {
            setAttachments([...attachments, data]);
            toast({ title: "Anexo adicionado!", description: `O anexo "${data.name}" foi criado.` });
        }
        handleCloseForms();
    };

    const handleSaveEvolution = (attachmentToUpdate: Attachment, newEvolutionData: Omit<EvolutionEntry, 'id' | 'date'>) => {
        const previousState: EvolutionEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            name: attachmentToUpdate.name,
            missions: attachmentToUpdate.missions,
            points: attachmentToUpdate.points,
            avgTime: attachmentToUpdate.avgTime,
            swapTime: attachmentToUpdate.swapTime,
            precision: attachmentToUpdate.precision,
            imageUrl: attachmentToUpdate.imageUrl,
            notes: newEvolutionData.notes,
        };

        const updatedAttachment: Attachment = {
            ...attachmentToUpdate,
            name: newEvolutionData.name,
            missions: newEvolutionData.missions,
            points: newEvolutionData.points,
            avgTime: newEvolutionData.avgTime,
            swapTime: newEvolutionData.swapTime,
            precision: newEvolutionData.precision,
            imageUrl: newEvolutionData.imageUrl,
            evolutionLog: [...(attachmentToUpdate.evolutionLog || []), previousState],
        };
        
        const newAttachments = attachments.map(a => a.id === updatedAttachment.id ? updatedAttachment : a);
        setAttachments(newAttachments);

        toast({ title: "Evolução registrada!", description: `Nova evolução para "${updatedAttachment.name}" foi salva.` });
        handleCloseForms();
    };


    const handleDeleteRequest = (attachmentId: string) => {
        setAttachmentToDelete(attachmentId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (attachmentToDelete) {
            const attachmentName = attachments.find(a => a.id === attachmentToDelete)?.name;
            setAttachments(attachments.filter(a => a.id !== attachmentToDelete));
            toast({ title: "Anexo removido!", description: `O anexo "${attachmentName}" foi excluído.`, variant: 'destructive' });
            setAttachmentToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleDuplicate = (attachmentId: string) => {
        const original = attachments.find(a => a.id === attachmentId);
        if (!original) return;

        const newAttachment: Attachment = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (Cópia)`,
            evolutionLog: [], // Clones don't inherit history
        };

        setAttachments(prev => [...prev, newAttachment]);
        toast({ title: "Anexo duplicado!", description: `Uma cópia de "${original.name}" foi criada.`});
    };
    
    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Anexos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os anexos da equipe e acompanhe sua evolução.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenAttachmentForm(null)}>
                        <PlusCircle className="mr-2" />
                        Adicionar Anexo
                    </Button>
                </div>
            </header>

            <div className="space-y-12">
                {isClient && attachments.length > 0 ? (
                    Object.entries(groupedAttachments).map(([category, items]) => (
                        <div key={category}>
                             <h2 className="text-2xl font-bold tracking-tight mb-4 border-b pb-2">{category}</h2>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {items.map(attachment => (
                                    <AttachmentCard
                                        key={attachment.id}
                                        attachment={attachment}
                                        onEdit={() => handleOpenAttachmentForm(attachment)}
                                        onDelete={() => handleDeleteRequest(attachment.id)}
                                        onDuplicate={() => handleDuplicate(attachment.id)}
                                        onEvolve={() => handleOpenEvolutionForm(attachment)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                Nenhum anexo encontrado
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Comece adicionando anexos para vê-los listados aqui.
                            </p>
                        </div>
                    </div>
                )}
            </div>
             <Dialog open={isAttachmentFormOpen} onOpenChange={setIsAttachmentFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAttachment ? 'Editar Anexo' : 'Novo Anexo'}</DialogTitle>
                    </DialogHeader>
                    {isAttachmentFormOpen && (
                         <AttachmentForm
                            attachment={editingAttachment}
                            onSave={handleSaveAttachment}
                            onCancel={handleCloseForms}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEvolutionFormOpen} onOpenChange={setIsEvolutionFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Registrar Evolução</DialogTitle>
                        <DialogDescription>Registre uma nova versão do anexo "{evolvingAttachment?.name}".</DialogDescription>
                    </DialogHeader>
                    {isEvolutionFormOpen && evolvingAttachment && (
                         <EvolutionForm
                            baseAttachment={evolvingAttachment}
                            onSave={handleSaveEvolution}
                            onCancel={handleCloseForms}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o anexo.
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
