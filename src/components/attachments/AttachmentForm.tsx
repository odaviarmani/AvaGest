
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
    attachment: Attachment;
    onSave: (data: Attachment) => void;
    onCancel: () => void;
}

const AttachmentVersionFields = ({ versionNumber, control, setValue, isUploading }: any) => {
    const prefix = `version${versionNumber}`;
    const versionLabel = `Versão ${versionNumber}`;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(`${prefix}.imageUrl`, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }


    return (
        <div className="space-y-4 p-4 border rounded-lg">
             <h3 className="text-lg font-semibold">{versionLabel}</h3>
             <FormField
                control={control}
                name={`${prefix}.name`}
                render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>Nome do Anexo ({versionLabel})</FormLabel>
                        <FormControl><Input placeholder="Ex: Garra Dupla V1" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${prefix}.missions`}
                render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>Quais missões realiza?</FormLabel>
                        <FormControl><Textarea placeholder="Ex: M01, M05 e M13" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name={`${prefix}.points`}
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Pontos</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`${prefix}.precision`}
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Taxa de Precisão (%)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name={`${prefix}.avgTime`}
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Tempo Médio (s)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`${prefix}.swapTime`}
                    render={({ field }: any) => (
                        <FormItem>
                            <FormLabel>Tempo de Troca (s)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={control}
                name={`${prefix}.imageUrl`}
                render={({ field }: any) => (
                    <FormItem>
                        <FormLabel>Render do Anexo (PNG)</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
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
    )
}

export default function AttachmentForm({ attachment, onSave, onCancel }: AttachmentFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [showVersion2, setShowVersion2] = useState(!!attachment.version2);

    const form = useForm<Attachment>({
        resolver: zodResolver(attachmentSchema),
        defaultValues: attachment,
    });
    
    const onSubmit = (data: Attachment) => {
        if (!showVersion2) {
            delete data.version2;
        }
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[65vh] pr-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria / Pasta</FormLabel>
                                    <FormControl><Input placeholder="Ex: Estratégia 1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="runExit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>De qual saída?</FormLabel>
                                    <FormControl><Input placeholder="Ex: Saída 1" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator />
                        
                        <AttachmentVersionFields
                            versionNumber={1}
                            control={form.control}
                            setValue={form.setValue}
                            isUploading={isUploading}
                        />

                        <div className="flex items-center space-x-2 pt-4">
                            <Switch
                                id="add-version-2"
                                checked={showVersion2}
                                onCheckedChange={(checked) => {
                                    setShowVersion2(checked)
                                    if(checked && !form.getValues('version2')) {
                                        form.setValue('version2', {
                                            name: `${form.getValues('version1.name')} V2`,
                                            missions: form.getValues('version1.missions'),
                                            points: form.getValues('version1.points'),
                                            avgTime: 0,
                                            swapTime: 0,
                                            precision: 100,
                                            imageUrl: null,
                                        })
                                    }
                                }}
                            />
                            <Label htmlFor="add-version-2">Adicionar Versão 2</Label>
                        </div>
                        
                        {showVersion2 && (
                            <AttachmentVersionFields
                                versionNumber={2}
                                control={form.control}
                                setValue={form.setValue}
                                isUploading={isUploading}
                            />
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
