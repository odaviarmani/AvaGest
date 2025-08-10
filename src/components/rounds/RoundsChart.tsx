"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { round: "Round 1", pontuacao: 1200 },
  { round: "Round 2", pontuacao: 1450 },
  { round: "Round 3", pontuacao: 1300 },
  { round: "Round 4", pontuacao: 1600 },
  { round: "Round 5", pontuacao: 1550 },
  { round: "Round 6", pontuacao: 1800 },
  { round: "Round 7", pontuacao: 1750 },
  { round: "Round 8", pontuacao: 1900 },
  { round: "Round 9", pontuacao: 2050 },
  { round: "Round 10", pontuacao: 1950 },
  { round: "Round 11", pontuacao: 2100 },
  { round: "Round 12", pontuacao: 2150 },
]

const chartConfig = {
  pontuacao: {
    label: "Pontuação",
    color: "hsl(var(--primary))",
  },
}

export default function RoundsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Geral</CardTitle>
        <CardDescription>Pontuação por round</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px]">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="round"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 8)}
            />
             <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
            <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Legend />
            <Bar dataKey="pontuacao" fill="var(--color-pontuacao)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          A pontuação do último round teve um aumento de 2.3% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando a pontuação dos últimos 12 rounds
        </div>
      </CardFooter>
    </Card>
  )
}
