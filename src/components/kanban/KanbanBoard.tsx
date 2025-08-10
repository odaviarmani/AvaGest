"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskForm from '@/components/kanban/TaskForm';
import { columnNames, Task, ColumnId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const DEFAULT_TASKS: Task[] = [
    { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: 'Programação', priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Fazer' },
    { id: 'task-2', name: 'Criar wireframes da UI', area: 'Core Values', priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Planejamento' },
    { id: 'task-3', name: 'Testar endpoint de login', area: 'Programação', priority: 'Alta', startDate: null, dueDate: null, columnId: 'Fazendo' },
    { id: 'task-4', name: 'Publicar landing page', area: 'Construção', priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito' },
    { id: 'task-5', name: 'Revisar copy do site', area: 'Construção', priority: 'Média', startDate: null, dueDate: null, columnId: 'Fazer' },
    { id: 'task-6', name: 'Implementar autenticação', area: 'Projeto de Inovação', priority: 'Alta', startDate: null, dueDate: null, columnId: 'Planejamento' },
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    const newColumnId = destination.droppableId as ColumnId;
    const updatedTask = { ...task, columnId: newColumnId };

    const newTasks = tasks.filter(t => t.id !== draggableId);
    
    const tasksInDestColumn = tasks.filter(t => t.columnId === newColumnId);
    
    // Remove the dragged task from its original position among all tasks.
    const filteredTasks = tasks.filter(t => t.id !== draggableId);

    // Create a new array representing the order in the destination column
    let destColumnTasks = tasks.filter(t => t.columnId === newColumnId);
    destColumnTasks.splice(destination.index, 0, updatedTask);

    // Get all other tasks
    const otherTasks = filteredTasks.filter(t => t.columnId !== newColumnId);
    
    // Re-order the tasks based on the destination index
    const finalTasks = [...newTasks];
    finalTasks.splice(destination.index, 0, updatedTask);


    setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t => t.id === draggableId ? {...t, columnId: destination.droppableId as ColumnId} : t);

        const activeTask = updatedTasks.find(t => t.id === draggableId)!;
        const overTasks = updatedTasks.filter(t => t.columnId === destination.droppableId && t.id !== draggableId);

        // Remove active task from its current position
        const activeTaskIndex = updatedTasks.findIndex(t => t.id === draggableId);
        updatedTasks.splice(activeTaskIndex, 1);
        
        // Find insert position
        let insertIndex;
        if (overTasks.length === 0) {
            // Find first task of the column
            const firstTaskOfNextColumn = prevTasks.find((t, i) => i > 0 && t.columnId === destination.droppableId);
            insertIndex = firstTaskOfNextColumn ? prevTasks.indexOf(firstTaskOfNextColumn) : prevTasks.length;
        } else {
            const overTask = overTasks[destination.index];
            insertIndex = updatedTasks.findIndex(t => t.id === overTask?.id);
            if(insertIndex === -1) {
              if (destination.index > 0) {
                 const prevTask = overTasks[destination.index -1];
                 insertIndex = updatedTasks.findIndex(t => t.id === prevTask.id) + 1;
              } else {
                 const firstTaskOfColumn = prevTasks.find(t => t.columnId === destination.droppableId);
                 insertIndex = firstTaskOfColumn ? updatedTasks.indexOf(firstTaskOfColumn) : updatedTasks.length;
              }
            }
        }
        
        updatedTasks.splice(insertIndex, 0, activeTask);

        return updatedTasks;
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
    <div className="p-4 flex-1 overflow-x-auto">
        <div className="mb-4">
            <Button onClick={() => handleOpenDialog(null, 'Planejamento')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Tarefa
            </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 items-start">
            {columnNames.map(columnId => {
                const columnTasks = tasks.filter(t => t.columnId === columnId);
                const column = { id: columnId, title: columnId, tasks: columnTasks };
                return (
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
                )
            })}
            </div>
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

    