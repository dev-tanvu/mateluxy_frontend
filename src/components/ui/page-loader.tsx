import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageLoader({ className, ...props }: PageLoaderProps) {
    return (
        <div 
            className={cn(
                "flex h-full w-full items-center justify-center min-h-[50vh]",
                className
            )} 
            {...props}
        >
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#00B7FF]" />
                <p className="text-sm font-medium text-gray-400 animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
