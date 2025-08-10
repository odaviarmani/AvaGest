import { Heart } from "lucide-react";

export default function CoreValuesPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex items-center gap-4">
        <Heart className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Core Values</h1>
          <p className="text-muted-foreground">
            Acompanhe e fortaleça os valores da equipe.
          </p>
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[50vh]">
          <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
              Em breve
          </h3>
          <p className="text-sm text-muted-foreground">
              Esta área está em desenvolvimento. Volte em breve!
          </p>
          </div>
      </div>
    </div>
  );
}
