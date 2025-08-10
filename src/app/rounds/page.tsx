import RoundsChart from '@/components/rounds/RoundsChart';
import RoundsTable from '@/components/rounds/RoundsTable';
import StatsCards from '@/components/rounds/StatsCards';

export default function RoundsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dados e Evoluções de Rounds</h1>
        <p className="text-muted-foreground">
          Análise de performance e detalhes de cada round.
        </p>
      </header>

      <main className="space-y-8">
        <StatsCards />
        <RoundsChart />
        <RoundsTable />
      </main>
    </div>
  );
}
