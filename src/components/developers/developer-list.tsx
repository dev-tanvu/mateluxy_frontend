'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDevelopers } from '@/lib/hooks/use-developers';

interface DeveloperListProps {
    search?: string;
}

import { DeveloperCardSkeleton } from './developer-card-skeleton';

export function DeveloperList({ search }: DeveloperListProps) {
    const { data: developers, isLoading, error } = useDevelopers(search);

    if (isLoading) {
        return (
            <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <DeveloperCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 w-full items-center justify-center text-red-500">
                Failed to load developers
            </div>
        );
    }

    if (!developers || developers.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center text-gray-500">
                No developers found
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {developers.map((developer) => (
                    <Link
                        key={developer.id}
                        href={`/developers/${developer.id}`}
                        className="relative overflow-hidden flex-shrink-0 w-[200px] h-[120px] bg-white rounded-lg border border-gray-200 flex items-center justify-center p-4 cursor-pointer hover:border-blue-500 transition-colors"
                    >
                        {/* Decorative Ellipse */}
                        <div
                            className="absolute top-0 right-10 pointer-events-none"
                            style={{
                                width: '130.89px',
                                height: '72.81px',
                                backgroundColor: '#00BBFF',
                                opacity: 0.08,
                                filter: 'blur(20px)',
                                transform: 'translate(30%, -30%)',
                            }}
                        />

                        {developer.logoUrl ? (
                            <img
                                src={developer.logoUrl}
                                alt={developer.name}
                                className="relative z-10 max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <div className="relative z-10 text-2xl font-bold text-gray-800 uppercase">
                                {developer.name}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
