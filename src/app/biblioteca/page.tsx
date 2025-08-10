"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LibraryItem } from '@/lib/types';
import LibraryItemCard from '@/components/biblioteca/LibraryItemCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LibraryItemForm from '@/components/biblioteca/LibraryItemForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BibliotecaPage() {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const savedItems = localStorage.getItem('libraryItems');
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('libraryItems', JSON.stringify(items));
        }
    }, [items, isClient]);

    const handleOpenDialog = (item: LibraryItem | null) => {
        setEditingItem(item ? item : {
            id: crypto.randomUUID(),
            title: '',
            author: '',
            link: '',
            summary: '',
            imageUrl: null,
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingItem(null);
        setIsDialogOpen(false);
    };

    const handleSaveItem = (data: LibraryItem) => {
        if (items.some(i => i.id === data.id)) {
            setItems(items.map(i => (i.id === data.id ? data : i)));
            toast({ title: "Item atualizado!", description: `"${data.title}" foi atualizado.` });
        } else {
            setItems([...items, data]);
            toast({ title: "Item adicionado!", description: `"${data.title}" foi adicionado à biblioteca.` });
        }
        handleCloseDialog();
    };

    const handleDeleteRequest = (itemId: string) => {
        setItemToDelete(itemId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            const itemTitle = items.find(i => i.id === itemToDelete)?.title;
            setItems(items.filter(i => i.id !== itemToDelete));
            toast({ title: "Item removido!", description: `"${itemTitle}" foi excluído.`, variant: 'destructive' });
            setItemToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Biblioteca</h1>
                    <p className="text-muted-foreground">
                        Catalogue e gerencie os materiais de estudo da equipe.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2" />
                    Adicionar Item
                </Button>
            </header>

            {isClient && items.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <LibraryItemCard 
                            key={item.id} 
                            item={item}
                            onEdit={() => handleOpenDialog(item)}
                            onDelete={() => handleDeleteRequest(item.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Nenhum item na biblioteca
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Comece adicionando livros e artigos para vê-los aqui.
                        </p>
                    </div>
                </div>
            )}

             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem && items.some(a => a.id === editingItem.id) ? 'Editar Item' : 'Novo Item'}</DialogTitle>
                         <DialogDescription>
                            Preencha as informações do livro ou artigo.
                        </DialogDescription>
                    </DialogHeader>
                    {editingItem && (
                         <LibraryItemForm
                            item={editingItem}
                            onSave={handleSaveItem}
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o item da biblioteca.
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
