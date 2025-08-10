import PairingRoulette from '@/components/roulette/PairingRoulette';
import RouletteCreator from '@/components/roulette/RouletteCreator';
import { Separator } from '@/components/ui/separator';

export default function RoulettePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Roletas de Revezamento</h1>
        <p className="text-muted-foreground">Crie e gerencie suas roletas personalizadas ou use a roleta de duplas.</p>
      </header>
      
      <RouletteCreator />
      
      <Separator className="my-12" />

      <PairingRoulette />

    </div>
  );
}
