import { Code } from "lucide-react";

export default function DecodePage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex items-center gap-4">
        <Code className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Decode</h1>
          <p className="text-muted-foreground">
            Ferramentas para codificar e decodificar mensagens secretas.
          </p>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Em Construção
          </h3>
          <p className="text-sm text-muted-foreground">
            A funcionalidade de Decode está sendo preparada.
          </p>
        </div>
      </div>
    </div>
  );
}
