import { BookCheck } from "lucide-react";

export default function RubricasPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Rubricas de Avaliação</h1>
        <p className="text-muted-foreground">
          Consulte as rubricas oficiais da temporada.
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
          <div className="flex flex-col items-center gap-2 text-center">
          <BookCheck className="w-16 h-16 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">
              Seção de Rubricas em Construção
          </h3>
          <p className="text-sm text-muted-foreground">
              Esta área será utilizada para exibir as rubricas de avaliação.
          </p>
          </div>
      </div>
    </div>
  );
}
