'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import { ChevronLeft, Plus, MoreVertical, Upload, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useFileOpener, getFileType } from '@/components/file-opener';
import { AddNewDropdown } from '@/components/file-manager/add-new-dropdown';
import { FileUploadModal } from '@/components/file-manager/upload-file-modal';
import { FolderCardSkeleton, FileCardSkeleton } from '@/components/file-manager/skeletons';
import { ContextMenu } from '@/components/file-manager/context-menu';
import { useClipboard } from '@/context/clipboard-context';

function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const tabs = ['All', 'Images', 'Videos', 'Documents', 'Fonts', 'Archives', 'Folders'];

// File type helpers
const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif'];
const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'];
const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'];
const fontExts = ['ttf', 'otf', 'woff', 'woff2', 'eot'];
const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

const getFileExtension = (filename: string) => filename?.split('.').pop()?.toLowerCase() || '';
const isImageFile = (name: string, mime: string) => imageExts.includes(getFileExtension(name)) || mime?.startsWith('image/');
const isVideoFile = (name: string, mime: string) => videoExts.includes(getFileExtension(name)) || mime?.startsWith('video/');
const isAudioFile = (name: string, mime: string) => audioExts.includes(getFileExtension(name)) || mime?.startsWith('audio/');
const isDocumentFile = (name: string, mime: string) => documentExts.includes(getFileExtension(name)) || mime?.includes('pdf') || mime?.includes('document') || mime?.includes('spreadsheet');
const isFontFile = (name: string, mime: string) => fontExts.includes(getFileExtension(name)) || mime?.includes('font');
const isArchiveFile = (name: string, mime: string) => archiveExts.includes(getFileExtension(name)) || mime?.includes('zip') || mime?.includes('rar') || mime?.includes('tar');

// Get the correct SVG icon path based on file type
const getFileIconPath = (name: string, mime: string): string => {
    if (isImageFile(name, mime)) return '/svg/image_icon.svg';
    if (isVideoFile(name, mime)) return '/svg/videos_icon.svg';
    if (isAudioFile(name, mime)) return '/svg/audios_icon.svg';
    if (isDocumentFile(name, mime)) return '/svg/files_icon.svg';
    if (isFontFile(name, mime)) return '/svg/fonts_icon.svg';
    if (isArchiveFile(name, mime)) return '/svg/archieves_icon.svg';
    return '/svg/files_icon.svg';
};

