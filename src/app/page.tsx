import KanbanBoard from "@/components/kanban/KanbanBoard";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <header className="p-4 border-b shrink-0">
        <h1 className="text-2xl font-bold text-primary">KanbanFlow</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <KanbanBoard />
      </div>
    </main>
  );
}

    