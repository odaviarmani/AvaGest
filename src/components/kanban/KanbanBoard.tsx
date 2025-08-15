
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import TaskForm from '@/components/kanban/TaskForm';
import { columnNames, Task, ColumnId, areaNames } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const DEFAULT_TASKS: Task[] = [
    { id: 'task-1', name: 'Configurar ambiente de desenvolvimento', area: ['Programação'], priority: 'Alta', startDate: new Date(), dueDate: null, columnId: 'Fazer' },
    { id: 'task-2', name: 'Criar wireframes da UI', area: ['Core Values'], priority: 'Média', startDate: new Date(), dueDate: null, columnId: 'Planejamento' },
    { id: 'task-3', name: 'Testar endpoint de login', area: ['Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Fazendo' },
    { id: 'task-4', name: 'Publicar landing page', area: ['Construção'], priority: 'Baixa', startDate: null, dueDate: null, columnId: 'Feito' },
    { id: 'task-5', name: 'Revisar copy do site', area: ['Construção'], priority: 'Média', startDate: null, dueDate: null, columnId: 'Fazer' },
    { id: 'task-6', name: 'Implementar autenticação', area: ['Projeto de Inovação', 'Programação'], priority: 'Alta', startDate: null, dueDate: null, columnId: 'Planejamento' },
];

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
    
    setTasks(prevTasks => {
        const newTasks = Array.from(prevTasks);
        const movedTask = newTasks.find(t => t.id === draggableId)!;
        movedTask.columnId = destination.droppableId as ColumnId;

        // Simplified reordering logic. This might not be perfect for complex DnD,
        // but it's more reliable than the previous implementation.
        const [reorderedItem] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, reorderedItem);

        // A more robust solution might require re-calculating the order based on column.
        return newTasks.map(t => t.id === draggableId ? movedTask : t);
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
        area: [],
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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesArea = selectedAreas.length === 0 || task.area.some(a => selectedAreas.includes(a));
        return matchesSearch && matchesArea;
    });
  }, [tasks, searchQuery, selectedAreas]);

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
    <div className="p-4 flex-1 flex flex-col overflow-x-auto">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex gap-2">
                <Button onClick={() => handleOpenDialog(null, 'Planejamento')}>
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
            {columnNames.map(columnId => {
                const columnTasks = filteredTasks.filter(t => t.columnId === columnId);
                const column = { id: columnId, title: columnId, tasks: columnTasks };
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
