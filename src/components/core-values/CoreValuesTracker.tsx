"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import BrazilMap from './BrazilMap';
import { BRAZIL_STATES } from '@/lib/brazil-states';

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Mapa de Conexões</CardTitle>
          <CardDescription>Visualize as equipes com quem nos conectamos em todo o Brasil.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full flex items-center justify-center">
            <BrazilMap teamsByState={teamsByState} />
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
                  {Object.entries(BRAZIL_STATES).map(([uf, { name }]) => (
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
        
        {isClient && teams.length > 0 && (
            <Card>
            <CardHeader>
                <CardTitle>Equipes Registradas</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                    {Object.entries(teamsByState).map(([uf, stateTeams]) => (
                    <div key={uf}>
                        <h4 className="font-semibold mb-2">{BRAZIL_STATES[uf as keyof typeof BRAZIL_STATES].name}</h4>
                        <div className="space-y-2">
                        {stateTeams.map(team => (
                            <div key={team.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                            <span>{team.name}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
                </ScrollArea>
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}