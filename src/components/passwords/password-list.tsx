
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPasswords, getPasswordDetails, deletePassword, PasswordDetails } from '@/services/password.service';
import { Lock, Eye, EyeOff, Copy, Trash2, Loader2, Key, Info, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordListProps {
    onEdit?: (details: PasswordDetails) => void;
}

export function PasswordList({ onEdit }: PasswordListProps) {
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showContent, setShowContent] = useState<string | null>(null);

    const { data: passwords = [], isLoading } = useQuery({
        queryKey: ['passwords'],
        queryFn: getPasswords,
    });

    const { data: details, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['password-details', selectedId],
        queryFn: () => getPasswordDetails(selectedId!),
        enabled: !!selectedId && showContent === selectedId,
        staleTime: 0,
    });

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

    const handleView = (id: string, hasAccess: boolean) => {
        if (!hasAccess) {
            toast.error("You don't have access to this password");
            return;
        }

        if (showContent === id) {
            setShowContent(null);
            setSelectedId(null);
        } else {
            setSelectedId(id);
            setShowContent(id);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleEditClick = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const data = await queryClient.fetchQuery({
                queryKey: ['password-details', id],
                queryFn: () => getPasswordDetails(id),
                staleTime: 0
            });
            if (onEdit) onEdit(data);
        } catch (error) {
            toast.error("Failed to load details. Access restricted.");
        }
    };

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-40 bg-gray-50 rounded-[32px] animate-pulse border border-gray-100" />
            ))}
        </div>
    );

    if (passwords.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
            <div className="bg-white p-6 rounded-[24px] shadow-sm mb-6">
                <Lock className="h-12 w-12 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Safe & Sound</h3>
            <p className="text-gray-500 max-w-sm px-6">Your shared credentials will appear here once they're added. Everything is encrypted for your security.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passwords.map((pw) => (
                <Card
                    key={pw.id}
                    className={`relative overflow-hidden p-6 border transition-all duration-300 group ${showContent === pw.id
                        ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-xl scale-[1.02] z-10 rounded-[32px]'
                        : 'border-gray-100 bg-white hover:border-indigo-200 hover:shadow-lg rounded-[32px]'
                        }`}
                    onClick={() => handleView(pw.id, pw.hasAccess)}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className={`p-4 rounded-2xl transition-colors duration-300 ${pw.hasAccess
                            ? (showContent === pw.id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100')
                            : 'bg-gray-50 text-gray-300'
                            }`}>
                            <Key className="h-7 w-7" />
                        </div>
                        <div className="flex items-center gap-2">
                            {showContent === pw.id ? (
                                <EyeOff className="h-5 w-5 text-indigo-600" />
                            ) : (
                                <Eye className={`h-5 w-5 ${pw.hasAccess ? 'text-gray-400' : 'text-gray-200'}`} />
                            )}
                            <button
                                onClick={(e) => handleEditClick(e, pw.id)}
                                className="p-2 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors text-gray-300"
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this password?')) {
                                        deleteMutation.mutate(pw.id);
                                    }
                                }}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-300"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className={`text-xl font-bold mb-2 transition-colors ${showContent === pw.id ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {pw.title}
                    </h3>

                    {showContent === pw.id ? (
                        <div className="space-y-4 pt-6 mt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
                            {isLoadingDetails ? (
                                <div className="flex items-center justify-center py-6 gap-3 text-sm text-indigo-500 font-bold italic">
                                    <Loader2 className="h-5 w-5 animate-spin" /> Unlocking vault...
                                </div>
                            ) : details ? (
                                <>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.1em]">Email / Username</p>
                                        <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100 group/field hover:border-indigo-200 transition-colors">
                                            <span className="text-sm font-semibold truncate mr-2 text-gray-800">{details.username}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopy(details.username); }}
                                                className="p-1.5 bg-white shadow-sm hover:shadow-md rounded-lg transition-all border border-gray-200 active:scale-95"
                                                title="Copy Username"
                                            >
                                                <Copy className="h-4 w-4 text-indigo-600" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.1em]">Password</p>
                                        <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100 group/field hover:border-indigo-200 transition-colors">
                                            <span className="text-sm font-mono font-bold text-gray-800 tracking-wider">••••••••••••</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCopy(details.password); }}
                                                className="p-1.5 bg-white shadow-sm hover:shadow-md rounded-lg transition-all border border-gray-200 active:scale-95"
                                                title="Copy Password"
                                            >
                                                <Copy className="h-4 w-4 text-indigo-600" />
                                            </button>
                                        </div>
                                    </div>
                                    {details.note && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Info className="h-3 w-3 text-indigo-400" />
                                                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.1em]">Additional Note</p>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 italic">
                                                {details.note}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${pw.hasAccess ? 'text-gray-400' : 'text-red-300'}`}>
                                {pw.hasAccess ? 'Click to reveal credentials' : 'Access Restricted'}
                            </p>
                            {pw.hasAccess && (
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            )}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}
