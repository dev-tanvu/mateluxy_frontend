
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPasswords, getPasswordDetails, deletePassword, PasswordDetails } from '@/services/password.service';
import { Lock, Eye, EyeOff, Copy, Trash2, Loader2, Key, Info, Pencil, Search } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordListProps {
    onEdit?: (details: PasswordDetails) => void;
    searchTerm: string;
    maxItems?: number;
    viewAllHref?: string;
}

export function PasswordList({ onEdit, searchTerm, maxItems, viewAllHref }: PasswordListProps) {
    const queryClient = useQueryClient();

    const { data: passwords = [], isLoading } = useQuery({
        queryKey: ['passwords'],
        queryFn: getPasswords,
    });

    // State to track visibility of individual passwords by ID
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const deleteMutation = useMutation({
        mutationFn: deletePassword,
        onSuccess: () => {
            toast.success('Password deleted');
            queryClient.invalidateQueries({ queryKey: ['passwords'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const filteredPasswords = passwords.filter(pw =>
        pw.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedPasswords = maxItems ? filteredPasswords.slice(0, maxItems) : filteredPasswords;
    const hasMore = maxItems ? filteredPasswords.length > maxItems : false;

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-40 bg-gray-50 rounded-[32px] animate-pulse border border-gray-100" />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {filteredPasswords.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                    <div className="bg-white p-6 rounded-[24px] shadow-sm mb-6">
                        <Lock className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Safe & Sound</h3>
                    <p className="text-gray-500 max-w-sm px-6">
                        {passwords.length === 0
                            ? "Your shared credentials will appear here once they're added. Everything is encrypted for your security."
                            : "No passwords match your search."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap gap-6">
                        {displayedPasswords.map((pw) => (
                            <Card
                                key={pw.id}
                                className="relative overflow-hidden w-[240px] p-[24px] border border-[#EDF1F7] bg-transparent shadow-none rounded-[15px] group"
                            >
                                {/* Background Ellipses */}
                                <div className="absolute w-[116px] h-[116px] rounded-full bg-[#00BBFF] opacity-[0.07] left-[74px] -top-[12px] pointer-events-none blur-[100px]" />
                                <div className="absolute w-[116px] h-[116px] rounded-full bg-[#FFDD00] opacity-[0.07] -left-[19px] top-[191px] pointer-events-none blur-[100px]" />

                                <div className="relative z-10 flex items-center justify-between mb-5">
                                    <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center overflow-hidden shrink-0">
                                        {pw.logoUrl ? (
                                            <img src={pw.logoUrl} alt={pw.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-indigo-50 text-indigo-600 font-bold text-sm">
                                                {pw.title.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(pw); }}
                                            className="p-1.5 transition-colors text-[#00AAFF]"
                                            title="Edit"
                                        >
                                            <Pencil className="h-[14px] w-[14px]" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this password?')) {
                                                    deleteMutation.mutate(pw.id);
                                                }
                                            }}
                                            className="p-1.5 transition-colors text-red-500"
                                        >
                                            <Trash2 className="h-[14px] w-[14px]" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="relative z-10 font-sans font-semibold text-[18px] text-gray-900 mb-5 truncate pr-2">
                                    {pw.title}
                                </h3>

                                <div className="relative z-10 space-y-3">
                                    {/* Username Field */}
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className="h-4 w-4 text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={pw.username}
                                            className="block w-full h-10 pl-9 pr-9 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:border-indigo-200 transition-colors"
                                        />
                                        <button
                                            onClick={() => handleCopy(pw.username)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-indigo-600 transition-colors"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Password Field */}
                                    <div className="relative group/field">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-3.5 w-3.5 text-gray-400" />
                                        </div>
                                        <input
                                            type={visiblePasswords[pw.id] ? "text" : "password"}
                                            readOnly
                                            value={pw.password}
                                            className="block w-full h-10 pl-9 pr-14 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:border-indigo-200 transition-colors"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                                            <button
                                                onClick={() => togglePasswordVisibility(pw.id)}
                                                className="p-1.5 text-gray-300 hover:text-indigo-600 transition-colors"
                                                title={visiblePasswords[pw.id] ? "Hide password" : "Show password"}
                                            >
                                                {visiblePasswords[pw.id] ? (
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Eye className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleCopy(pw.password)}
                                                className="p-1.5 text-gray-300 hover:text-indigo-600 transition-colors"
                                                title="Copy password"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                    {hasMore && viewAllHref && (
                        <div className="flex justify-center mt-6">
                            <a
                                href={viewAllHref}
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-[#00B7FF] bg-[#00B7FF]/[.08] hover:bg-[#00B7FF]/[.15] rounded-[10px] transition-colors"
                            >
                                View All ({filteredPasswords.length})
                            </a>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
