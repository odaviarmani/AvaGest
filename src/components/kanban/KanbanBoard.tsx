
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskForm from '@/components/kanban/TaskForm';
import { statuses, Task, areaNames } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const DEFAULT_TASKS: Task[] = [
    { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: ['Programação'], priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Fazer-1' },
    { id: 'task-2', name: 'Criar wireframes da UI', area: ['Core Values'], priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Planejamento-1' },
    { id: 'task-3', name: 'Testar endpoint de login', area: ['Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Fazendo-1' },
    { id: 'task-4', name: 'Publicar landing page', area: ['Construção'], priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito-1' },
    { id: 'task-5', name: 'Revisar copy do site', area: ['Construção'], priority: 'Média', startDate: null, dueDate: null, columnId: 'Fazer-1' },
    { id: 'task-6', name: 'Implementar autenticação', area: ['Projeto de Inovação', 'Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Planejamento-1' },
];

const COLUMN_LIMIT = 6;

// Helper function to extract status from a columnId like "Fazer-1" -> "Fazer"
const getStatusFromColumnId = (columnId: string) => columnId.split('-')[0];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks, (key, value) => {
        if (key === 'startDate' || key === 'dueDate') {
          return value ? new Date(value) : null;
        }
        return value;
      });
      // Ensure old tasks have valid columnId format
      const validatedTasks = parsedTasks.map((task: Task) => ({
          ...task,
          columnId: task.columnId.includes('-') ? task.columnId : `${task.columnId}-1`
      }));
      setTasks(validatedTasks);
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    }
  }, [tasks, isClient]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArea = selectedAreas.length === 0 || task.area.some(a => selectedAreas.includes(a));
        return matchesSearch && matchesArea;
    });
  }, [tasks, searchQuery, selectedAreas]);

  const columns = useMemo(() => {
    const dynamicColumns: { id: string; title: string; tasks: Task[] }[] = [];
    
    statuses.forEach(status => {
      const tasksInStatus = filteredTasks.filter(task => getStatusFromColumnId(task.columnId) === status);
      
      if (tasksInStatus.length === 0) {
        dynamicColumns.push({ id: `${status}-1`, title: status, tasks: [] });
      } else {
        const numColumns = Math.ceil(tasksInStatus.length / COLUMN_LIMIT);
        for (let i = 1; i <= Math.max(1, numColumns); i++) {
          const columnId = `${status}-${i}`;
          const columnTasks = tasksInStatus.filter(task => task.columnId === columnId);
          const title = numColumns > 1 ? `${status} ${i}` : status;
          dynamicColumns.push({ id: columnId, title, tasks: columnTasks });
        }
      }
    });

    return dynamicColumns;
  }, [filteredTasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColumnId = source.droppableId;
    const destColumnId = destination.droppableId;
    
    setTasks(prevTasks => {
        let newTasks = [...prevTasks];
        const movedTaskIndex = newTasks.findIndex(t => t.id === draggableId);
        if (movedTaskIndex === -1) return prevTasks; // Should not happen
        
        const [movedTask] = newTasks.splice(movedTaskIndex, 1);
        
        // Find tasks in the destination column to calculate insert position
        const destTasks = newTasks.filter(t => t.columnId === destColumnId);
        
        // Find the index of the task at the destination drop position
        let insertAtIndex = -1;
        if(destTasks[destination.index]) {
            insertAtIndex = newTasks.findIndex(t => t.id === destTasks[destination.index].id);
        }

        // Insert the task
        if (insertAtIndex !== -1) {
            newTasks.splice(insertAtIndex, 0, movedTask);
        } else {
            newTasks.push(movedTask);
        }

        movedTask.columnId = destColumnId;

        // Re-balance columns
        const sourceStatus = getStatusFromColumnId(sourceColumnId);
        const destStatus = getStatusFromColumnId(destColumnId);

        const rebalancedTasks = rebalanceColumns(newTasks, [sourceStatus, destStatus]);

        return rebalancedTasks;
    });
  };

  const rebalanceColumns = (currentTasks: Task[], statusesToRebalance: string[]): Task[] => {
      let rebalancedTasks = [...currentTasks];
      const uniqueStatuses = [...new Set(statusesToRebalance)];

      uniqueStatuses.forEach(status => {
          const allTasksInStatus = rebalancedTasks
              .filter(t => getStatusFromColumnId(t.columnId) === status)
              .sort((a,b) => rebalancedTasks.indexOf(a) - rebalancedTasks.indexOf(b)); // Keep dnd order

          let taskIndex = 0;
          let columnIndex = 1;

          while(taskIndex < allTasksInStatus.length) {
              const task = allTasksInStatus[taskIndex];
              task.columnId = `${status}-${columnIndex}`;
              if((taskIndex + 1) % COLUMN_LIMIT === 0) {
                  columnIndex++;
              }
              taskIndex++;
          }
      });
      
      return rebalancedTasks;
  };


  const handleOpenDialog = (task: Task | null, columnId?: string) => {
    if (task) {
      setEditingTask(task);
    } else {
       const targetColumnId = columnId || 'Planejamento-1';
       const status = getStatusFromColumnId(targetColumnId);
       const tasksInStatus = tasks.filter(t => getStatusFromColumnId(t.columnId) === status);
       const numColumns = Math.ceil(tasksInStatus.length / COLUMN_LIMIT);
       const targetColIndex = Math.max(1, numColumns);

      setEditingTask({
        id: crypto.randomUUID(),
        name: '',
        priority: 'Média',
        area: [],
        startDate: null,
        dueDate: null,
        columnId: `${status}-${targetColIndex}`,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleSaveTask = (data: Task) => {
    let newTasks;
    const isEditing = tasks.some(t => t.id === data.id);
    
    if (isEditing) {
      newTasks = tasks.map(t => (t.id === data.id ? data : t));
      toast({ title: "Tarefa atualizada!", description: `A tarefa "${data.name}" foi atualizada com sucesso.` });
    } else {
      newTasks = [...tasks, data];
      toast({ title: "Tarefa criada!", description: `A tarefa "${data.name}" foi adicionada.` });
    }
    
    const status = getStatusFromColumnId(data.columnId);
    setTasks(rebalanceColumns(newTasks, [status]));
    handleCloseDialog();
  };
  
  const handleDeleteRequest = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      const taskToDeleteData = tasks.find(t => t.id === taskToDelete);
      const newTasks = tasks.filter(t => t.id !== taskToDelete);
      
      if(taskToDeleteData){
        const status = getStatusFromColumnId(taskToDeleteData.columnId);
        setTasks(rebalanceColumns(newTasks, [status]));
        toast({ title: "Tarefa removida!", description: `A tarefa "${taskToDeleteData.name}" foi removida.`, variant: 'destructive' });
      }

      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!isClient) {
    return (
        <div className="flex-1 p-4 overflow-x-auto">
            <div className="flex gap-6">
                {statuses.map(name => (
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
    <div className="p-4 flex-1 flex flex-col overflow-x-auto">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex gap-2">
                <Button onClick={() => handleOpenDialog(null, 'Planejamento-1')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Tarefa
                </Button>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[250px] max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar tarefas..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="shrink-0">
                            <ListFilter className="mr-2 h-4 w-4" />
                            Filtrar por Área
                            {selectedAreas.length > 0 && <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{selectedAreas.length}</span>}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por Área</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {areaNames.map((area) => (
                             <DropdownMenuCheckboxItem
                                key={area}
                                checked={selectedAreas.includes(area)}
                                onCheckedChange={(checked) => {
                                    if(checked) {
                                        setSelectedAreas(prev => [...prev, area]);
                                    } else {
                                        setSelectedAreas(prev => prev.filter(a => a !== area));
                                    }
                                }}
                            >
                                {area}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 items-start flex-1 overflow-x-auto pb-4">
            {columns.map((column) => {
                return (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        onEditTask={handleOpenDialog}
                        onDeleteTask={handleDeleteRequest}
                    />
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
