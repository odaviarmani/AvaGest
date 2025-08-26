
import { NotepadText } from "lucide-react";
import AnalysisTable from "@/components/mission-analysis/AnalysisTable";

export default function MissionAnalysisPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
       <header className="mb-8 flex items-center gap-4">
        <NotepadText className="w-8 h-8 text-primary" />
        <div>
            <h1 className="text-3xl font-bold">Visão Geral e Análise de Missões</h1>
            <p className="text-muted-foreground">
            Tabela interativa para analisar e priorizar as missões da temporada.
            </p>
        </div>
      </header>
      <AnalysisTable />
    </div>
  );
}
