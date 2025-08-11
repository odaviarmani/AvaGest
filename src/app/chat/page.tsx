
import ChatWindow from "@/components/chat/ChatWindow";
import { MessagesSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col h-full">
      <header className="mb-8 flex items-center gap-4">
        <MessagesSquare className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Chat da Equipe</h1>
          <p className="text-muted-foreground">
            Comunique-se com todos os membros da equipe em tempo real.
          </p>
        </div>
      </header>
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