export default function FolderPage() {
    const params = useParams();
    const router = useRouter();
    const folderId = params.id as string;
    const queryClient = useQueryClient();
    const { openFile } = useFileOpener();

    const [activeTab, setActiveTab] = useState('All');
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

    // Queries
    const { data: contentsData, isLoading } = useQuery({
        queryKey: ['files', folderId],
        queryFn: () => fileManagerService.getContents(folderId),
        enabled: !!folderId,
    });

    // Mutations
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => fileManagerService.createFolder(name, folderId),
        onMutate: async (newFolderName) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            queryClient.setQueryData(['files', folderId], (old: any) => ({
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
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const restoreFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFolder(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
        },
    });

    const restoreFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFile(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFolder(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);
            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                folders: old?.folders?.filter((f: any) => f.id !== id) || []
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFile(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);
            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                files: old?.files?.filter((f: any) => f.id !== id) || []
            }));
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const renameFolderMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => fileManagerService.renameFolder(id, name),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);
            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                folders: old?.folders?.map((f: any) => f.id === id ? { ...f, name } : f) || []
            }));
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const renameFileMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => fileManagerService.renameFile(id, name),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);
            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                files: old?.files?.map((f: any) => f.id === id ? { ...f, name } : f) || []
            }));
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const moveFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.moveFile(id, targetFolderId),
        onMutate: async ({ id, targetFolderId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            // If moving to a DIFFERENT folder, remove from current view
            if (targetFolderId !== folderId) {
                queryClient.setQueryData(['files', folderId], (old: any) => ({
                    ...old,
                    files: old?.files?.filter((f: any) => f.id !== id) || []
                }));
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const copyFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.copyFile(id, targetFolderId),
        onMutate: async ({ id, targetFolderId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            // If copying to CURRENT folder, show optimistic item
            if (targetFolderId === folderId) {
                const sourceFile = (previousData as any)?.files?.find((f: any) => f.id === id);
                if (sourceFile) {
                    const optimisticFile = {
                        ...sourceFile,
                        id: 'temp-' + Date.now(),
                        name: sourceFile.name + ' (Copy)',
                        isOptimistic: true
                    };
                    queryClient.setQueryData(['files', folderId], (old: any) => ({
                        ...old,
                        files: [optimisticFile, ...(old?.files || [])]
                    }));
                }
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const moveFolderMutation = useMutation({
        mutationFn: ({ id, targetParentId }: { id: string, targetParentId: string | null }) => fileManagerService.moveFolder(id, targetParentId),
        onMutate: async ({ id, targetParentId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            // If moving to a DIFFERENT parent, remove from current view
            if (targetParentId !== folderId) {
                queryClient.setQueryData(['files', folderId], (old: any) => ({
                    ...old,
                    folders: old?.folders?.filter((f: any) => f.id !== id) || []
                }));
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const copyFolderMutation = useMutation({
        mutationFn: ({ id, targetParentId }: { id: string, targetParentId: string | null }) => fileManagerService.copyFolder(id, targetParentId),
        onMutate: async ({ id, targetParentId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            // If copying to CURRENT folder, show optimistic folder
            if (targetParentId === folderId) {
                const sourceFolder = (previousData as any)?.folders?.find((f: any) => f.id === id);
                if (sourceFolder) {
                    const optimisticFolder = {
                        ...sourceFolder,
                        id: 'temp-' + Date.now(),
                        name: sourceFolder.name + ' (Copy)',
                        isOptimistic: true
                    };
                    queryClient.setQueryData(['files', folderId], (old: any) => ({
                        ...old,
                        folders: [optimisticFolder, ...(old?.folders || [])]
                    }));
                }
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
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
                else deleteFileMutation.mutate(target.id);
                break;
            case 'paste':
                if (clipboard) {
                    const targetFolderId = type === 'folder' ? target.id : (folderId || null);
                    if (clipboard.action === 'cut') {
                        if (clipboard.type === 'folder') moveFolderMutation.mutate({ id: clipboard.item.id, targetParentId: targetFolderId });
                        else moveFileMutation.mutate({ id: clipboard.item.id, targetFolderId: targetFolderId });
                        clearClipboard();
                    } else {
                        if (clipboard.type === 'folder') copyFolderMutation.mutate({ id: clipboard.item.id, targetParentId: targetFolderId });
                        else copyFileMutation.mutate({ id: clipboard.item.id, targetFolderId: targetFolderId });
                    }
                }
                break;
        }
    };

    const handleRenameSubmit = () => {
        if (renamingItem) {
            if (renamingItem.type === 'folder') {
                renameFolderMutation.mutate({ id: renamingItem.id, name: renamingItem.name });
            } else {
                renameFileMutation.mutate({ id: renamingItem.id, name: renamingItem.name });
            }
            setRenamingItem(null);
        }
    };

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => fileManagerService.uploadFile(file, folderId),
        onMutate: async (newFile) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);

            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                files: [
                    {
                        id: 'temp-' + Date.now(),
                        name: newFile.name,
                        size: newFile.size,
                        mimeType: newFile.type,
                        url: '', // No URL yet
                        isOptimistic: true,
                        updatedAt: new Date().toISOString()
                    },
                    ...(old?.files || [])
                ]
            }));

            return { previousData };
        },
        onError: (err, newFile, context) => {
            queryClient.setQueryData(['files', folderId], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadFileMutation.mutate(e.target.files[0]);
        }
    };

    const folders = contentsData?.folders || [];
    const files = contentsData?.files || [];
    const breadcrumbs = contentsData?.breadcrumbs || [];
    const currentFolderName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Folder';

    // Filter based on active tab
    const filteredFolders = activeTab === 'All' || activeTab === 'Folders' ? folders : [];
    const filteredFiles = activeTab === 'All' ? files : activeTab === 'Folders' ? [] : files.filter((file: any) => {
        const name = file.name || '';
        const mime = file.mimeType?.toLowerCase() || '';
        switch (activeTab) {
            case 'Images': return isImageFile(name, mime);
            case 'Videos': return isVideoFile(name, mime);
            case 'Documents': return isDocumentFile(name, mime);
            case 'Fonts': return isFontFile(name, mime);
            case 'Archives': return isArchiveFile(name, mime);
            default: return true;
        }
    });

    const isImage = (name: string, mimeType: string) => isImageFile(name, mimeType);
    const getDisplayName = (name: string) => name?.split('/').pop() || name;

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

    const hasContent = filteredFolders.length > 0 || filteredFiles.length > 0;

    // Removal of full page loading to allow for granular skeletons
    // if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#8F9BB3]">Loading...</div>;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-white p-8 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6" onContextMenu={(e) => handleContextMenu(e, 'empty', null)}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-[#1A1A1A] hover:text-[#009DFF]">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-[20px] font-semibold text-[#1A1A1A]">{currentFolderName}</h1>
                </div>

                <AddNewDropdown
                    onCreateFolder={() => setIsCreatingFolder(true)}
                    onShowUploadModal={() => setIsUploadModalOpen(true)}
                />
            </div>

            {/* Tab Filters */}
            <div className="flex gap-1 mb-8 bg-[#F5F7FA] rounded-full p-1 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all ${activeTab === tab
                            ? 'bg-white text-[#1A1A1A] shadow-sm'
                            : 'text-[#8F9BB3] hover:text-[#1A1A1A]'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Container to fill space for right-click */}
            <div
                className="flex-1"
                onContextMenu={(e) => {
                    // Check if clicking on a file/folder item by traversing up from target
                    const target = e.target as HTMLElement;
                    const isOnItem = target.closest('[data-file-item]') || target.closest('[data-folder-item]');
                    if (!isOnItem) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContextMenu(e, 'empty', null);
                    }
                }}
            >
                {/* Folders Selection */}
                {(filteredFolders.length > 0 || isCreatingFolder || (isLoading && (activeTab === 'All' || activeTab === 'Folders'))) && (
                    <div className="mb-10">
                        <h2 className="text-[14px] font-semibold text-[#8F9BB3] mb-5 uppercase tracking-wider">Folders</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Skeleton Loading State for Folders */}
                            {isLoading && (activeTab === 'All' || activeTab === 'Folders') && [1, 2, 3].map((i) => <FolderCardSkeleton key={`folder-skele-${i}`} />)}

                            {/* Inline Creation Item */}
                            {isCreatingFolder && (
                                <div className={`rounded-[16px] ring-2 ring-[#00AAFF] ${createFolderMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center justify-center pt-8 pb-4">
                                        <Image
                                            src="/svg/folder_icon.svg"
                                            width={146}
                                            height={146}
                                            alt="Folder"
                                            className="w-full h-auto max-w-[146px]"
                                        />
                                    </div>
                                    <div className="text-center pb-6 px-4">
                                        <form onSubmit={handleCreateFolder}>
                                            <input
                                                ref={folderInputRef}
                                                className="text-[14px] text-[#1A1A1A] font-medium w-full text-center bg-transparent border-none focus:outline-none"
                                                value={newFolderName}
                                                onChange={(e) => setNewFolderName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Escape') cancelCreateFolder();
                                                }}
                                            />
                                        </form>
                                    </div>
                                </div>
                            )}

                            {filteredFolders.map((folder: any) => (
                                <div
                                    key={folder.id}
                                    data-folder-item
                                    onClick={() => !folder.isOptimistic && router.push(`/file-manager/folder/${folder.id}`)}
                                    onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
                                    className={`rounded-[16px] transition-all group ${folder.isOptimistic ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-center pt-8 pb-4 relative">
                                        <Image
                                            src="/svg/folder_icon.svg"
                                            width={146}
                                            height={146}
                                            alt="Folder"
                                            className="w-full h-auto max-w-[146px]"
                                        />
                                    </div>
                                    <div className="text-center pb-6 px-4">
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
                                                className="text-[14px] text-[#1A1A1A] font-medium w-full text-center bg-white border border-[#00AAFF] rounded px-1 outline-none"
                                            />
                                        ) : (
                                            <>
                                                <span className="text-[14px] text-[#1A1A1A] font-medium truncate block" title={folder.name}>
                                                    {folder.name}
                                                </span>

                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Section */}
                {(filteredFiles.length > 0 || (isLoading && activeTab !== 'Folders')) && (
                    <div className="mb-10">
                        <h2 className="text-[14px] font-semibold text-[#8F9BB3] mb-5 uppercase tracking-wider">Recent Files</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {/* Skeleton Loading State for Files */}
                            {isLoading && (activeTab === 'All' || activeTab !== 'Folders') && [1, 2, 3, 4, 5].map((i) => <FileCardSkeleton key={`file-skele-${i}`} />)}

                            {filteredFiles.map((file: any) => (
                                <div
                                    key={file.id}
                                    data-file-item
                                    className={`bg-[#EEF5FA] rounded-[20px] overflow-hidden group p-[10px] transition-all ${file.isOptimistic ? 'opacity-50 cursor-default pointer-events-none' : 'cursor-pointer hover:shadow-sm'}`}
                                    onContextMenu={(e) => handleContextMenu(e, 'file', file)}
                                    onClick={() => !file.isOptimistic && openFile({
                                        url: file.url,
                                        name: file.name,
                                        type: getFileType(file.url)
                                    })}
                                >
                                    {/* Thumbnail Area */}
                                    <div className="aspect-[4/3] bg-white rounded-[12px] relative overflow-hidden">
                                        {isImage(file.name, file.mimeType) && !file.isOptimistic ? (
                                            <img
                                                src={file.url}
                                                alt={getDisplayName(file.name)}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Image
                                                    src={getFileIconPath(file.name, file.mimeType)}
                                                    width={60}
                                                    height={60}
                                                    alt="File"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Image
                                                src={getFileIconPath(file.name, file.mimeType)}
                                                width={20}
                                                height={20}
                                                alt=""
                                            />
                                            {renamingItem?.id === file.id ? (
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
                                                    className="text-[13px] text-[#1A1A1A] font-medium w-full bg-white border border-[#00AAFF] rounded px-1 outline-none"
                                                />
                                            ) : (
                                                <span className="text-[13px] text-[#1A1A1A] truncate" title={getDisplayName(file.name)}>
                                                    {file.isOptimistic ? 'Saving...' : getDisplayName(file.name)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!hasContent && !isCreatingFolder && !isLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <p className="text-[#8F9BB3] text-[16px]">The folder is empty</p>
                    </div>
                )}
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
