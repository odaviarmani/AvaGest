
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, USERS, ADMIN_USERS } from '@/contexts/AuthContext';
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
    const isAdmin = username && ADMIN_USERS.includes(username);
    
    // For mentions
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        const lastWord = value.split(" ").pop();
        if (lastWord && lastWord.startsWith('@')) {
            const query = lastWord.substring(1).toLowerCase();
            const filteredUsers = USERS.filter(user => user.toLowerCase().includes(query) && user !== username);
            setSuggestions(filteredUsers);
            setSuggestionIndex(0);
        } else {
            setSuggestions([]);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if(suggestions[suggestionIndex]) {
                    e.preventDefault();
                    handleSuggestionClick(suggestions[suggestionIndex]);
                }
            }
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        const words = newMessage.split(' ');
        words.pop();
        setNewMessage(words.join(' ') + `@${suggestion} `);
        setSuggestions([]);
    }
    
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
                                isAdmin={isAdmin}
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
                 {suggestions.length > 0 && (
                    <div className="mb-2 p-2 border rounded-md bg-secondary max-h-40 overflow-y-auto">
                        <p className="text-sm font-semibold mb-1">Mencionar:</p>
                        <ul className="space-y-1">
                            {suggestions.map((suggestion, index) => (
                                <li 
                                    key={suggestion} 
                                    className={`p-1 rounded-md cursor-pointer text-sm ${index === suggestionIndex ? 'bg-primary text-primary-foreground' : ''}`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (suggestions.length > 0) {
                            handleSuggestionClick(suggestions[suggestionIndex]);
                        } else {
                            handleSendMessage();
                        }
                    }}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem ou @ para mencionar..."
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
