"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RotateCcw, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import Image from 'next/image';
import { Source_Sans_3 } from 'next/font/google';
import { TableRowSkeleton } from '@/components/file-manager/skeletons';

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

// Helper Functions
function formatSize(bytes: number) {
    if (bytes === 0) return '0KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return val + sizes[i];
}

function formatDate(date: string | Date) {
    if (!date) return '-';
    const dt = new Date(date);
    const day = dt.toLocaleDateString('en-GB', { day: '2-digit' });
    const month = dt.toLocaleDateString('en-GB', { month: 'short' });
    const year = dt.toLocaleDateString('en-GB', { year: 'numeric' });
    return `${day} ${month}, ${year}`;
}

function getFileTypeLabel(mimeType: string, name: string) {
    if (!mimeType) {
        const ext = name?.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return 'Image';
        if (['pdf'].includes(ext || '')) return 'PDF';
        if (['doc', 'docx'].includes(ext || '')) return 'Document';
        return 'File';
    }
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document';
    return mimeType.split('/')[1]?.toUpperCase() || 'File';
}

const getFileIconPath = (name: string, mime: string): string => {
    const ext = name?.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || mime?.startsWith('image/')) return '/svg/image_icon.svg';
    if (['mp4', 'mov', 'avi'].includes(ext) || mime?.startsWith('video/')) return '/svg/videos_icon.svg';
    if (['mp3', 'wav'].includes(ext) || mime?.startsWith('audio/')) return '/svg/audios_icon.svg';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext) || mime?.includes('pdf') || mime?.includes('document')) return '/svg/files_icon.svg';
    if (['zip', 'rar'].includes(ext) || mime?.includes('zip')) return '/svg/archieves_icon.svg';
    return '/svg/files_icon.svg';
};

// Context Menu Component
interface ContextMenuProps {
    x: number;
    y: number;
    onRestore: () => void;
    onDelete: () => void;
    onClose: () => void;
}

function RecycleBinContextMenu({ x, y, onRestore, onDelete, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px]"
            style={{ top: y, left: x }}
        >
            <button
                onClick={onRestore}
                className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-[#F2F7FA] flex items-center gap-3 transition-colors"
            >
                <RotateCcw size={18} className="text-green-500" />
                Restore
            </button>
            <button
                onClick={onDelete}
                className="w-full px-4 py-2.5 text-left text-[14px] text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
                <Trash2 size={18} />
                Delete permanently
            </button>
        </div>
    );
}

