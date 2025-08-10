
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { customNotificationSchema, CustomNotification } from '@/lib/types';
import { z } from 'zod';

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const notificationFormSchema = customNotificationSchema.omit({ id: true, date: true });

interface NotificationFormProps {
    onSave: (data: NotificationFormValues) => void;
    onCancel: () => void;
}

export default function NotificationForm({ onSave, onCancel }: NotificationFormProps) {
    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            title: '',
            message: '',
        },
    });

    const onSubmit = (data: NotificationFormValues) => {
        onSave(data);
        form.reset();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Reunião Importante" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mensagem</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descreva a notificação aqui..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">Enviar Notificação</Button>
                </div>
            </form>
        </Form>
    );
}

