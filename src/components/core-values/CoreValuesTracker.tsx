"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BRAZIL_STATES } from '@/lib/brazil-states';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  state: keyof typeof BRAZIL_STATES;
}

export default function CoreValuesTracker() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newState, setNewState] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedTeams = localStorage.getItem('coreValuesTeams');
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('coreValuesTeams', JSON.stringify(teams));
    }
  }, [teams, isClient]);

  const handleAddTeam = () => {
    if (!newTeamName || !newState) {
        alert('Por favor, preencha o nome da equipe e selecione um estado.');
        return;
    }
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: newTeamName,
      state: newState as keyof typeof BRAZIL_STATES,
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewState('');
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(teams.filter(team => team.id !== id));
  };
  
  const teamsByState = useMemo(() => {
    return teams.reduce((acc, team) => {
      if (!acc[team.state]) {
        acc[team.state] = [];
      }
      acc[team.state].push(team);
      return acc;
    }, {} as Record<string, Team[]>);
  }, [teams]);

  const statesWithTeams = Object.keys(teamsByState);
  const totalStates = Object.keys(BRAZIL_STATES).length;
  const percentageCovered = totalStates > 0 ? (statesWithTeams.length / totalStates) * 100 : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Alcançe Nacional</CardTitle>
          <CardDescription>Acompanhe o registro de equipes em cada estado do Brasil.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
                <TooltipProvider>
                    <svg viewBox="0 0 800 800" className="w-full h-auto">
                        <g>
                            {Object.entries(BRAZIL_STATES).map(([uf, { name, path }]) => (
                                <Tooltip key={uf}>
                                    <TooltipTrigger asChild>
                                        <path
                                            d={path}
                                            className={cn(
                                                "stroke-background stroke-2 transition-all duration-300",
                                                statesWithTeams.includes(uf) ? "fill-primary" : "fill-muted"
                                            )}
                                            />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{name} ({teamsByState[uf]?.length || 0} equipes)</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </g>
                    </svg>
                </TooltipProvider>
            </div>
          <div className="w-full md:w-1/2">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {Object.entries(teamsByState)
                  .sort(([ufA], [ufB]) => BRAZIL_STATES[ufA].name.localeCompare(BRAZIL_STATES[ufB].name))
                  .map(([uf, stateTeams]) => (
                  <div key={uf}>
                    <p className="font-semibold">{BRAZIL_STATES[uf as keyof typeof BRAZIL_STATES].name}</p>
                    <div className="pl-4 space-y-1 mt-1">
                      {stateTeams.map(team => (
                          <div key={team.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md text-sm">
                          <span>{team.name}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTeam(team.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                          </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-4xl font-bold text-primary">{percentageCovered.toFixed(1)}%</p>
                <p className="text-muted-foreground">
                    {statesWithTeams.length} de {totalStates} estados alcançados.
                </p>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Equipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Nome da Equipe"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Select value={newState} onValueChange={setNewState}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRAZIL_STATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([uf, { name }]) => (
                    <SelectItem key={uf} value={uf}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddTeam} className="w-full">
              <PlusCircle className="mr-2" />
              Adicionar Equipe
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}