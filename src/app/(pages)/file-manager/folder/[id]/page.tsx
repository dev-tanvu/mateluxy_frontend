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
import { PropertiesModal } from '@/components/file-manager/properties-modal';
import { getFolderStyle } from '@/lib/utils/folder-colors';

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
    // Global Clipboard Context
    const { clipboard, copyToClipboard: globalCopy, cutToClipboard: globalCut, clearClipboard } = useClipboard();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'file' | 'folder' | 'empty', target: any } | null>(null);

    // Rename state
    const [renamingItem, setRenamingItem] = useState<{ id: string, name: string, type: 'file' | 'folder' } | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Properties Modal State
    const [propertiesModal, setPropertiesModal] = useState<{ isOpen: boolean, item: any, type: 'file' | 'folder' }>({ isOpen: false, item: null, type: 'folder' });

    // Selection State - for single and multi-select like Windows/Mac file manager
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    // Marking Mode
    const [isMarkingMode, setIsMarkingMode] = useState(false);

    // Handle item selection (single click)
    const handleItemSelect = (e: React.MouseEvent, itemId: string, itemType: 'file' | 'folder', allItems: any[]) => {
        e.stopPropagation();

        const isCtrlPressed = e.ctrlKey || e.metaKey; // metaKey for Mac
        const isShiftPressed = e.shiftKey;

        setSelectedItems(prev => {
            const newSelection = new Set(prev);

            if (isShiftPressed && lastSelectedId) {
                // Shift+click: select range
                const allIds = allItems.map(item => item.id);
                const lastIndex = allIds.indexOf(lastSelectedId);
                const currentIndex = allIds.indexOf(itemId);

                if (lastIndex !== -1 && currentIndex !== -1) {
                    const start = Math.min(lastIndex, currentIndex);
                    const end = Math.max(lastIndex, currentIndex);

                    for (let i = start; i <= end; i++) {
                        newSelection.add(allIds[i]);
                    }
                }
            } else if (isCtrlPressed || isMarkingMode) {
                // Ctrl+click OR Marking Mode: toggle selection
                if (newSelection.has(itemId)) {
                    newSelection.delete(itemId);
                } else {
                    newSelection.add(itemId);
                }
            } else {
                // Normal click: select only this item
                newSelection.clear();
                newSelection.add(itemId);
            }

            return newSelection;
        });

        setLastSelectedId(itemId);
    };

    // Handle item open (double click)
    const handleItemOpen = (itemId: string, itemType: 'file' | 'folder', item: any) => {
        if (itemType === 'folder') {
            router.push(`/file-manager/folder/${itemId}`);
        } else {
            const allFiles = filteredFiles.map((f: any) => ({
                url: f.url,
                name: f.name,
                type: getFileType(f.url)
            }));

            openFile({
                url: item.url,
                name: item.name,
                type: getFileType(item.url)
            }, allFiles);
        }
    };

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

    // Data derivation
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

    const hasContent = filteredFolders.length > 0 || filteredFiles.length > 0;


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

    const updateColorMutation = useMutation({
        mutationFn: ({ id, color }: { id: string, color: string }) => fileManagerService.updateFolderColor(id, color),
        onMutate: async ({ id, color }) => {
            await queryClient.cancelQueries({ queryKey: ['files', folderId] });
            const previousData = queryClient.getQueryData(['files', folderId]);
            queryClient.setQueryData(['files', folderId], (old: any) => ({
                ...old,
                folders: old?.folders?.map((f: any) => f.id === id ? { ...f, color } : f) || []
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

    const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'folder' | 'empty', target: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, target });
    };

    const copyToClipboard = (type: 'file' | 'folder', target: any) => {
        let itemsToCopy: { type: 'file' | 'folder', item: any }[] = [];

        if (selectedItems.has(target.id)) {
            const allVisibleFolders = filteredFolders;
            const allVisibleFiles = filteredFiles;

            selectedItems.forEach(id => {
                const folder = allVisibleFolders.find((f: any) => f.id === id);
                if (folder) {
                    itemsToCopy.push({ type: 'folder', item: folder });
                } else {
                    const file = allVisibleFiles.find((f: any) => f.id === id);
                    if (file) {
                        itemsToCopy.push({ type: 'file', item: file });
                    }
                }
            });
        } else {
            itemsToCopy.push({ type, item: target });
        }

        if (itemsToCopy.length > 0) {
            globalCopy(itemsToCopy);
            toast.success(`Copied ${itemsToCopy.length} item${itemsToCopy.length > 1 ? 's' : ''} to clipboard`);
        }
    };

    const cutToClipboard = (type: 'file' | 'folder', target: any) => {
        let itemsToCut: { type: 'file' | 'folder', item: any }[] = [];

        if (selectedItems.has(target.id)) {
            const allVisibleFolders = filteredFolders;
            const allVisibleFiles = filteredFiles;

            selectedItems.forEach(id => {
                const folder = allVisibleFolders.find((f: any) => f.id === id);
                if (folder) {
                    itemsToCut.push({ type: 'folder', item: folder });
                } else {
                    const file = allVisibleFiles.find((f: any) => f.id === id);
                    if (file) {
                        itemsToCut.push({ type: 'file', item: file });
                    }
                }
            });
        } else {
            itemsToCut.push({ type, item: target });
        }

        if (itemsToCut.length > 0) {
            globalCut(itemsToCut);
            toast.success(`Cut ${itemsToCut.length} item${itemsToCut.length > 1 ? 's' : ''} to clipboard`);
        }
    };

    const handleContextAction = async (action: 'copy' | 'cut' | 'rename' | 'delete' | 'paste' | 'properties' | 'color' | 'mark', color?: string) => {
        if (!contextMenu) return;

        const { type, target } = contextMenu;
        setContextMenu(null);

        switch (action) {
            case 'mark':
                setIsMarkingMode(prev => !prev);
                if (!isMarkingMode) {
                    if (target && target.id) {
                        setSelectedItems(prev => new Set(prev).add(target.id));
                    }
                }
                break;
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
                if (selectedItems.has(target.id) && selectedItems.size > 1) {
                    // Bulk delete
                    const itemsToDelete = Array.from(selectedItems);
                    let deletedCount = 0;

                    itemsToDelete.forEach(id => {
                        const isFolder = folders.some((f: any) => f.id === id);
                        if (isFolder) {
                            deleteFolderMutation.mutate(id);
                        } else {
                            deleteFileMutation.mutate(id);
                        }
                        deletedCount++;
                    });

                    setSelectedItems(new Set());
                    toast.success(`Deleted ${deletedCount} items`);
                } else {
                    if (type === 'folder') deleteFolderMutation.mutate(target.id);
                    else deleteFileMutation.mutate(target.id);
                }
                break;
            case 'properties':
                setPropertiesModal({ isOpen: true, item: target, type: type as any });
                break;
            case 'color':
                if (type === 'folder' && color) {
                    if (selectedItems.has(target.id) && selectedItems.size > 1) {
                        // Bulk color update
                        selectedItems.forEach(id => {
                            const isFolder = folders.some((f: any) => f.id === id);
                            if (isFolder) {
                                updateColorMutation.mutate({ id, color });
                            }
                        });
                    } else {
                        updateColorMutation.mutate({ id: target.id, color });
                    }
                }
                break;
            case 'paste':
                if (clipboard && clipboard.items.length > 0) {
                    const targetFolderId = type === 'folder' ? target.id : (folderId || null);

                    clipboard.items.forEach(({ type: itemType, item }) => {
                        if (clipboard.action === 'cut') {
                            if (itemType === 'folder') moveFolderMutation.mutate({ id: item.id, targetParentId: targetFolderId });
                            else moveFileMutation.mutate({ id: item.id, targetFolderId: targetFolderId });
                        } else {
                            if (itemType === 'folder') copyFolderMutation.mutate({ id: item.id, targetParentId: targetFolderId });
                            else copyFileMutation.mutate({ id: item.id, targetFolderId: targetFolderId });
                        }
                    });

                    if (clipboard.action === 'cut') {
                        clearClipboard();
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
                onClick={(e) => {
                    // Clear selection when clicking on empty area
                    const target = e.target as HTMLElement;
                    const isOnItem = target.closest('[data-file-item]') || target.closest('[data-folder-item]');
                    if (!isOnItem) {
                        setSelectedItems(new Set());
                        setLastSelectedId(null);
                    }
                }}
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

                            {filteredFolders.map((folder: any) => {
                                const isSelected = selectedItems.has(folder.id);
                                return (
                                    <div
                                        key={folder.id}
                                        data-folder-item
                                        onClick={(e) => !folder.isOptimistic && handleItemSelect(e, folder.id, 'folder', filteredFolders)}
                                        onDoubleClick={() => !folder.isOptimistic && handleItemOpen(folder.id, 'folder', folder)}
                                        onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
                                        className={`rounded-[16px] transition-all group ${folder.isOptimistic ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-gray-50'} ${isSelected ? 'ring-2 ring-[#00AAFF] bg-[#F0F9FF]' : ''}`}
                                    >
                                        <div className="flex items-center justify-center pt-8 pb-4 relative">
                                            <Image
                                                src="/svg/folder_icon.svg"
                                                width={146}
                                                height={146}
                                                alt="Folder"
                                                className="w-full h-auto max-w-[146px]"
                                                style={folder.color ? getFolderStyle(folder.color) : {}}
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
                                )
                            })}
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

                            {filteredFiles.map((file: any) => {
                                const isSelected = selectedItems.has(file.id);
                                return (
                                    <div
                                        key={file.id}
                                        data-file-item
                                        className={`rounded-[20px] overflow-hidden group p-[10px] transition-all relative ${file.isOptimistic ? 'opacity-50 cursor-default pointer-events-none' : 'cursor-pointer hover:shadow-sm'} ${isSelected ? 'bg-[#DBEAFE] ring-2 ring-[#00AAFF]' : 'bg-[#EEF5FA]'}`}
                                        onContextMenu={(e) => handleContextMenu(e, 'file', file)}
                                        onClick={(e) => !file.isOptimistic && handleItemSelect(e, file.id, 'file', filteredFiles)}
                                        onDoubleClick={() => !file.isOptimistic && handleItemOpen(file.id, 'file', file)}
                                    >
                                        {/* Checkbox for marking mode */}
                                        {isMarkingMode && (
                                            <div
                                                className="absolute top-3 left-3 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItems(prev => {
                                                        const newSet = new Set(prev);
                                                        if (newSet.has(file.id)) {
                                                            newSet.delete(file.id);
                                                        } else {
                                                            newSet.add(file.id);
                                                        }
                                                        return newSet;
                                                    });
                                                }}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#00AAFF] border-[#00AAFF]' : 'bg-white border-gray-300 hover:border-[#00AAFF]'}`}>
                                                    {isSelected && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                );
                            })}
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

            <PropertiesModal
                isOpen={propertiesModal.isOpen}
                onClose={() => setPropertiesModal({ ...propertiesModal, isOpen: false })}
                item={propertiesModal.item}
                type={propertiesModal.type}
            />

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    type={contextMenu.type}
                    onAction={handleContextAction}
                    onClose={() => setContextMenu(null)}
                    hasClipboard={!!clipboard}
                    isMarkingMode={isMarkingMode}
                    selectedCount={selectedItems.size}
                />
            )}
        </div>
    );
}
