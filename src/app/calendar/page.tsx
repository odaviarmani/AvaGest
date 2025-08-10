import TaskCalendar from "@/components/calendar/TaskCalendar";

export default function CalendarPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
       <header className="mb-8">
        <h1 className="text-3xl font-bold">Calendário de Tarefas</h1>
        <p className="text-muted-foreground">
          Visualize as datas de início e entrega das suas tarefas do Kanban.
        </p>
      </header>
      <TaskCalendar />
    </div>
  );
}
