
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import html2camera from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp, TrendingDown, ChevronsUp, ChevronsDown, Download, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating, StarRatingJustification } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STORAGE_KEY_RATINGS = 'starRatings';
const STORAGE_KEY_JUSTIFICATIONS = 'starRatingJustifications';

const TEAM_MEMBERS = ["Davi", "Carol", "Lorenzo", "Thiago", "Miguel", "Italo"];

const legoAvatars: Record<string, string> = {
  "Davi": "https://fll-wro.github.io/assets/images/lego_avatars/davi.png",
  "Carol": "https://fll-wro.github.io/assets/images/lego_avatars/carol.png",
  "Lorenzo": "https://fll-wro.github.io/assets/images/lego_avatars/lorenzo.png",
  "Thiago": "https://fll-wro.github.io/assets/images/lego_avatars/thiago.png",
  "Miguel": "https://fll-wro.github.io/assets/images/lego_avatars/miguel.png",
  "Italo": "https://fll-wro.github.io/assets/images/lego_avatars/italo.png",
  "Leandro": "https://fll-wro.github.io/assets/images/lego_avatars/leandro.png",
  "Valquíria": "https://fll-wro.github.io/assets/images/lego_avatars/valquiria.png",
  "Sthefany": "https://fll-wro.github.io/assets/images/lego_avatars/sthefany.png",
  "Avalon": "https://fll-wro.github.io/assets/images/lego_avatars/avalon.png",
};


