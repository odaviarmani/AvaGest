
"use client";

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    tasks: Task[];
  };
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isDoneColumn?: boolean;
}

export default function KanbanColumn({ column, onEditTask, onDeleteTask, isDoneColumn = false }: KanbanColumnProps) {

  return (
    <div className={cn(
        "flex flex-col h-full",
        isDoneColumn ? "w-full" : ""
    )}>
      <div className="flex items-center justify-between p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold text-foreground">{column.title}</h2>
        <span className="text-sm font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-1">
          {column.tasks.length}
        </span>
      </div>
      <Droppable droppableId={column.id} key={column.id} direction={isDoneColumn ? 'horizontal' : 'vertical'}>
        {(provided, snapshot) => (
           <div
             ref={provided.innerRef}
             {...provided.droppableProps}
             className={cn(
                "transition-colors rounded-lg",
                snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-secondary/50',
                isDoneColumn ? 'p-2' : 'p-1'
             )}
          >
             <div className={cn(
                 "min-h-[100px]",
                 isDoneColumn 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" 
                    : "space-y-4"
             )}>
              {column.tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ ...provided.draggableProps.style }}
                    >
                      <TaskCard
                        task={task}
                        isDragging={snapshot.isDragging}
                        onEdit={() => onEditTask(task)}
                        onDelete={() => onDeleteTask(task.id)}
                        isCompact={isDoneColumn}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
