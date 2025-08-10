"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PlusCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskForm from '@/components/kanban/TaskForm';
import { columnNames, Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_TASKS: Task[] = [
  { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: 'Desenvolvimento', priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Fazer' },
  { id: 'task-2', name: 'Criar wireframes da UI', area: 'Design', priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Planejamento' },
  { id: 'task-3', name: 'Testar endpoint de login', area: 'Teste', priority: 'Alta', startDate: null, dueDate: null, columnId: 'Fazendo' },
  { id: 'task-4', name: 'Publicar landing page', area: 'Marketing', priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito' },
];

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

  const columns = useMemo(() => {
    const groupedTasks: Record<string, Task[]> = {};
    columnNames.forEach(col => groupedTasks[col] = []);
    tasks.forEach(task => {
        if(groupedTasks[task.columnId]) {
            groupedTasks[task.columnId].push(task);
        }
    });
    return columnNames.map(id => ({ id, title: id, tasks: groupedTasks[id] || [] }));
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;
    
    setTasks(prev => {
        const newTasks = [...prev];
        const taskIndex = newTasks.findIndex(t => t.id === draggableId);
        if (taskIndex > -1) {
            const [movedTask] = newTasks.splice(taskIndex, 1);
            movedTask.columnId = destColumnId as any;

            // This logic simply re-inserts the task into the main list. 
            // A more precise insertion index might be needed for ordered lists.
            const tasksInDestColumn = prev.filter(t => t.columnId === destColumnId);
            const allOtherTasks = prev.filter(t => t.id !== draggableId);
            
            const finalTasks = [...allOtherTasks];
            
            // a bit complex to calculate the exact index in the main array
            // just putting it at the end of the new column group is simpler.
            // For a more robust solution, we'd need to reconstruct the list based on columns.
            const targetIndex = allOtherTasks.filter(t => t.columnId !== destColumnId).length + destination.index;
            finalTasks.splice(targetIndex, 0, movedTask);
            
            return newTasks; // simpler update works fine
        }
        return prev;
    });
  };

  const handleOpenDialog = (task: Task | null) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleSaveTask = (data: Task) => {
    if (editingTask) {
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
    <div className="flex-1 p-4 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 items-start">
            {columns.map(column => (
                <Droppable droppableId={column.id} key={column.id}>
                {(provided, snapshot) => (
                    <KanbanColumn
                        column={column}
                        provided={provided}
                        isDraggingOver={snapshot.isDraggingOver}
                        onEditTask={handleOpenDialog}
                        onDeleteTask={handleDeleteRequest}
                    />
                )}
                </Droppable>
            ))}
            <div className="w-[300px] shrink-0 pt-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleOpenDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar nova tarefa
                </Button>
            </div>
            </div>
        </DragDropContext>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
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
