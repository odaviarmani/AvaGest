
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { robotTestSchema, RobotTest } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { z } from 'zod';
import { Slider } from '../ui/slider';

type TestFormValues = z.infer<typeof robotTestSchema>;

interface TestFormProps {
    onSave: (data: Omit<TestFormValues, 'id' | 'date'>) => void;
    onCancel: () => void;
}

const formSchema = robotTestSchema.omit({ id: true, date: true });

export default function TestForm({ onSave, onCancel }: TestFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            type: 'Robô',
            successPercentage: 80,
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    name="successPercentage"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Porcentagem de Acerto: {field.value}%</FormLabel>
                            <FormControl>
                                <Slider
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    min={0}
                                    max={100}
                                    step={5}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">Salvar Teste</Button>
                </div>
            </form>
        </Form>
    );
}
