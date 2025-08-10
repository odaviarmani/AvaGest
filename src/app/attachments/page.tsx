export default function AttachmentsPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Anexos</h1>
        <p className="text-muted-foreground">
          Gerencie os anexos e arquivos importantes do projeto aqui.
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Nenhum anexo encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Comece adicionando arquivos para vê-los listados aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
