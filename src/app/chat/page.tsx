
"use client";

import React, { useRef } from 'react';
import html2camera from 'html2canvas';
import ChatWindow from "@/components/chat/ChatWindow";
import { MessagesSquare, Download } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadCroqui = () => {
    if (printRef.current) {
      html2camera(printRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
        onclone: (document) => {
            // Find the scrollable area and scroll to the bottom before taking the screenshot
            const scrollViewport = document.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                scrollViewport.scrollTo(0, scrollViewport.scrollHeight);
            }
        },
        // A small delay to allow the scroll to complete
      }).then(canvas => {
          const link = document.createElement('a');
          link.download = `croqui_chat_${new Date().toISOString()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
      });
    }
  };


  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col h-full">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MessagesSquare className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Chat da Equipe</h1>
            <p className="text-muted-foreground">
              Comunique-se com todos os membros da equipe em tempo real.
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadCroqui} variant="outline">
            <Download className="mr-2" />
            Download Croqui
        </Button>
      </header>
      <div className="flex-1 flex flex-col min-h-0" ref={printRef}>
        <ChatWindow />
      </div>
    </div>
  );
}
