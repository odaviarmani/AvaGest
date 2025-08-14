
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InventoryItem, inventoryItemSchema, ITEM_CATEGORIES } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface InventoryFormProps {
    item: InventoryItem;
    onSave: (data: InventoryItem) => void;
    onCancel: () => void;
}

export default function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const form = useForm<InventoryItem>({
        resolver: zodResolver(inventoryItemSchema),
        defaultValues: item,
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('imageUrl', reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    }

    const onSubmit = (data: InventoryItem) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[60vh] pr-6">
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma categoria" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ITEM_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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
                                        <FormControl><Input type="number" {...field} /></FormControl>
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
                        
                         <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagem do Item</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </FormControl>
                                    {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                                    {field.value && <img src={field.value} alt="Preview" className="mt-2 max-h-32 w-auto object-contain rounded-md" />}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isUploading}>Salvar</Button>
                </div>
            </form>
        </Form>
    );
}
