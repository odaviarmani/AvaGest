
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { robotTestSchema, RobotTest } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { z } from 'zod';
import { Textarea } from '../ui/textarea';
import { USERS } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

type TestFormValues = Omit<RobotTest, 'id' | 'date'>;

const formSchema = z.object({
    name: z.string().min(1, "O nome do teste é obrigatório."),
    type: z.enum(['Robô', 'Anexo', 'Programação']),
    attempts: z.coerce.number().min(1, "Deve haver pelo menos uma tentativa."),
    successes: z.coerce.number().min(0, "O número de acertos não pode ser negativo."),
    objective: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
    testedBy: z.string().min(1, "É obrigatório informar quem realizou o teste."),
}).refine(data => data.successes <= data.attempts, {
    message: "O número de acertos não pode ser maior que o de tentativas.",
    path: ["successes"], 
});


interface TestFormProps {
    onSave: (data: TestFormValues) => void;
    onCancel: () => void;
}

export default function TestForm({ onSave, onCancel }: TestFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { username } = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            type: 'Robô',
            attempts: 10,
            successes: 8,
            objective: '',
            imageUrl: null,
            testedBy: username || '',
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue('imageUrl', reader.result as string, { shouldValidate: true });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    }


    const onSubmit = (data: z.infer<typeof formSchema>) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Teste</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Teste da garra na M05" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objetivo do Teste</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descreva o que este teste visa validar..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Teste</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Robô">Robô</SelectItem>
                                        <SelectItem value="Anexo">Anexo</SelectItem>
                                        <SelectItem value="Programação">Programação</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="testedBy"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Testado por</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o membro" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {USERS.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="attempts"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nº de Tentativas</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="successes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nº de Acertos</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
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
                            <FormLabel>Anexar Imagem (Opcional)</FormLabel>
                            <FormControl>
                                <Input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </FormControl>
                            {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
                            {form.watch('imageUrl') && <img src={form.watch('imageUrl')!} alt="Preview" className="mt-2 max-h-40 w-auto object-cover rounded-md" />}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isUploading}>Salvar Teste</Button>
                </div>
            </form>
        </Form>
    );
}
