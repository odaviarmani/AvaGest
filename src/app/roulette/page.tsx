import RouletteCreator from '@/components/roulette/RouletteCreator';

export default function RoulettePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Roletas de Revezamento</h1>
        <p className="text-muted-foreground">Crie e gerencie suas roletas personalizadas.</p>
      </header>
      <RouletteCreator />
    </div>
  );
}