export default function EstrelinhasPage() {
  const [ratings, setRatings] = useState<StarRating>({});
  const [justifications, setJustifications] = useState<StarRatingJustification>({});
  const [isClient, setIsClient] = useState(false);
  
  const [isJustificationDialogOpen, setIsJustificationDialogOpen] = useState(false);
  const [currentJustification, setCurrentJustification] = useState({ member: '', newRating: 0 });
  const [justificationText, setJustificationText] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJustification, setEditingJustification] = useState<{ member: string, id: string, reason: string } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [justificationToDelete, setJustificationToDelete] = useState<{member: string, id: string} | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedRatings = localStorage.getItem(STORAGE_KEY_RATINGS);
    const savedJustifications = localStorage.getItem(STORAGE_KEY_JUSTIFICATIONS);
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
    if (savedJustifications) {
      setJustifications(JSON.parse(savedJustifications));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY_RATINGS, JSON.stringify(ratings));
      localStorage.setItem(STORAGE_KEY_JUSTIFICATIONS, JSON.stringify(justifications));
    }
  }, [ratings, justifications, isClient]);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `croqui_estrelinhas_${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handleRatingChange = (member: string, newRating: number) => {
    setCurrentJustification({ member, newRating });
    setIsJustificationDialogOpen(true);
  };

  const handleJustificationSubmit = () => {
    if (justificationText.trim() === '') {
      toast({ variant: 'destructive', title: 'Justificativa obrigatória', description: 'Por favor, descreva o motivo da alteração.' });
      return;
    }

    const { member, newRating } = currentJustification;
    
    setRatings(prev => ({ ...prev, [member]: newRating }));
    
    setJustifications(prev => {
      const memberJustifications = prev[member] || [];
      return {
        ...prev,
        [member]: [
          ...memberJustifications,
          {
            id: crypto.randomUUID(),
            rating: newRating,
            reason: justificationText,
            date: new Date().toISOString()
          }
        ]
      }
    });

    toast({ title: 'Avaliação registrada!', description: `A pontuação de ${member} foi atualizada.` });
    setJustificationText('');
    setIsJustificationDialogOpen(false);
  };

  const handleEditRequest = (member: string, id: string, reason: string) => {
    setEditingJustification({ member, id, reason });
    setJustificationText(reason);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
      if (!editingJustification) return;

      const { member, id } = editingJustification;

      setJustifications(prev => ({
          ...prev,
          [member]: prev[member].map(j => j.id === id ? { ...j, reason: justificationText } : j)
      }));

      toast({ title: 'Justificativa atualizada!'});
      setJustificationText('');
      setIsEditDialogOpen(false);
      setEditingJustification(null);
  };

  const handleDeleteRequest = (member: string, id: string) => {
      setJustificationToDelete({ member, id });
      setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
      if (!justificationToDelete) return;
      const { member, id } = justificationToDelete;

      setJustifications(prev => ({
          ...prev,
          [member]: prev[member].filter(j => j.id !== id)
      }));

      toast({ title: 'Justificativa removida!', variant: 'destructive' });
      setJustificationToDelete(null);
      setIsDeleteDialogOpen(false);
  };

  const analysis = useMemo(() => {
    const sortedMembers = TEAM_MEMBERS.map(user => ({ name: user, score: ratings[user] || 0 }))
      .sort((a, b) => b.score - a.score);

    if (sortedMembers.length === 0) return [];
    
    const observations = [];
    const leader = sortedMembers[0];
    const last = sortedMembers[sortedMembers.length - 1];

    if (leader.score > 0) {
      observations.push({ icon: <ChevronsUp className="text-green-500"/>, text: `${leader.name} está na frente com ${leader.score} estrelas.` });
    }
     if (last.score < leader.score) {
      observations.push({ icon: <ChevronsDown className="text-red-500"/>, text: `${last.name} está mais atrás com ${last.score} estrelas.` });
    }

    TEAM_MEMBERS.forEach(user => {
      const userJustifications = justifications[user] || [];
      if (userJustifications.length >= 2) {
        const lastTwo = userJustifications.slice(-2);
        const lastRating = lastTwo[1].rating;
        const prevRating = lastTwo[0].rating;
        if (lastRating > prevRating) {
          observations.push({ icon: <TrendingUp className="text-blue-500"/>, text: `${user} está evoluindo muito.` });
        } else if (lastRating < prevRating) {
          observations.push({ icon: <TrendingDown className="text-orange-500"/>, text: `${user} está regredindo.` });
        }
      }
    });

    return observations;

  }, [ratings, justifications]);

  if (!isClient) return null;

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
              <Star className="w-8 h-8 text-primary" />
              <div>
                  <h1 className="text-3xl font-bold">Estrelinhas de Avaliação</h1>
                  <p className="text-muted-foreground">
                    Avalie e acompanhe o desempenho de cada membro da equipe.
                  </p>
              </div>
          </div>
          <Button onClick={handleDownloadCroqui} variant="outline">
              <Download className="mr-2" />
              Download Croqui
          </Button>
      </header>

      <div ref={printRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {TEAM_MEMBERS.map(member => (
            <Card key={member}>
              <CardHeader className="flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={legoAvatars[member]} />
                    <AvatarFallback>{member.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle>{member}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-7 h-7 cursor-pointer transition-colors",
                        i < (ratings[member] || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/50"
                      )}
                      onClick={() => handleRatingChange(member, i + 1)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Insights sobre o desempenho da equipe.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.length > 0 ? (
                <ul className="space-y-3">
                  {analysis.map((obs, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {obs.icon}
                      <span>{obs.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma observação ainda. Comece a avaliar!</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Últimas Justificativas</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                        {Object.entries(justifications)
                            .flatMap(([member, justs]) => justs.map(j => ({...j, member})))
                            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 15)
                            .map(just => (
                                <div key={just.id} className="text-sm p-2 bg-secondary/50 rounded-lg relative group">
                                    <p>
                                        <span className="font-semibold">{just.member}</span> recebeu <span className="font-semibold">{just.rating}</span> estrelas.
                                    </p>
                                    <p className="text-muted-foreground italic">"{just.reason}"</p>
                                    <p className="text-xs text-right text-muted-foreground mt-1">
                                        {format(new Date(just.date), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditRequest(just.member, just.id, just.reason)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteRequest(just.member, just.id)} className="text-red-500 focus:text-red-500">
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

       <Dialog open={isJustificationDialogOpen} onOpenChange={(open) => { if (!open) setJustificationText(''); setIsJustificationDialogOpen(open); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Justificar Alteração de Estrelas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>
                    Você está alterando a pontuação de <span className="font-bold">{currentJustification.member}</span> para <span className="font-bold">{currentJustification.newRating}</span> estrelas.
                </p>
                <Textarea 
                    placeholder="Digite o motivo da alteração aqui..." 
                    value={justificationText}
                    onChange={e => setJustificationText(e.target.value)}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsJustificationDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleJustificationSubmit}>Salvar Justificativa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) { setJustificationText(''); setEditingJustification(null); } setIsEditDialogOpen(open); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Justificativa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <p>
                    Editando a justificativa para a avaliação de <span className="font-bold">{editingJustification?.member}</span>.
                </p>
                <Textarea 
                    placeholder="Digite o novo motivo aqui..." 
                    value={justificationText}
                    onChange={e => setJustificationText(e.target.value)}
                    rows={4}
                />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleEditSubmit}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir justificativa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A justificativa será removida permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
