
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Attachment, attachmentSchema } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

interface AttachmentFormProps {
    attachment: Attachment | null;
    onSave: (data: Attachment) => void;
    onCancel: () => void;
}

export default function AttachmentForm({ attachment, onSave, onCancel }: AttachmentFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<Attachment>({
        resolver: zodResolver(attachmentSchema),
        defaultValues: attachment || {
            id: crypto.randomUUID(),
            runExit: '',
            category: 'Estratégia 1',
            name: '',
            missions: '',
            points: 0,
            imageUrl: null,
            avgTime: 0,
            swapTime: 0,
            precision: 100,
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(`imageUrl`, reader.result as string, { shouldValidate: true });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    }
    
    const onSubmit = (data: Attachment) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[65vh] pr-6">
                    <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome do Anexo</FormLabel><FormControl><Input placeholder="Ex: Garra Dupla" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <FormField control={form.control} name="missions" render={({ field }) => (
                            <FormItem><FormLabel>Missões</FormLabel><FormControl><Textarea placeholder="Ex: M01, M05 e M13" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="runExit" render={({ field }) => (
                                <FormItem><FormLabel>Saída</FormLabel><FormControl><Input placeholder="Ex: Saída 1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Estratégia 1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="points" render={({ field }) => (
                                <FormItem><FormLabel>Pontos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="precision" render={({ field }) => (
                                <FormItem><FormLabel>Precisão (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="avgTime" render={({ field }) => (
                                <FormItem><FormLabel>Tempo Médio (s)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="swapTime" render={({ field }) => (
                                <FormItem><FormLabel>Tempo Troca (s)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        
                        <FormItem><FormLabel>Render</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </FormControl>
                        {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                        {form.watch('imageUrl') && <img src={form.watch('imageUrl')!} alt="Preview" className="mt-2 w-full h-auto object-cover rounded-md" />}
                        <FormMessage /></FormItem>
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
