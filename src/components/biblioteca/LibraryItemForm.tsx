"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LibraryItem, libraryItemSchema } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

interface LibraryItemFormProps {
    item: LibraryItem;
    onSave: (data: LibraryItem) => void;
    onCancel: () => void;
}

export default function LibraryItemForm({ item, onSave, onCancel }: LibraryItemFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const form = useForm<LibraryItem>({
        resolver: zodResolver(libraryItemSchema),
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

    const onSubmit = (data: LibraryItem) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[60vh] pr-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl><Input placeholder="Ex: Clean Architecture" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Autor(es)</FormLabel>
                                    <FormControl><Input placeholder="Ex: Robert C. Martin" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link para o material (Opcional)</FormLabel>
                                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Resumo e Anotações (Opcional)</FormLabel>
                                    <FormControl><Textarea placeholder="Escreva aqui os pontos principais, anotações ou um resumo do material..." {...field} rows={5} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagem de Capa (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                        />
                                    </FormControl>
                                    {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                                    {field.value && <img src={field.value} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
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
