"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Team {
  id: string;
  name: string;
  location: string; // Changed from 'state' to 'location'
}

export default function CoreValuesTracker() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamLocation, setNewTeamLocation] = useState('');
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
    if (!newTeamName || !newTeamLocation) {
        alert('Por favor, preencha o nome e a localização da equipe.');
        return;
    }
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: newTeamName,
      location: newTeamLocation,
    };
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamLocation('');
  };

  const handleDeleteTeam = (id: string) => {
    setTeams(teams.filter(team => team.id !== id));
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Equipe</CardTitle>
            <CardDescription>Registre as equipes que você conheceu durante a temporada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Nome da Equipe"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Input
                placeholder="Localização (Cidade, Estado)"
                value={newTeamLocation}
                onChange={(e) => setNewTeamLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleAddTeam} className="w-full">
              <PlusCircle className="mr-2" />
              Adicionar Equipe
            </Button>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipes Registradas</CardTitle>
          <CardDescription>Lista de todas as equipes que conhecemos.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {isClient && teams.length > 0 ? (
                <div className="space-y-2">
                    {teams.map(team => (
                        <div key={team.id} className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
                          <div>
                            <p className="font-semibold">{team.name}</p>
                            <p className="text-sm text-muted-foreground">{team.location}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTeam(team.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16">
                  Nenhuma equipe registrada ainda.
                </div>
              )}
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
