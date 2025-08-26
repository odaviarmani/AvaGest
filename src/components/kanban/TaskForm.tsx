
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { taskSchema, Task, priorities, statuses, areaNames } from '@/lib/types';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

interface TaskFormProps {
  task: Task | null;
  onSave: (data: Task) => void;
  onCancel: () => void;
}

const dateToTimeInputValue = (date: Date | null | undefined): string => {
    if (!date) return "";
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    return hasTime ? format(date, "HH:mm") : "";
}

const combineDateAndTime = (date: Date | null | undefined, time: string): Date | null => {
    if (!date) return null;
    const newDate = new Date(date);
    if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        newDate.setHours(hours, minutes, 0, 0);
    } else {
        newDate.setHours(0, 0, 0, 0);
    }
    return newDate;
}

const getStatusFromColumnId = (columnId: string) => columnId.split('-')[0];

export default function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const form = useForm<Task>({
    resolver: zodResolver(taskSchema),
    defaultValues: task || {
      id: crypto.randomUUID(),
      name: '',
      priority: 'Média',
      area: [],
      startDate: null,
      dueDate: null,
      columnId: 'Planejamento-1',
    },
  });

  const onSubmit = (data: Task) => {
    onSave(data);
  };

  const currentStatus = getStatusFromColumnId(form.watch('columnId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Tarefa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Desenvolver nova feature" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area"
          render={() => (
            <FormItem>
              <FormLabel>Área(s)</FormLabel>
              <div className="grid grid-cols-2 gap-2">
              {areaNames.map((item) => (
                <FormField
                  key={item}
                  control={form.control}
                  name="area"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item}
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
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="columnId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coluna</FormLabel>
              <Select onValueChange={(value) => field.onChange(`${value}-1`)} defaultValue={currentStatus}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP", { locale: ptBR })
                                    ) : (
                                        <span>Escolha uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={(date) => field.onChange(combineDateAndTime(date, dateToTimeInputValue(field.value)))}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            className="w-[120px]"
                            defaultValue={dateToTimeInputValue(field.value)}
                            onChange={(e) => field.onChange(combineDateAndTime(field.value, e.target.value))}
                        />
                    </div>
                    <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Data de Entrega</FormLabel>
                     <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP", { locale: ptBR })
                                    ) : (
                                        <span>Escolha uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value ?? undefined}
                                    onSelect={(date) => field.onChange(combineDateAndTime(date, dateToTimeInputValue(field.value)))}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            className="w-[120px]"
                            defaultValue={dateToTimeInputValue(field.value)}
                            onChange={(e) => field.onChange(combineDateAndTime(field.value, e.target.value))}
                        />
                    </div>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Form>
  );
}
