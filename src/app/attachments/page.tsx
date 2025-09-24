
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2camera from 'html2canvas';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { Attachment } from '@/lib/types';
import AttachmentCard from '@/components/attachments/AttachmentCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AttachmentForm from '@/components/attachments/AttachmentForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function AttachmentsPage() {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
    const { toast } = useToast();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        const savedAttachments = localStorage.getItem('attachments');
        if (savedAttachments) {
            setAttachments(JSON.parse(savedAttachments));
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

    const handleDownloadCroqui = () => {
        if (printRef.current) {
            html2camera(printRef.current, {
                useCORS: true,
                backgroundColor: null,
                scale: 2,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `croqui_anexos_${new Date().toISOString()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const handleOpenDialog = (attachment: Attachment | null) => {
        setEditingAttachment(attachment ? attachment : {
            id: crypto.randomUUID(),
            name: '',
            category: 'Estratégia 1',
            runExit: '',
            missions: '',
            points: 0,
            avgTime: 0,
            swapTime: 0,
            precision: 100,
            imageUrl: null,
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingAttachment(null);
        setIsDialogOpen(false);
    };

    const handleSaveAttachment = (data: Attachment) => {
        if (attachments.some(a => a.id === data.id)) {
            setAttachments(attachments.map(a => (a.id === data.id ? data : a)));
            toast({ title: "Anexo atualizado!", description: `O anexo "${data.name}" foi atualizado.` });
        } else {
            setAttachments([...attachments, data]);
            toast({ title: "Anexo adicionado!", description: `O anexo "${data.name}" foi criado.` });
        }
        handleCloseDialog();
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
    
    const handleDuplicateAttachment = (attachmentId: string) => {
        const originalAttachment = attachments.find(a => a.id === attachmentId);
        if (originalAttachment) {
            const newAttachment = {
                ...originalAttachment,
                id: crypto.randomUUID(),
                name: `${originalAttachment.name} (Cópia)`,
            };
            setAttachments(prev => [...prev, newAttachment]);
            toast({ title: 'Anexo duplicado!', description: `Uma cópia de "${originalAttachment.name}" foi criada.` });
        }
    };

    const groupedAttachments = useMemo(() => {
        return attachments.reduce((acc, item) => {
            const category = item.category || 'Sem Categoria';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, Attachment[]>);
    }, [attachments]);


    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Anexos</h1>
                    <p className="text-muted-foreground">
                        Gerencie os anexos da equipe da temporada Unearthed.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2" />
                        Adicionar Anexo
                    </Button>
                    <Button onClick={handleDownloadCroqui} variant="outline">
                        <Download className="mr-2" />
                        Download Croqui
                    </Button>
                </div>
            </header>

            <div ref={printRef} className="space-y-12">
                {isClient && attachments.length > 0 ? (
                    Object.entries(groupedAttachments).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => {
                        if (items.length === 0) return null;
                        return (
                            <section key={category}>
                                <h2 className="text-2xl font-bold mb-4 border-b pb-2">{category}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {items.map(attachment => (
                                        <AttachmentCard
                                            key={attachment.id}
                                            attachment={attachment}
                                            onEdit={() => handleOpenDialog(attachment)}
                                            onDelete={() => handleDeleteRequest(attachment.id)}
                                            onDuplicate={() => handleDuplicateAttachment(attachment.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })
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
                 {isClient && attachments.length > 0 && Object.values(groupedAttachments).every(arr => arr.length === 0) && (
                    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                         <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-bold tracking-tight">
                                Nenhum anexo encontrado
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                As categorias que você criar aparecerão aqui.
                            </p>
                        </div>
                    </div>
                )}
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingAttachment && attachments.some(a => a.id === editingAttachment.id) ? 'Editar Anexo' : 'Novo Anexo'}</DialogTitle>
                    </DialogHeader>
                    {editingAttachment && (
                         <AttachmentForm
                            attachment={editingAttachment}
                            onSave={handleSaveAttachment}
                            onCancel={handleCloseDialog}
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
