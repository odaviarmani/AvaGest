"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const roundsData = [
  { round: 12, data: "2024-05-18", pontuacao: 2150, duracao: "45min", itensColetados: 28, status: "Concluído" },
  { round: 11, data: "2024-05-17", pontuacao: 2100, duracao: "42min", itensColetados: 26, status: "Concluído" },
  { round: 10, data: "2024-05-16", pontuacao: 1950, duracao: "48min", itensColetados: 25, status: "Concluído" },
  { round: 9, data: "2024-05-15", pontuacao: 2050, duracao: "40min", itensColetados: 27, status: "Concluído" },
  { round: 8, data: "2024-05-14", pontuacao: 1900, duracao: "50min", itensColetados: 24, status: "Concluído" },
  { round: 7, data: "2024-05-13", pontuacao: 1750, duracao: "43min", itensColetados: 22, status: "Concluído" },
  { round: 6, data: "2024-05-12", pontuacao: 1800, duracao: "46min", itensColetados: 23, status: "Concluído" },
  { round: 5, data: "2024-05-11", pontuacao: 1550, duracao: "38min", itensColetados: 20, status: "Concluído" },
  { round: 4, data: "2024-05-10", pontuacao: 1600, duracao: "35min", itensColetados: 18, status: "Concluído" },
  { round: 3, data: "2024-05-09", pontuacao: 1300, duracao: "32min", itensColetados: 15, status: "Concluído" },
  { round: 2, data: "2024-05-08", pontuacao: 1450, duracao: "30min", itensColetados: 17, status: "Concluído" },
  { round: 1, data: "2024-05-07", pontuacao: 1200, duracao: "28min", itensColetados: 14, status: "Concluído" },
];

export default function RoundsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes por Round</CardTitle>
        <CardDescription>
          Informações detalhadas de cada round executado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Round</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Pontuação</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Itens Coletados</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roundsData.map((round) => (
              <TableRow key={round.round}>
                <TableCell className="font-medium">#{round.round}</TableCell>
                <TableCell>{new Date(round.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                <TableCell>{round.pontuacao.toLocaleString('pt-BR')}</TableCell>
                <TableCell>{round.duracao}</TableCell>
                <TableCell>{round.itensColetados}</TableCell>
                <TableCell className="text-right">
                    <Badge 
                        variant="outline"
                        className={cn(round.status === 'Concluído' ? 'text-green-700 border-green-700/50 bg-green-500/10' : 'text-yellow-700 border-yellow-700/50 bg-yellow-500/10')}
                    >
                        {round.status}
                    </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
