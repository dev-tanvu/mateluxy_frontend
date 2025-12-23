'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Plus, Loader2, User, ArrowLeft, ChevronRight } from 'lucide-react';
import { useDevelopers } from '@/lib/hooks/use-developers';

interface DeveloperSelectionStepProps {
    selectedDeveloperId?: string;
    onSelectDeveloper: (developerId: string) => void;
    onAddDeveloper: () => void;
    onNext: () => void;
    onBack: () => void;
}

export function DeveloperSelectionStep({
    selectedDeveloperId,
    onSelectDeveloper,
    onAddDeveloper,
    onNext,
    onBack
}: DeveloperSelectionStepProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: developers, isLoading } = useDevelopers(searchQuery);

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center min-h-[calc(100vh-200px)] w-full max-w-3xl mx-auto px-4">
            <div className="w-full space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4 w-full">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Search for developer"
                            className="pr-10 pl-6 h-14 text-base placeholder:text-gray-400 border-[#EDF1F7] rounded-full bg-transparent focus-visible:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={onAddDeveloper}
                        className="flex items-center gap-2 px-8 h-14 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] rounded-xl font-medium transition-colors whitespace-nowrap"
                    >
                        <Plus className="h-5 w-5" />
                        Add new developer
                    </button>
                </div>

                {/* Developer Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                    {developers?.map((developer) => (
                        <button
                            key={developer.id}
                            onClick={() => onSelectDeveloper(developer.id)}
                            className={`flex items-center gap-6 p-6 rounded-2xl border transition-all group ${selectedDeveloperId === developer.id
                                ? 'border-blue-100 bg-[#F0F9FF]'
                                : 'border-transparent bg-white hover:bg-gray-50'
                                }`}
                        >
                            {/* Logo */}
                            <div className="w-20 h-auto flex-shrink-0 flex items-center justify-center bg-transparent rounded-xl">
                                {developer.logoUrl ? (
                                    <img
                                        src={developer.logoUrl}
                                        alt={developer.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-gray-400" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {developer.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {developer._count?.properties || 0} Properties Listed
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {!developers || developers.length === 0 && (
                    <div className="flex h-64 items-center justify-center text-gray-500">
                        No developers found
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between mt-16 w-full">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-8 py-3 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                </button>

                <button
                    onClick={onNext}
                    disabled={!selectedDeveloperId}
                    className="flex items-center gap-2 px-10 py-3 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E0F2FE]"
                >
                    Next
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
