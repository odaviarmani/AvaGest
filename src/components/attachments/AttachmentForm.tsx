
"use client";

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Attachment, attachmentSchema } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

interface AttachmentFormProps {
    attachment: Attachment | null;
    onSave: (data: Attachment) => void;
    onCancel: () => void;
}

const VersionFields = ({ control, version, isUploading, onImageUpload }: { control: any, version: "version1" | "version2", isUploading: boolean, onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, version: "version1" | "version2") => void }) => {
    const imageUrl = useWatch({ control, name: `${version}.imageUrl`});
    return (
        <div className="space-y-4">
            <FormField control={control} name={`${version}.name`} render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Garra Dupla" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={control} name={`${version}.missions`} render={({ field }) => (
                <FormItem><FormLabel>Missões</FormLabel><FormControl><Textarea placeholder="Ex: M01, M05 e M13" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={control} name={`${version}.points`} render={({ field }) => (
                <FormItem><FormLabel>Pontos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormItem><FormLabel>Render</FormLabel>
            <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => onImageUpload(e, version)} disabled={isUploading} />
            </FormControl>
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-full h-auto object-cover rounded-md" />}
            <FormMessage />
            </FormItem>
        </div>
    )
}

export default function AttachmentForm({ attachment, onSave, onCancel }: AttachmentFormProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<Attachment>({
        resolver: zodResolver(attachmentSchema),
        defaultValues: attachment || {
            id: crypto.randomUUID(),
            runExit: '',
            category: 'Estratégia 1',
            avgTime: 0,
            swapTime: 0,
            precision: 100,
            version1: { name: '', missions: '', points: 0, imageUrl: null },
            version2Enabled: false,
            version2: { name: '', missions: '', points: 0, imageUrl: null },
        },
    });

    const version2Enabled = useWatch({ control: form.control, name: 'version2Enabled' });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, version: "version1" | "version2") => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(`${version}.imageUrl`, reader.result as string, { shouldValidate: true });
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
                 <ScrollArea className="h-[70vh] pr-6">
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-primary">Informações Gerais</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="runExit" render={({ field }) => (
                                <FormItem><FormLabel>Saída</FormLabel><FormControl><Input placeholder="Ex: Saída 1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem><FormLabel>Categoria</FormLabel><FormControl><Input placeholder="Ex: Estratégia 1" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="precision" render={({ field }) => (
                                <FormItem><FormLabel>Precisão (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="avgTime" render={({ field }) => (
                                <FormItem><FormLabel>Tempo Médio (s)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="swapTime" render={({ field }) => (
                                <FormItem><FormLabel>Tempo Troca (s)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>

                        <Separator className="my-6" />
                        <h3 className="text-lg font-semibold text-primary">Versão 1</h3>
                        <VersionFields control={form.control} version="version1" isUploading={isUploading} onImageUpload={handleImageUpload} />
                        
                        <Separator className="my-6" />

                        <FormField
                            control={form.control}
                            name="version2Enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Habilitar Versão 2</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {version2Enabled && (
                            <div className="mt-4 space-y-4 animate-in fade-in-50">
                                <h3 className="text-lg font-semibold text-primary">Versão 2</h3>
                                <VersionFields control={form.control} version="version2" isUploading={isUploading} onImageUpload={handleImageUpload} />
                            </div>
                        )}
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
