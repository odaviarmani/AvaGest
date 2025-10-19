
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList, Rectangle } from 'recharts';
import { addDays, differenceInDays, format, min, max } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

interface GanttTask extends Task {
    startDay: number;
    duration: number;
    ganttLabel: string;
}

interface ProjectData {
    name: string;
    tasks: GanttTask[];
}

export default function ProjectGanttChart() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedTasks = localStorage.getItem('kanbanTasks');
        if (savedTasks) {
            const parsedTasks: Task[] = JSON.parse(savedTasks, (key, value) => {
                if (key === 'startDate' || key === 'dueDate') {
                    return value ? new Date(value) : null;
                }
                return value;
            });
            setTasks(parsedTasks);
        }
    }, []);

    const { projectData, overallStartDate, maxDay } = useMemo(() => {
        if (!isClient) return { projectData: [], overallStartDate: new Date(), maxDay: 0 };

        const tasksWithProjects = tasks.filter(task => task.project && task.startDate && task.dueDate);
        if(tasksWithProjects.length === 0) return { projectData: [], overallStartDate: new Date(), maxDay: 0 };

        const allDates = tasksWithProjects.flatMap(t => [t.startDate!, t.dueDate!]);
        const overallStartDate = min(allDates);
        const overallEndDate = max(allDates);
        const maxDay = differenceInDays(overallEndDate, overallStartDate) + 2;


        const projects: Record<string, ProjectData> = {};

        tasksWithProjects.forEach(task => {
            if (!projects[task.project!]) {
                projects[task.project!] = { name: task.project!, tasks: [] };
            }
            const startDay = differenceInDays(task.startDate!, overallStartDate);
            const duration = differenceInDays(task.dueDate!, task.startDate!) + 1;
            projects[task.project!].tasks.push({ ...task, startDay, duration, ganttLabel: task.name });
        });

        return { projectData: Object.values(projects), overallStartDate, maxDay };
    }, [tasks, isClient]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload.task as Task;
            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-bold">{data.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(data.startDate!, 'dd/MM/yy')} - {format(data.dueDate!, 'dd/MM/yy')}
                    </p>
                </div>
            );
        }
        return null;
    };
    
    const CustomBar = (props: any) => {
        const { x, y, width, height, payload } = props;
        return (
            <Rectangle
                x={x}
                y={y}
                width={width}
                height={height}
                radius={4}
                fill="hsl(var(--primary))"
            />
        );
    };


    if (!isClient) {
        return <Skeleton className="w-full h-96" />;
    }
    
    if (projectData.length === 0) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[30vh]">
                <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    Nenhum projeto encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                    Adicione um projeto e datas de início/fim às suas tarefas no Kanban para vê-las aqui.
                </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {projectData.map(project => {
                 const chartTasks = project.tasks.map((task, index) => ({
                    name: task.ganttLabel,
                    range: [task.startDay, task.startDay + task.duration],
                    task: task,
                }));

                return (
                    <Card key={project.name} className="shadow-lg">
                        <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent style={{ height: `${project.tasks.length * 50 + 60}px` }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartTasks}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 100, bottom: 20 }}
                                    barCategoryGap={0}
                                    barGap={0}
                                >
                                     <XAxis 
                                        type="number" 
                                        domain={[0, maxDay]}
                                        tickFormatter={(tick) => format(addDays(overallStartDate, tick), 'dd/MM')}
                                        axisLine={false}
                                        tickLine={false}
                                        />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={150}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--secondary))'}}/>
                                    <Bar dataKey="range" shape={<CustomBar />} isAnimationActive={false}>
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
