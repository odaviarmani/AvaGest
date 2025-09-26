
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
import { PlusCircle, Search, ListFilter, Download, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';

const DEFAULT_TASKS: Task[] = [
    { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: ['Programação'], priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Learning' },
    { id: 'task-2', name: 'Criar wireframes da UI', area: ['Core Values'], priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Learning' },
    { id: 'task-3', name: 'Testar endpoint de login', area: ['Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Action' },
    { id: 'task-4', name: 'Publicar landing page', area: ['Construção'], priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito' },
    { id: 'task-5', name: 'Revisar copy do site', area: ['Construção'], priority: 'Média', startDate: null, dueDate: null, columnId: 'Learning' },
    { id: 'task-6', name: 'Implementar autenticação', area: ['Projeto de Inovação', 'Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Decode' },
];

const progressStatuses = statuses.filter(s => s !== 'Feito');
const doneStatus = 'Feito';


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
      const validatedTasks = parsedTasks.map((task: Task) => {
          let newColumnId = task.columnId;
          const oldStatusMap: Record<string, string> = {
            'Planejamento': 'Learning',
            'Fazer': 'Learning',
            'Fazendo': 'Action',
            'Análise': 'Decode',
            'Aprimoramento': 'Decode',
          };
          if (oldStatusMap[task.columnId]) {
              newColumnId = oldStatusMap[task.columnId];
          } else if (!statuses.includes(task.columnId as any)) {
              newColumnId = 'Learning'; // Default fallback
          }

          return {
              ...task,
              columnId: newColumnId
          };
      });
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
  
  const progressColumns = useMemo(() => {
    return progressStatuses.map(status => ({
        id: status,
        title: status,
        tasks: filteredTasks
            .filter(task => task.columnId === status)
            // Sort tasks to maintain a stable order within columns
            .sort((a, b) => tasks.findIndex(t => t.id === a.id) - tasks.findIndex(t => t.id === b.id)),
    }));
  }, [filteredTasks, tasks]);
  
  const doneColumn = useMemo(() => ({
    id: doneStatus,
    title: doneStatus,
    tasks: filteredTasks.filter(task => task.columnId === doneStatus)
  }), [filteredTasks]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        const movedTask = newTasks.find(t => t.id === draggableId);
        
        if (!movedTask) return prevTasks;

        // Update column
        movedTask.columnId = destination.droppableId;

        // Reorder within the array
        const [reorderedItem] = newTasks.splice(newTasks.indexOf(movedTask), 1);
        const destinationTasks = newTasks.filter(t => t.columnId === destination.droppableId);
        
        let insertAtIndex;
        if(destination.index < destinationTasks.length) {
            const taskAtDestination = destinationTasks[destination.index];
            insertAtIndex = newTasks.indexOf(taskAtDestination);
        } else {
            // Find last task in the destination column to insert after
            if (destinationTasks.length > 0) {
                 const lastTask = destinationTasks[destinationTasks.length - 1];
                 insertAtIndex = newTasks.indexOf(lastTask) + 1;
            } else {
                // If column is empty, we need to decide where to put it.
                // A simple approach is to find the column index and place it after the last task of the previous column.
                const columnIndex = statuses.indexOf(destination.droppableId as any);
                if (columnIndex > 0) {
                    const prevColumnId = statuses[columnIndex - 1];
                    const lastIndexOfPrevColumn = newTasks.map(t => t.columnId).lastIndexOf(prevColumnId);
                    insertAtIndex = lastIndexOfPrevColumn + 1;
                } else {
                    insertAtIndex = 0; // First column
                }
            }
        }
        newTasks.splice(insertAtIndex, 0, reorderedItem);
        return newTasks;
    });
  };

  const handleOpenDialog = (task: Task | null, columnId?: string) => {
    if (task) {
      setEditingTask(task);
    } else {
      setEditingTask({
        id: crypto.randomUUID(),
        name: '',
        priority: 'Média',
        area: [],
        startDate: null,
        dueDate: null,
        columnId: columnId || 'Learning',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleSaveTask = (data: Task) => {
    const isEditing = tasks.some(t => t.id === data.id);
    
    if (isEditing) {
      setTasks(tasks.map(t => (t.id === data.id ? data : t)));
      toast({ title: "Tarefa atualizada!", description: `A tarefa "${data.name}" foi atualizada com sucesso.` });
    } else {
      setTasks([...tasks, data]);
      toast({ title: "Tarefa criada!", description: `A tarefa "${data.name}" foi adicionada.` });
    }
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
      setTasks(newTasks);
      toast({ title: "Tarefa removida!", description: `A tarefa "${taskToDeleteData?.name}" foi removida.`, variant: 'destructive' });
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownloadDoneTasks = () => {
    if (doneColumn.tasks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma tarefa concluída',
        description: 'Não há tarefas na coluna "Feito" para exportar.',
      });
      return;
    }

    const headers = ["Nome da Tarefa", "Área(s)", "Prioridade", "Data de Início", "Data de Entrega"];
    const csvRows = [headers.join(',')];

    doneColumn.tasks.forEach(task => {
      const row = [
        `"${task.name.replace(/"/g, '""')}"`, // Escape double quotes
        `"${task.area.join(', ')}"`,
        task.priority,
        task.startDate ? format(task.startDate, 'yyyy-MM-dd HH:mm') : '',
        task.dueDate ? format(task.dueDate, 'yyyy-MM-dd HH:mm') : ''
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "\uFEFF" + csvRows.join("\n"); // Add BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tarefas_concluidas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado!',
      description: 'Seu arquivo CSV com as tarefas concluídas está sendo baixado.',
    });
  };

  if (!isClient) {
    return (
        <div className="p-4 flex-1 flex flex-col">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {progressStatuses.map(name => (
                    <div key={name}>
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </div>
                ))}
            </div>
             <Separator className="my-8"/>
             <div className="flex-1">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-40 w-full" />
             </div>
        </div>
    );
  }

  return (
    <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex gap-2">
                <Button onClick={() => handleOpenDialog(null, 'Learning')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Tarefa
                </Button>
                 <Button variant="outline" onClick={handleDownloadDoneTasks} disabled={doneColumn.tasks.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Tarefas Feitas
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
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {progressColumns.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        onEditTask={handleOpenDialog}
                        onDeleteTask={handleDeleteRequest}
                    />
                ))}
            </div>
            
             <Separator className="my-6 md:my-8" />
             
             <div className="flex-1">
                 <KanbanColumn
                    column={doneColumn}
                    onEditTask={handleOpenDialog}
                    onDeleteTask={handleDeleteRequest}
                    isDoneColumn={true}
                />
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
