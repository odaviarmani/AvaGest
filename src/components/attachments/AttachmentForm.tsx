
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
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface AttachmentFormProps {
    attachment: Attachment | null;
    onSave: (data: Attachment) => void;
    onCancel: () => void;
}

export default function AttachmentForm({ attachment, onSave, onCancel }: AttachmentFormProps) {
    const [isUploading, setIsUploading] = useState<{v1: boolean, v2: boolean}>({ v1: false, v2: false });

    const form = useForm<Attachment>({
        resolver: zodResolver(attachmentSchema),
        defaultValues: attachment || {
            id: crypto.randomUUID(),
            runExit: '',
            category: 'Estratégia 1',
            avgTime: 0,
            swapTime: 0,
            precision: 100,
            version1: {
                name: '',
                missions: '',
                points: 0,
                imageUrl: null,
            },
            version2Enabled: false,
            version2: {
                name: '',
                missions: '',
                points: 0,
                imageUrl: null,
            }
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, version: 'version1' | 'version2') => {
        const file = e.target.files?.[0];
        if (file) {
            const versionKey = version === 'version1' ? 'v1' : 'v2';
            setIsUploading(prev => ({...prev, [versionKey]: true}));
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(`${version}.imageUrl`, reader.result as string, { shouldValidate: true });
                setIsUploading(prev => ({...prev, [versionKey]: false}));
            };
            reader.readAsDataURL(file);
        }
    }
    
    const onSubmit = (data: Attachment) => {
        onSave(data);
    };

    const showVersion2 = form.watch('version2Enabled');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[65vh] pr-6">
                    <div className="space-y-4">
                        
                        {/* Common Fields */}
                        <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                            <h3 className="font-semibold text-lg">Informações Gerais</h3>
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
                        </div>

                        {/* Version 1 */}
                        <div className="space-y-4 p-4 border rounded-lg">
                             <h3 className="font-semibold text-lg">Versão 1</h3>
                            <FormField control={form.control} name="version1.name" render={({ field }) => (
                                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Ex: Garra Dupla" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="version1.missions" render={({ field }) => (
                                <FormItem><FormLabel>Missões</FormLabel><FormControl><Textarea placeholder="Ex: M01, M05 e M13" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="version1.points" render={({ field }) => (
                                <FormItem><FormLabel>Pontos</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormItem><FormLabel>Render</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'version1')} disabled={isUploading.v1} />
                            </FormControl>
                            {isUploading.v1 && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                            {form.watch('version1.imageUrl') && <img src={form.watch('version1.imageUrl')!} alt="Preview V1" className="mt-2 w-32 h-32 object-cover rounded-md" />}
                            <FormMessage /></FormItem>
                        </div>
                        
                        <Separator />

                        {/* Version 2 Toggle */}
                        <FormField
                            control={form.control}
                            name="version2Enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Habilitar Versão 2</FormLabel>
                                    <p className="text-sm text-muted-foreground">Adicione uma versão aprimorada do anexo.</p>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        
                        {/* Version 2 */}
                        {showVersion2 && (
                             <div className="space-y-4 p-4 border rounded-lg animate-in fade-in-50">
                                <h3 className="font-semibold text-lg">Versão 2</h3>
                                <FormField control={form.control} name="version2.name" render={({ field }) => (
                                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome da V2" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="version2.missions" render={({ field }) => (
                                    <FormItem><FormLabel>Missões</FormLabel><FormControl><Textarea placeholder="Missões da V2" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="version2.points" render={({ field }) => (
                                    <FormItem><FormLabel>Pontos</FormLabel><FormControl><Input type="number" {...field} value={field.value || 0} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormItem><FormLabel>Render</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'version2')} disabled={isUploading.v2} />
                                    </FormControl>
                                    {isUploading.v2 && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                                    {form.watch('version2.imageUrl') && <img src={form.watch('version2.imageUrl')!} alt="Preview V2" className="mt-2 w-32 h-32 object-cover rounded-md" />}
                                <FormMessage /></FormItem>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isUploading.v1 || isUploading.v2}>Salvar</Button>
                </div>
            </form>
        </Form>
    );
}
