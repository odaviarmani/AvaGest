
"use client";

import React from 'react';
import KanbanBoard from "@/components/kanban/KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
       <header className="mb-4 flex justify-end">
      </header>
      <div className="flex-1 overflow-y-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
