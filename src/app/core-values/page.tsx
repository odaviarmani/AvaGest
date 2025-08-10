import CoreValuesTracker from "@/components/core-values/CoreValuesTracker";
import { Heart } from "lucide-react";

export default function CoreValuesPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <header className="mb-8 flex items-center gap-4">
        <Heart className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Core Values</h1>
          <p className="text-muted-foreground">
            Acompanhe as equipes que conhecemos e o alcance dos nossos valores pelo Brasil.
          </p>
        </div>
      </header>
      <CoreValuesTracker />
    </div>
  );
}
