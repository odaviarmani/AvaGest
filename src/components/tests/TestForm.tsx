
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { robotTestSchema, RobotTest } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { z } from 'zod';
import { Textarea } from '../ui/textarea';
import { USERS } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

// We define the form schema here, omitting fields that are auto-generated or not part of the form
const formSchema = robotTestSchema.omit({ id: true, date: true });
type TestFormValues = z.infer<typeof formSchema>;


interface TestFormProps {
    onSave: (data: TestFormValues) => void;
    onCancel: () => void;
    existingTest: RobotTest | null;
}

export default function TestForm({ onSave, onCancel, existingTest }: TestFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { username } = useAuth();
    
    const form = useForm<TestFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: existingTest ? {
            ...existingTest,
            date: new Date(existingTest.date), // ensure date is a Date object if it's a string
        } : {
            name: '',
            type: 'Robô',
            attempts: 10,
            successes: 8,
            objective: '',
            imageUrl: null,
            testedBy: username ? [username] : [],
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


    const onSubmit = (data: TestFormValues) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                 <ScrollArea className="h-[65vh] pr-6">
                    <div className="space-y-4">
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
                            render={() => (
                                <FormItem>
                                    <FormLabel>Testado por</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                                    {USERS.map((user) => (
                                        <FormField
                                        key={user}
                                        control={form.control}
                                        name="testedBy"
                                        render={({ field }) => {
                                            return (
                                            <FormItem key={user} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(user)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), user])
                                                        : field.onChange(
                                                            (field.value || []).filter(
                                                            (value) => value !== user
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                {user}
                                                </FormLabel>
                                            </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isUploading}>{existingTest ? 'Salvar Alterações' : 'Salvar Teste'}</Button>
                </div>
            </form>
        </Form>
    );
}
