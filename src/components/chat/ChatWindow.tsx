
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessageItem from './ChatMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ChatWindow() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { username, isAuthenticated } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isDavi = username === 'Davi';

    useEffect(() => {
        setIsClient(true);
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages, isClient]);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                setTimeout(() => scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' }), 100);
            }
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !isAuthenticated || !username) return;

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            username,
            message: newMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages([...messages, message]);
        setNewMessage('');
    };

    const handleDeleteRequest = (messageId: string) => {
        setMessageToDelete(messageId);
    };

    const handleDeleteConfirm = () => {
        if (messageToDelete) {
            setMessages(messages.filter(msg => msg.id !== messageToDelete));
            setMessageToDelete(null);
        }
    };
    
    return (
        <div className="border rounded-lg flex flex-col flex-1 h-full bg-card">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {isClient && messages.length > 0 ? (
                        messages.map(msg => (
                            <ChatMessageItem
                                key={msg.id}
                                message={msg}
                                currentUser={username}
                                isDavi={isDavi}
                                onDelete={() => handleDeleteRequest(msg.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon">
                        <Send />
                    </Button>
                </form>
            </div>
             <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação é permanente e não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
