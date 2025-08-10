import RoundsTimer from "@/components/rounds/RoundsTimer";
import ScoreCalculator from "@/components/rounds/ScoreCalculator";

export default function RoundsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Rounds</h1>
        <p className="text-muted-foreground">
          Acompanhe os dados e a evolução dos rounds.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <RoundsTimer />
        </div>
        <div className="md:col-span-1">
          <ScoreCalculator />
        </div>
        <div className="md:col-span-1">
          {/* Conteúdo da terceira coluna */}
        </div>
      </div>
    </div>
  );
}
