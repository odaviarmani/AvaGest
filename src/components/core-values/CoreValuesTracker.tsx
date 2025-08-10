"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, CheckCircle, Circle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BRAZIL_STATES } from '@/lib/brazil-states';
import { Separator } from '../ui/separator';

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

  const statesWithTeams = Object.keys(teamsByState).length;
  const totalStates = Object.keys(BRAZIL_STATES).length;
  const percentageCovered = totalStates > 0 ? (statesWithTeams / totalStates) * 100 : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Alcançe Nacional</CardTitle>
          <CardDescription>Acompanhe o registro de equipes em cada estado do Brasil.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {Object.entries(BRAZIL_STATES)
                .sort((a,b) => a[1].name.localeCompare(b[1].name))
                .map(([uf, { name }]) => {
                const stateTeams = teamsByState[uf] || [];
                const hasTeams = stateTeams.length > 0;
                return (
                  <div key={uf}>
                    <div className="flex items-center gap-3 mb-2">
                      {hasTeams ? (
                          <CheckCircle className="h-5 w-5 text-primary"/>
                      ) : (
                          <Circle className="h-5 w-5 text-muted-foreground"/>
                      )}
                      <span className="font-semibold">{name}</span>
                      {hasTeams && <span className="text-xs font-normal text-muted-foreground">({stateTeams.length} equipe{stateTeams.length > 1 ? 's' : ''})</span>}
                    </div>
                    <div className="pl-8 space-y-2">
                      {hasTeams ? (
                          stateTeams.map(team => (
                              <div key={team.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                              <span>{team.name}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                              </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma equipe registrada neste estado ainda.</p>
                      )}
                    </div>
                     <Separator className="mt-4"/>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
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
                    {statesWithTeams} de {totalStates} estados alcançados.
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
