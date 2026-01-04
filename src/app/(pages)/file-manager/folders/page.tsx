'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import { ArrowLeft, Plus, Search, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AddNewDropdown } from '@/components/file-manager/add-new-dropdown';
import { FileUploadModal } from '@/components/file-manager/upload-file-modal';
import { FolderCardSkeleton } from '@/components/file-manager/skeletons';
import { ContextMenu } from '@/components/file-manager/context-menu';
import { useClipboard } from '@/context/clipboard-context';
import { FolderProgress } from '@/components/file-manager/folder-progress';

function getPercentage(value: number, total: number) {
    if (total === 0) return 0;
    const pct = (value / total) * 100;
    return pct < 1 ? parseFloat(pct.toFixed(2)) : Math.round(pct);
}

/* Helper functions reused */
function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}



export default function AllFoldersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('New Folder');
    const folderInputRef = useRef<HTMLInputElement>(null);

    // Global Clipboard Context
    const { clipboard, copyToClipboard, cutToClipboard, clearClipboard } = useClipboard();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'file' | 'folder' | 'empty', target: any } | null>(null);

    // Rename state
    const [renamingItem, setRenamingItem] = useState<{ id: string, name: string, type: 'file' | 'folder' } | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renamingItem?.id && renameInputRef.current) {
            const timer = setTimeout(() => {
                renameInputRef.current?.focus();
                renameInputRef.current?.select();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [renamingItem?.id]);

    useEffect(() => {
        if (isCreatingFolder && folderInputRef.current) {
            // Use setTimeout to ensure focus happens after any dropdown cleanup/focus restoration
            const timer = setTimeout(() => {
                folderInputRef.current?.focus();
                folderInputRef.current?.select();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isCreatingFolder]);

    const handleCreateFolder = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newFolderName.trim() && !createFolderMutation.isPending) {
            createFolderMutation.mutate(newFolderName);
        }
    };

    const cancelCreateFolder = () => {
        setIsCreatingFolder(false);
        setNewFolderName('New Folder');
    };
    // Queries
    // We reuse getContents() which returns root folders by default
    const { data: contentsData, isLoading } = useQuery({
        queryKey: ['files', 'root'],
        queryFn: () => fileManagerService.getContents(),
    });

    const { data: statsData } = useQuery({
        queryKey: ['storage-stats'],
        queryFn: fileManagerService.getStats,
    });

    const createFolderMutation = useMutation({
        mutationFn: (name: string) => fileManagerService.createFolder(name),
        onMutate: async (newFolderName) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);

            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                folders: [
                    {
                        id: 'temp-' + Date.now(),
                        name: newFolderName,
                        isOptimistic: true
                    },
                    ...(old?.folders || [])
                ]
            }));

            setIsCreatingFolder(false);
            setNewFolderName('New Folder');

            return { previousData };
        },
        onError: (err, newFolderName, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFolder(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);
            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                folders: old?.folders?.filter((f: any) => f.id !== id) || []
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const renameFolderMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => fileManagerService.renameFolder(id, name),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);
            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                folders: old?.folders?.map((f: any) => f.id === id ? { ...f, name } : f) || []
            }));
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
        },
    });

    const moveFolderMutation = useMutation({
        mutationFn: ({ id, targetParentId }: { id: string, targetParentId: string | null }) => fileManagerService.moveFolder(id, targetParentId),
        onMutate: async ({ id, targetParentId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);

            // If moving to ANOTHER folder (not root/null), remove from current All Folders list
            if (targetParentId !== null) {
                queryClient.setQueryData(['files', 'root'], (old: any) => ({
                    ...old,
                    folders: old?.folders?.filter((f: any) => f.id !== id) || []
                }));
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
        },
    });

    const copyFolderMutation = useMutation({
        mutationFn: ({ id, targetParentId }: { id: string, targetParentId: string | null }) => fileManagerService.copyFolder(id, targetParentId),
        onMutate: async ({ id, targetParentId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);

            // If copying to root, show optimistic folder
            if (targetParentId === null) {
                const sourceFolder = (previousData as any)?.folders?.find((f: any) => f.id === id);
                if (sourceFolder) {
                    const optimisticFolder = {
                        ...sourceFolder,
                        id: 'temp-' + Date.now(),
                        name: sourceFolder.name + ' (Copy)',
                        isOptimistic: true
                    };
                    queryClient.setQueryData(['files', 'root'], (old: any) => ({
                        ...old,
                        folders: [optimisticFolder, ...(old?.folders || [])]
                    }));
                }
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'folder' | 'empty', target: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, target });
    };

    const handleContextAction = async (action: 'copy' | 'cut' | 'rename' | 'delete' | 'paste') => {
        if (!contextMenu) return;

        const { type, target } = contextMenu;
        setContextMenu(null);

        switch (action) {
            case 'copy':
                copyToClipboard(type as any, target);
                break;
            case 'cut':
                cutToClipboard(type as any, target);
                break;
            case 'rename':
                setRenamingItem({ id: target.id, name: target.name, type: type as any });
                break;
            case 'delete':
                if (type === 'folder') deleteFolderMutation.mutate(target.id);
                break;
            case 'paste':
                if (clipboard) {
                    const targetFolderId = type === 'folder' ? target.id : null;
                    if (clipboard.action === 'cut') {
                        if (clipboard.type === 'folder') moveFolderMutation.mutate({ id: clipboard.item.id, targetParentId: targetFolderId });
                        clearClipboard();
                    } else {
                        if (clipboard.type === 'folder') copyFolderMutation.mutate({ id: clipboard.item.id, targetParentId: targetFolderId });
                    }
                }
                break;
        }
    };

    const handleRenameSubmit = () => {
        if (renamingItem) {
            if (renamingItem.type === 'folder') {
                renameFolderMutation.mutate({ id: renamingItem.id, name: renamingItem.name });
            }
            setRenamingItem(null);
        }
    };

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => fileManagerService.uploadFile(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const folders = contentsData?.folders || [];
    const totalUsed = statsData?.totalUsed || 0;

    // Filter folders based on search
    const filteredFolders = folders.filter((f: any) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="min-h-[calc(100vh-64px)] bg-[#F2F7FA] p-8 flex flex-col"
            onContextMenu={(e) => {
                // Check if clicking on a file/folder item by traversing up from target
                const target = e.target as HTMLElement;
                const isOnItem = target.closest('[data-folder-item]');
                if (!isOnItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContextMenu(e, 'empty', null);
                }
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-[28px] font-bold text-[#1A1A1A]">All Folders</h1>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search folders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onContextMenu={(e) => e.stopPropagation()}
                            className="pl-12 pr-4 py-3 rounded-xl border border-[#EDF1F7] focus:outline-none focus:ring-2 focus:ring-[#00AAFF]/20 w-[300px]"
                        />
                    </div>
                    <AddNewDropdown
                        onCreateFolder={() => setIsCreatingFolder(true)}
                        onShowUploadModal={() => setIsUploadModalOpen(true)}
                        showUploadFile={false}
                    />
                </div>
            </div>

            {/* Folders Grid Container to fill remaining space */}
            <div className="flex-1">
                <div className="grid grid-cols-4 gap-6">
                    {/* Skeleton Loading State */}
                    {isLoading && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <FolderCardSkeleton key={`folder-skele-${i}`} />)}

                    {/* Inline Creation Item */}
                    {isCreatingFolder && (
                        <div className={`bg-white rounded-[12px] p-5 flex items-center justify-between cursor-pointer ring-2 ring-[#00AAFF] transition-all min-h-[120px] ${createFolderMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex flex-col justify-between h-full gap-3 w-full">
                                <Image
                                    src="/svg/folder_icon.svg"
                                    width={44}
                                    height={44}
                                    alt="Folder"
                                />
                                <div className="w-full">
                                    <form onSubmit={handleCreateFolder}>
                                        <input
                                            ref={folderInputRef}
                                            className="font-bold text-[15px] w-full bg-transparent border-none focus:outline-none text-[#1A1A1A]"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Esc') cancelCreateFolder();
                                            }}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {filteredFolders.map((folder: any) => {
                        const hue = (folder.id.split('').reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0) * 137) % 360;

                        return (
                            <div
                                key={folder.id}
                                data-folder-item
                                onClick={() => !folder.isOptimistic && router.push(`/file-manager/folder/${folder.id}`)}
                                onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
                                className={`bg-white rounded-[12px] p-5 relative transition-all min-h-[120px] ${folder.isOptimistic ? 'opacity-50 cursor-default' : 'cursor-pointer hover:shadow-lg'}`}
                            >
                                <div className="flex flex-col h-full gap-3 min-w-0">
                                    <Image
                                        src="/svg/folder_icon.svg"
                                        width={44}
                                        height={44}
                                        alt="Folder"
                                        style={{ filter: `hue-rotate(${hue}deg)` }}
                                    />
                                    <div className="w-full pr-10">
                                        {renamingItem?.id === folder.id ? (
                                            <input
                                                ref={renameInputRef}
                                                type="text"
                                                value={renamingItem?.name || ''}
                                                onChange={(e) => setRenamingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleRenameSubmit();
                                                    if (e.key === 'Escape') setRenamingItem(null);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onContextMenu={(e) => e.stopPropagation()}
                                                className="font-bold text-[15px] w-full bg-white border border-[#00AAFF] rounded px-1 outline-none"
                                            />
                                        ) : (
                                            <>
                                                <h3 className="font-bold text-[15px] truncate text-[#1A1A1A] w-full" title={folder.name}>{folder.name}</h3>
                                                {!folder.isOptimistic && (
                                                    <p className="text-[#8F9BB3] text-[12px] mt-1">
                                                        {formatSize(folder.size)} ({folder._count?.files || 0} Files, {folder._count?.children || 0} Folders)
                                                    </p>
                                                )}
                                            </>
                                        )}

                                    </div>
                                    <div className="absolute bottom-5 right-5">
                                        <FolderProgress percentage={getPercentage(folder.size, totalUsed)} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredFolders.length === 0 && !isLoading && (
                        <div className="col-span-4 py-20 text-center text-[#8F9BB3]">
                            The folder is empty
                        </div>
                    )}
                </div>
            </div>


            <FileUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={(files) => {
                    files.forEach(file => uploadFileMutation.mutate(file));
                }}
            />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    type={contextMenu.type}
                    onAction={handleContextAction}
                    onClose={() => setContextMenu(null)}
                    hasClipboard={!!clipboard}
                />
            )}
        </div>
    );
}
