
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryItem, inventoryItemSchema } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface InventoryFormProps {
    item: InventoryItem;
    onSave: (data: InventoryItem) => void;
    onCancel: () => void;
}

export default function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
    const form = useForm<InventoryItem>({
        resolver: zodResolver(inventoryItemSchema),
        defaultValues: item,
    });

    const onSubmit = (data: InventoryItem) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-auto max-h-[60vh] pr-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Item</FormLabel>
                                    <FormControl><Input placeholder="Ex: Motor Grande EV3" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <FormControl><Input placeholder="Ex: Sensores" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantidade</FormLabel>
                                        <FormControl><Input placeholder="Ex: 10" {...field} /></FormControl>
                                        <FormDescription>
                                            Use números ou "Pouco", "Médio", "Muitas".
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Localização</FormLabel>
                                        <FormControl><Input placeholder="Ex: Caixa 3B" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Form>
    );
}
