'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, Power, PowerOff, Image as ImageIcon, Type } from 'lucide-react';
import { toast } from 'sonner';
import {
    Watermark,
    getWatermarks,
    activateWatermark,
    deactivateAllWatermarks,
    deleteWatermark,
} from '@/services/watermark.service';

export default function WatermarksPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: watermarks = [], isLoading } = useQuery({
        queryKey: ['watermarks'],
        queryFn: getWatermarks,
    });

    const activateMutation = useMutation({
        mutationFn: activateWatermark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Watermark activated');
        },
        onError: () => {
            toast.error('Failed to activate watermark');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateAllWatermarks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Watermark deactivated');
        },
        onError: () => {
            toast.error('Failed to deactivate watermark');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWatermark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Watermark deleted');
        },
        onError: () => {
            toast.error('Failed to delete watermark');
        },
    });

    const handleEdit = (id: string) => {
        router.push(`/settings/watermarks/new?edit=${id}`);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleToggleActive = (watermark: Watermark) => {
        if (watermark.isActive) {
            deactivateMutation.mutate();
        } else {
            activateMutation.mutate(watermark.id);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Watermarks</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your watermarks for property images</p>
                    </div>
                    <button
                        onClick={() => router.push('/settings/watermarks/new')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-[#1D4ED8] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add New
                    </button>
                </div>

                {/* Watermarks Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : watermarks.length === 0 ? (
                    <div
                        className="rounded-xl p-12 text-center"
                        style={{ backgroundColor: '#F9F9F9', border: '1px solid #ECEEF6' }}
                    >
                        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No watermarks yet</h3>
                        <p className="text-sm text-gray-500 mb-6">Create your first watermark to apply to property images</p>
                        <button
                            onClick={() => router.push('/settings/watermarks/new')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-[#1D4ED8] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Watermark
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {watermarks.map((watermark) => (
                            <div
                                key={watermark.id}
                                className="rounded-xl overflow-hidden transition-all hover:shadow-lg"
                                style={{
                                    backgroundColor: '#F9F9F9',
                                    border: watermark.isActive ? '2px solid #2563EB' : '1px solid #ECEEF6',
                                }}
                            >
                                {/* Preview */}
                                <div
                                    className="h-40 flex items-center justify-center p-4 relative"
                                    style={{ background: watermark.type === 'text' ? '#333333' : 'repeating-conic-gradient(#e8e8e8 0% 25%, #ffffff 0% 50%) 50% / 16px 16px' }}
                                >
                                    {watermark.type === 'text' ? (
                                        <span
                                            className="font-bold text-2xl"
                                            style={{
                                                color: watermark.textColor || '#FFFFFF',
                                                opacity: watermark.opacity,
                                            }}
                                        >
                                            {watermark.text}
                                        </span>
                                    ) : (
                                        <img
                                            src={watermark.imageUrl}
                                            alt={watermark.name}
                                            className="max-h-full max-w-full object-contain"
                                            style={{ opacity: watermark.opacity }}
                                        />
                                    )}

                                    {/* Type badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-gray-800/70 text-white rounded-full text-xs font-medium">
                                        {watermark.type === 'text' ? (
                                            <><Type className="w-3 h-3" /> Text</>
                                        ) : (
                                            <><ImageIcon className="w-3 h-3" /> Image</>
                                        )}
                                    </div>

                                    {watermark.isActive && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                                            <Check className="w-3 h-3" />
                                            Active
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 bg-white">
                                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{watermark.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Position: <span className="capitalize">{watermark.position.replace('-', ' ')}</span> •
                                        Opacity: {Math.round(watermark.opacity * 100)}% •
                                        Scale: {Math.round(watermark.scale * 100)}%
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(watermark)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${watermark.isActive
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                }`}
                                        >
                                            {watermark.isActive ? (
                                                <>
                                                    <PowerOff className="w-3.5 h-3.5" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="w-3.5 h-3.5" />
                                                    Activate
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(watermark.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(watermark.id, watermark.name)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
