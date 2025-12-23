'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Home, Loader2 } from 'lucide-react';
import { getDashboardStats } from '@/services/property.service';

interface CategorySelectionStepProps {
    selectedCategory: 'residential' | 'commercial' | '';
    onSelectCategory: (category: 'residential' | 'commercial') => void;
    onNext: () => void;
    onBack: () => void;
}

export function CategorySelectionStep({
    selectedCategory,
    onSelectCategory,
    onNext,
    onBack
}: CategorySelectionStepProps) {
    const [counts, setCounts] = useState<{ residential: number; commercial: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await getDashboardStats();
                setCounts({
                    residential: stats.residential?.count || 0,
                    commercial: stats.commercial?.count || 0
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                // Fallback to 0 or keep null
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <h1 className="text-4xl font-bold text-center text-gray-900">Select Category</h1>

            {/* Category Cards */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* Residential Card */}
                <button
                    onClick={() => onSelectCategory('residential')}
                    className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${selectedCategory === 'residential'
                        ? 'border-[#00B7FF] bg-[#E0F2FE]'
                        : 'border-gray-200 bg-white hover:border-[#00B7FF] hover:bg-[#E0F2FE]/30'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon Container */}
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${selectedCategory === 'residential'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                            : 'bg-gradient-to-br from-blue-300 to-blue-400 group-hover:from-blue-400 group-hover:to-blue-500'
                            }`}>
                            <Home className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>

                        {/* Label */}
                        <div className="text-center space-y-2">
                            <h3 className={`text-2xl font-semibold ${selectedCategory === 'residential' ? 'text-[#00B7FF]' : 'text-gray-900'
                                }`}>
                                Residential
                            </h3>
                            <p className="text-sm text-gray-400">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `${counts?.residential || 0} Properties`}
                            </p>
                        </div>
                    </div>
                </button>

                {/* Commercial Card */}
                <button
                    onClick={() => onSelectCategory('commercial')}
                    className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${selectedCategory === 'commercial'
                        ? 'border-[#00B7FF] bg-[#E0F2FE]'
                        : 'border-gray-200 bg-white hover:border-[#00B7FF] hover:bg-[#E0F2FE]/30'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon Container */}
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${selectedCategory === 'commercial'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                            : 'bg-gradient-to-br from-blue-300 to-blue-400 group-hover:from-blue-400 group-hover:to-blue-500'
                            }`}>
                            <Building2 className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>

                        {/* Label */}
                        <div className="text-center space-y-2">
                            <h3 className={`text-2xl font-semibold ${selectedCategory === 'commercial' ? 'text-[#00B7FF]' : 'text-gray-900'
                                }`}>
                                Commercial
                            </h3>
                            <p className="text-sm text-gray-400">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `${counts?.commercial || 0} Properties`}
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between max-w-3xl mx-auto pt-8">
                <button
                    onClick={onBack}
                    className="px-8 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!selectedCategory}
                    className={`px-10 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory
                        ? 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
