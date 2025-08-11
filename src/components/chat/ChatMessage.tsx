
"use client";

import React from 'react';
import { ChatMessage } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

const legoAvatars: Record<string, string> = {
  "Davi": "https://fll-wro.github.io/assets/images/lego_avatars/davi.png",
  "Carol": "https://fll-wro.github.io/assets/images/lego_avatars/carol.png",
  "Lorenzo": "https://fll-wro.github.io/assets/images/lego_avatars/lorenzo.png",
  "Thiago": "https://fll-wro.github.io/assets/images/lego_avatars/thiago.png",
  "Miguel": "https://fll-wro.github.io/assets/images/lego_avatars/miguel.png",
  "Italo": "https://fll-wro.github.io/assets/images/lego_avatars/italo.png",
};


interface ChatMessageItemProps {
    message: ChatMessage;
    currentUser: string | null;
    isDavi: boolean;
    onDelete: () => void;
}

export default function ChatMessageItem({ message, currentUser, isDavi, onDelete }: ChatMessageItemProps) {
    const isCurrentUser = message.username === currentUser;
    const avatarSrc = legoAvatars[message.username];
    const isMentioned = currentUser ? message.message.includes(`@${currentUser}`) : false;

    return (
        <div className={cn("flex items-start gap-3 group", isCurrentUser ? "justify-end" : "justify-start")}>
            {!isCurrentUser && (
                 <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarSrc} alt={message.username} />
                    <AvatarFallback>{message.username.charAt(0)}</AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                "rounded-lg px-4 py-2 max-w-sm relative",
                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-secondary",
                isMentioned && "bg-purple-500/20 ring-2 ring-purple-500"
            )}>
                {!isCurrentUser && <p className="font-bold text-sm mb-1">{message.username}</p>}
                
                <p className="text-base whitespace-pre-wrap break-words">{message.message}</p>

                <p className="text-xs mt-1 opacity-75">
                    {formatDistanceToNow(new Date(message.timestamp), { locale: ptBR, addSuffix: true })}
                </p>
                
                 {isDavi && (
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                            isCurrentUser ? "-left-10" : "-right-10",
                        )}
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4 text-destructive"/>
                     </Button>
                )}
            </div>

            {isCurrentUser && (
                 <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarSrc} alt={message.username} />
                    <AvatarFallback>{message.username.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
