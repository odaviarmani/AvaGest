"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskForm from '@/components/kanban/TaskForm';
import { columnNames, Task, ColumnId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_TASKS: Task[] = [
  { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: 'Desenvolvimento', priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Fazer' },
  { id: 'task-2', name: 'Criar wireframes da UI', area: 'Design', priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Planejamento' },
  { id: 'task-3', name: 'Testar endpoint de login', area: 'Teste', priority: 'Alta', startDate: null, dueDate: null, columnId: 'Fazendo' },
  { id: 'task-4', name: 'Publicar landing page', area: 'Marketing', priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito' },
  { id: 'task-5', name: 'Revisar copy do site', area: 'Marketing', priority: 'Média', startDate: null, dueDate: null, columnId: 'Fazer' },
  { id: 'task-6', name: 'Implementar autenticação', area: 'Desenvolvimento', priority: 'Alta', startDate: null, dueDate: null, columnId: 'Planejamento' },
];

type TasksByArea = Record<string, Task[]>;

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks, (key, value) => {
        if (key === 'startDate' || key === 'dueDate') {
          return value ? new Date(value) : null;
        }
        return value;
      }));
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const tasksByArea = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const area = task.area || 'Sem Área';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(task);
      return acc;
    }, {} as TasksByArea);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // droppableId is now "area--columnId"
    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    if (sourceDroppableId === destDroppableId && source.index === destination.index) return;
    
    setTasks(prev => {
        const newTasks = [...prev];
        const taskIndex = newTasks.findIndex(t => t.id === draggableId);

        if (taskIndex > -1) {
            const movedTask = { ...newTasks[taskIndex] };
            const [, destColumnId] = destDroppableId.split('--');
            
            movedTask.columnId = destColumnId as ColumnId;
            
            // Remove task from its original position
            newTasks.splice(taskIndex, 1);
            // Insert it into its new position
            const tasksInDestColumn = newTasks.filter(t => (t.area || 'Sem Área') === movedTask.area && t.columnId === destColumnId);
            
            // This is a simplified reordering logic. For a more precise positioning,
            // we'd need a more complex way to calculate the exact index in the global tasks array.
            // For now, we will add it to the column.
            let targetIndex = newTasks.length;

            if (tasksInDestColumn.length > 0) {
              if (destination.index < tasksInDestColumn.length) {
                const targetTask = tasksInDestColumn[destination.index];
                targetIndex = newTasks.findIndex(t => t.id === targetTask.id);
              } else {
                 const lastTaskInColumn = tasksInDestColumn[tasksInDestColumn.length - 1];
                 targetIndex = newTasks.findIndex(t => t.id === lastTaskInColumn.id) + 1;
              }
            } else {
                // If column is empty, find the area and place it there.
                // This part can get complex. We'll simplify by adding to the end.
            }
            newTasks.splice(targetIndex, 0, movedTask);

            return newTasks;
        }
        return prev;
    });
  };

  const handleOpenDialog = (task: Task | null, columnId?: ColumnId) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask({
        id: crypto.randomUUID(),
        name: '',
        priority: 'Média',
        area: '',
        startDate: null,
        dueDate: null,
        columnId: columnId || 'Planejamento',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleSaveTask = (data: Task) => {
    if (tasks.some(t => t.id === data.id)) {
      setTasks(tasks.map(t => (t.id === data.id ? data : t)));
      toast({ title: "Tarefa atualizada!", description: `A tarefa "${data.name}" foi atualizada com sucesso.` });
    } else {
      setTasks([...tasks, data]);
      toast({ title: "Tarefa criada!", description: `A tarefa "${data.name}" foi adicionada ao planejamento.` });
    }
    handleCloseDialog();
  };
  
  const handleDeleteRequest = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      const taskName = tasks.find(t => t.id === taskToDelete)?.name;
      setTasks(tasks.filter(t => t.id !== taskToDelete));
      toast({ title: "Tarefa removida!", description: `A tarefa "${taskName}" foi removida.`, variant: 'destructive' });
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!isClient) {
    return (
        <div className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-6">
                {columnNames.map(name => (
                    <div key={name} className="w-[300px] shrink-0">
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
        <DragDropContext onDragEnd={onDragEnd}>
            <Accordion type="multiple" defaultValue={Object.keys(tasksByArea)} className="w-full space-y-4">
            {Object.entries(tasksByArea).map(([area, areaTasks]) => (
                <AccordionItem value={area} key={area} className="border rounded-lg bg-card overflow-hidden">
                    <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                        {area}
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <div className="flex gap-6 items-start p-4 overflow-x-auto">
                        {columnNames.map(columnId => {
                            const columnTasks = areaTasks.filter(t => t.columnId === columnId);
                            const column = { id: columnId, title: columnId, tasks: columnTasks };
                            return (
                                <Droppable droppableId={`${area}--${column.id}`} key={`${area}--${column.id}`}>
                                {(provided, snapshot) => (
                                    <KanbanColumn
                                        column={column}
                                        provided={provided}
                                        isDraggingOver={snapshot.isDraggingOver}
                                        onEditTask={handleOpenDialog}
                                        onDeleteTask={handleDeleteRequest}
                                        onAddTask={handleOpenDialog}
                                    />
                                )}
                                </Droppable>
                            )
                        })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
             ))}
            </Accordion>
        </DragDropContext>

        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) handleCloseDialog()}}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingTask && tasks.some(t => t.id === editingTask.id) ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
            </DialogHeader>
            <TaskForm 
                task={editingTask} 
                onSave={handleSaveTask}
                onCancel={handleCloseDialog}
            />
            </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a tarefa.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

    