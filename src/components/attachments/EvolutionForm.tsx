
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Attachment, EvolutionEntry, evolutionEntrySchema } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { z } from 'zod';

const formSchema = evolutionEntrySchema.omit({ id: true, date: true });
type EvolutionFormValues = z.infer<typeof formSchema>;

interface EvolutionFormProps {
    baseAttachment: Attachment;
    onSave: (attachmentToUpdate: Attachment, data: EvolutionFormValues) => void;
    onCancel: () => void;
}

export default function EvolutionForm({ baseAttachment, onSave, onCancel }: EvolutionFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<EvolutionFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: baseAttachment.name,
            missions: baseAttachment.missions,
            points: baseAttachment.points,
            avgTime: baseAttachment.avgTime,
            swapTime: baseAttachment.swapTime,
            precision: baseAttachment.precision,
            imageUrl: baseAttachment.imageUrl,
            notes: '',
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
    
    const onSubmit = (data: EvolutionFormValues) => {
        onSave(baseAttachment, data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[70vh] pr-6">
                    <div className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome do Anexo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="missions" render={({ field }) => (
                            <FormItem><FormLabel>Missões</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
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
                        <FormItem>
                           <FormLabel>Render da Evolução</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                            </FormControl>
                            {form.watch('imageUrl') && <img src={form.watch('imageUrl')!} alt="Preview" className="mt-2 w-full h-auto object-cover rounded-md" />}
                            <FormMessage />
                        </FormItem>
                         <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem><FormLabel>Notas da Evolução (Opcional)</FormLabel><FormControl><Textarea placeholder="Descreva as mudanças feitas..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isUploading}>Salvar Evolução</Button>
                </div>
            </form>
        </Form>
    );
}
