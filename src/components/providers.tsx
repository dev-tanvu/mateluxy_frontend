'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Keep data fresh for 5 minutes before refetching
                staleTime: 5 * 60 * 1000, // 5 minutes
                // Keep unused data in cache for 10 minutes
                gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
                // Retry failed requests 2 times
                retry: 2,
                // Refetch on window focus for real-time updates
                refetchOnWindowFocus: true,
                // Don't refetch on component mount if data is fresh
                refetchOnMount: false,
            },
            mutations: {
                // Retry failed mutations once
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="bottom-right" richColors />
        </QueryClientProvider>
    );
}

