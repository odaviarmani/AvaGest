
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
import { USERS } from '@/contexts/AuthContext';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const notificationFormSchema = customNotificationSchema.omit({ id: true, date: true });

interface NotificationFormProps {
    onSave: (data: NotificationFormValues) => void;
    onCancel: () => void;
    existingNotification?: CustomNotification | null;
}

export default function NotificationForm({ onSave, onCancel, existingNotification }: NotificationFormProps) {
    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: existingNotification || {
            title: '',
            message: '',
            targetUsers: [],
        },
    });

    const onSubmit = (data: NotificationFormValues) => {
        onSave(data);
        form.reset();
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
                        <FormField
                            control={form.control}
                            name="targetUsers"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Direcionar para (opcional)</FormLabel>
                                    <p className="text-xs text-muted-foreground">Se ninguém for selecionado, a notificação será para todos.</p>
                                    <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                                    {USERS.map((user) => (
                                        <FormField
                                        key={user}
                                        control={form.control}
                                        name="targetUsers"
                                        render={({ field }) => {
                                            return (
                                            <FormItem
                                                key={user}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
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
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">{existingNotification ? 'Salvar Alterações' : 'Enviar Notificação'}</Button>
                </div>
            </form>
        </Form>
    );
}
