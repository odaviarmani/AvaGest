"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
        <div className="flex flex-col flex-1">
            <header className="p-4 border-b shrink-0 flex items-center justify-between">
                <Skeleton className="h-8 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
                 <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex-1 p-8">
                <Skeleton className="w-full h-full rounded-lg" />
            </main>
        </div>
    );
  }

  return <>{children}</>;
}
