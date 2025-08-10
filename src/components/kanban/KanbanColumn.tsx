"use client";

import React from 'react';
import { DroppableProvided, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Task, ColumnId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  column: {
    id: ColumnId;
    title: string;
    tasks: Task[];
  };
  provided: DroppableProvided;
  isDraggingOver: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function KanbanColumn({ column, provided, isDraggingOver, onEditTask, onDeleteTask }: KanbanColumnProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      className={cn(
        "w-[300px] shrink-0 flex flex-col",
      )}
    >
      <div className="flex items-center justify-between p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-semibold text-foreground">{column.title}</h2>
        <span className="text-sm font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-1">
          {column.tasks.length}
        </span>
      </div>
      <ScrollArea className={cn(
        "flex-1 p-2 rounded-lg transition-colors",
        isDraggingOver ? 'bg-primary/10' : 'bg-secondary/50'
      )}>
        <div className="space-y-4 min-h-[400px]">
          {column.tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                  }}
                >
                  <TaskCard
                    task={task}
                    isDragging={snapshot.isDragging}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      </ScrollArea>
    </div>
  );
}

    