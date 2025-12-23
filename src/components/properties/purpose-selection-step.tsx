'use client';

import React, { useEffect, useState } from 'react';
import { Home, Loader2 } from 'lucide-react';
import { getDashboardStats } from '@/services/property.service';

interface PurposeSelectionStepProps {
    selectedPurpose: 'sell' | 'rent' | '';
    onSelectPurpose: (purpose: 'sell' | 'rent') => void;
    onNext: () => void;
    onBack: () => void;
}

export function PurposeSelectionStep({
    selectedPurpose,
    onSelectPurpose,
    onNext,
    onBack
}: PurposeSelectionStepProps) {
    const [counts, setCounts] = useState<{ sell: number; rent: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await getDashboardStats();
                setCounts({
                    sell: stats.buy?.count || 0,
                    rent: stats.rent?.count || 0
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-12">
            {/* Header */}
            <h1 className="text-4xl font-bold text-center text-gray-900">Select Purpose</h1>

            {/* Purpose Cards */}
            <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* For Sale Card */}
                <button
                    onClick={() => onSelectPurpose('sell')}
                    className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${selectedPurpose === 'sell'
                        ? 'border-[#00B7FF] bg-[#E0F2FE]'
                        : 'border-gray-200 bg-white hover:border-[#00B7FF] hover:bg-[#E0F2FE]/30'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon Container with SELL Badge */}
                        <div className="relative">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${selectedPurpose === 'sell'
                                ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                                : 'bg-gradient-to-br from-blue-300 to-blue-400 group-hover:from-blue-400 group-hover:to-blue-500'
                                }`}>
                                <Home className="w-16 h-16 text-white" strokeWidth={1.5} />
                            </div>
                            {/* SELL Badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                SELL
                            </div>
                        </div>

                        {/* Label */}
                        <div className="text-center space-y-2 pt-4">
                            <h3 className={`text-2xl font-semibold ${selectedPurpose === 'sell' ? 'text-[#00B7FF]' : 'text-gray-900'
                                }`}>
                                For Sale
                            </h3>
                            <p className="text-sm text-gray-400">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `${counts?.sell || 0} Properties`}
                            </p>
                        </div>
                    </div>
                </button>

                {/* For Rent Card */}
                <button
                    onClick={() => onSelectPurpose('rent')}
                    className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${selectedPurpose === 'rent'
                        ? 'border-[#00B7FF] bg-[#E0F2FE]'
                        : 'border-gray-200 bg-white hover:border-[#00B7FF] hover:bg-[#E0F2FE]/30'
                        }`}
                >
                    <div className="flex flex-col items-center space-y-6">
                        {/* Icon Container with RENT Badge */}
                        <div className="relative">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${selectedPurpose === 'rent'
                                ? 'bg-gradient-to-br from-blue-400 to-blue-500'
                                : 'bg-gradient-to-br from-blue-300 to-blue-400 group-hover:from-blue-400 group-hover:to-blue-500'
                                }`}>
                                <Home className="w-16 h-16 text-white" strokeWidth={1.5} />
                            </div>
                            {/* RENT Badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                                RENT
                            </div>
                        </div>

                        {/* Label */}
                        <div className="text-center space-y-2 pt-4">
                            <h3 className={`text-2xl font-semibold ${selectedPurpose === 'rent' ? 'text-[#00B7FF]' : 'text-gray-900'
                                }`}>
                                For Rent
                            </h3>
                            <p className="text-sm text-gray-400">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `${counts?.rent || 0} Properties`}
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
                    disabled={!selectedPurpose}
                    className={`px-10 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedPurpose
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