export default function RecycleBinPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: any } | null>(null);

    // Queries
    const { data: deletedData, isLoading } = useQuery({
        queryKey: ['deleted-items'],
        queryFn: fileManagerService.getDeleted,
    });

    // Mutations
    const restoreFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFile(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['deleted-items'] });
            const previousData = queryClient.getQueryData(['deleted-items']);
            queryClient.setQueryData(['deleted-items'], (old: any) => ({
                ...old,
                files: (old?.files || []).filter((f: any) => f.id !== id)
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['deleted-items'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const restoreFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFolder(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['deleted-items'] });
            const previousData = queryClient.getQueryData(['deleted-items']);
            queryClient.setQueryData(['deleted-items'], (old: any) => ({
                ...old,
                folders: (old?.folders || []).filter((f: any) => f.id !== id)
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['deleted-items'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['files'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const permanentlyDeleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.permanentlyDeleteFile(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['deleted-items'] });
            const previousData = queryClient.getQueryData(['deleted-items']);
            queryClient.setQueryData(['deleted-items'], (old: any) => ({
                ...old,
                files: (old?.files || []).filter((f: any) => f.id !== id)
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['deleted-items'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const permanentlyDeleteFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.permanentlyDeleteFolder(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['deleted-items'] });
            const previousData = queryClient.getQueryData(['deleted-items']);
            queryClient.setQueryData(['deleted-items'], (old: any) => ({
                ...old,
                folders: (old?.folders || []).filter((f: any) => f.id !== id)
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['deleted-items'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const allDeleted = [
        ...(deletedData?.files || []).map((f: any) => ({ ...f, type: 'file' })),
        ...(deletedData?.folders || []).map((f: any) => ({ ...f, type: 'folder' }))
    ].sort((a: any, b: any) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    const handleContextMenu = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const handleRestore = () => {
        if (!contextMenu) return;
        const { item } = contextMenu;
        if (item.type === 'folder') {
            restoreFolderMutation.mutate(item.id);
        } else {
            restoreFileMutation.mutate(item.id);
        }
        setContextMenu(null);
    };

    const handlePermanentDelete = () => {
        if (!contextMenu) return;
        const { item } = contextMenu;
        if (window.confirm(`Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
            if (item.type === 'folder') {
                permanentlyDeleteFolderMutation.mutate(item.id);
            } else {
                permanentlyDeleteFileMutation.mutate(item.id);
            }
        }
        setContextMenu(null);
    };

    return (
        <div className={`bg-white min-h-screen p-8 flex flex-col ${sourceSans.className}`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-[24px] font-semibold text-[#1A1A1A]">
                    Recently deleted
                </h1>
                <span className="ml-auto text-[#8F9BB3] text-[14px]">
                    Items in the recycle bin will be automatically deleted after 15 days.
                </span>
            </div>

            {/* Table */}
            <div className="flex-1">
                <table className="w-full border-collapse">
                    <thead className="text-[#1A1A1A] text-[15px] font-bold border-b border-gray-100">
                        <tr>
                            <th className="text-left py-6 pl-6 w-[40%]">Name</th>
                            <th className="text-center py-6 w-[15%]">Date Deleted</th>
                            <th className="text-center py-6 w-[15%]">Last Modified</th>
                            <th className="text-center py-6 w-[15%]">File type</th>
                            <th className="text-center py-6 w-[15%]">File size</th>
                        </tr>
                    </thead>
                    <tbody className="text-[14px]">
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    <td colSpan={5} className="py-2">
                                        <TableRowSkeleton />
                                    </td>
                                </tr>
                            ))
                        ) : allDeleted.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center text-[#8F9BB3]">
                                    Recycle bin is empty.
                                </td>
                            </tr>
                        ) : (
                            allDeleted.map((item: any) => (
                                <tr
                                    key={item.id}
                                    className="group hover:bg-[#F9FBFF] transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                                    onContextMenu={(e) => handleContextMenu(e, item)}
                                >
                                    <td className="py-5 pl-6 flex items-center gap-4">
                                        <div className="w-12 h-12 flex items-center justify-center bg-[#F9FBFF] rounded-[16px] border border-gray-50">
                                            <Image
                                                src={item.type === 'folder' ? '/svg/folder_icon.svg' : getFileIconPath(item.name, item.mimeType)}
                                                width={24}
                                                height={24}
                                                alt={item.name}
                                            />
                                        </div>
                                        <span className="font-bold text-[#1A1A1A] text-[15px] truncate max-w-[300px]" title={item.name}>
                                            {item.name}
                                        </span>
                                    </td>
                                    <td className="py-5 text-center text-[#8F9BB3] font-medium">
                                        {formatDate(item.deletedAt)}
                                    </td>
                                    <td className="py-5 text-center text-[#8F9BB3] font-medium">
                                        {formatDate(item.updatedAt)}
                                    </td>
                                    <td className="py-5 text-center text-[#8F9BB3] uppercase font-medium">
                                        {item.type === 'folder' ? 'Folder' : getFileTypeLabel(item.mimeType, item.name)}
                                    </td>
                                    <td className="py-5 text-center text-[#8F9BB3] font-medium">
                                        {formatSize(item.size)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <RecycleBinContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onRestore={handleRestore}
                    onDelete={handlePermanentDelete}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
