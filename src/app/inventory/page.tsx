
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Archive } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import InventoryItemCard from '@/components/inventory/InventoryItemCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InventoryForm from '@/components/inventory/InventoryForm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function InventoryPage() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const savedItems = localStorage.getItem('inventoryItems');
        if (savedItems) {
            setInventoryItems(JSON.parse(savedItems));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            try {
                localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
            } catch (error) {
                console.error("Failed to save inventory items to localStorage:", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: "Não foi possível salvar os itens do inventário."
                });
            }
        }
    }, [inventoryItems, isClient, toast]);

    const groupedItems = useMemo(() => {
        return inventoryItems.reduce((acc, item) => {
            const category = item.category || 'Sem Categoria';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, InventoryItem[]>);
    }, [inventoryItems]);

    const handleOpenDialog = (item: InventoryItem | null) => {
        setEditingItem(item ? item : {
            id: crypto.randomUUID(),
            name: '',
            category: 'Outros',
            quantity: 1,
            location: '',
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setEditingItem(null);
        setIsDialogOpen(false);
    };

    const handleSaveItem = (data: InventoryItem) => {
        if (inventoryItems.some(item => item.id === data.id)) {
            setInventoryItems(inventoryItems.map(item => (item.id === data.id ? data : item)));
            toast({ title: "Item atualizado!", description: `O item "${data.name}" foi atualizado.` });
        } else {
            setInventoryItems([...inventoryItems, data]);
            toast({ title: "Item adicionado!", description: `O item "${data.name}" foi adicionado ao inventário.` });
        }
        handleCloseDialog();
    };

    const handleDeleteRequest = (itemId: string) => {
        setItemToDelete(itemId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            const itemName = inventoryItems.find(item => item.id === itemToDelete)?.name;
            setInventoryItems(inventoryItems.filter(item => item.id !== itemToDelete));
            toast({ title: "Item removido!", description: `O item "${itemName}" foi excluído.`, variant: 'destructive' });
            setItemToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    return (
        <div className="flex-1 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Archive className="w-8 h-8 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold">Inventário</h1>
                        <p className="text-muted-foreground">
                            Gerencie os componentes e peças da equipe.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2" />
                        Adicionar Item
                    </Button>
                </div>
            </header>

            <div>
            {isClient && inventoryItems.length > 0 ? (
                <div className="space-y-8">
                    {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                        <div key={category}>
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{category}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {items.map(item => (
                                    <InventoryItemCard 
                                        key={item.id} 
                                        item={item}
                                        onEdit={() => handleOpenDialog(item)}
                                        onDelete={() => handleDeleteRequest(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
                    <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Nenhum item no inventário
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Comece adicionando itens para vê-los aqui.
                    </p>
                    </div>
                </div>
            )}
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingItem && inventoryItems.some(i => i.id === editingItem.id) ? 'Editar Item' : 'Novo Item'}</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                         <InventoryForm
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o item do inventário.
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
