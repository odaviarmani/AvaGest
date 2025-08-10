import { Library } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex items-center gap-4">
        <Library className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Biblioteca</h1>
          <p className="text-muted-foreground">
            Recursos, links e materiais de apoio para a equipe.
          </p>
        </div>
      </header>
       <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Ainda não há nada aqui
            </h3>
            <p className="text-sm text-muted-foreground">
              Comece a adicionar recursos para vê-los listados aqui.
            </p>
          </div>
      </div>
    </div>
  );
}
