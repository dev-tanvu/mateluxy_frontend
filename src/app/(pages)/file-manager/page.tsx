'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Source_Sans_3 } from 'next/font/google';

const sourceSans = Source_Sans_3({ subsets: ['latin'] });
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import {
    Plus, Upload, Trash2, ChevronRight, RotateCcw,
    MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFileOpener, getFileType } from '@/components/file-opener';

import { FileManagerSkeleton } from '@/components/skeletons/file-manager-skeleton';
import { FolderCardSkeleton, CategorySkeleton, TableRowSkeleton, StorageStatsSkeleton } from '@/components/file-manager/skeletons';
import { AddNewDropdown } from '@/components/file-manager/add-new-dropdown';
import { FileUploadModal } from '@/components/file-manager/upload-file-modal';
import { useClipboard } from '@/context/clipboard-context';
import { ContextMenu } from '@/components/file-manager/context-menu';
import { PropertiesModal } from '@/components/file-manager/properties-modal';
import { getFolderStyle } from '@/lib/utils/folder-colors';

// Helper Functions
function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getPercentage(value: number, total: number) {
    if (total === 0) return 0;
    const pct = (value / total) * 100;
    return pct < 1 ? parseFloat(pct.toFixed(2)) : Math.round(pct);
}

import { FolderProgress } from '@/components/file-manager/folder-progress';

export default function FileManagerPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { openFile } = useFileOpener();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('New Folder');
    const folderInputRef = useRef<HTMLInputElement>(null);

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

    // Marking Mode - shows checkboxes on all items for bulk selection
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
            openFile({
                url: item.url,
                name: item.name,
                type: getFileType(item.url)
            });
        }
    };

    // Clear selection when clicking empty area
    const handleClearSelection = (e: React.MouseEvent) => {
        // Only clear if clicking on the container itself, not on items
        if (e.target === e.currentTarget) {
            setSelectedItems(new Set());
            setLastSelectedId(null);
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
    const { data: contentsData, isLoading: isContentsLoading } = useQuery({
        queryKey: ['files', 'root'],
        queryFn: () => fileManagerService.getContents(),
    });

    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['storage-stats'],
        queryFn: fileManagerService.getStats,
    });

    const { data: recentData, isLoading: isRecentLoading } = useQuery({
        queryKey: ['recent-files'],
        queryFn: fileManagerService.getRecent,
    });

    const { data: deletedData } = useQuery({
        queryKey: ['deleted-items'],
        queryFn: fileManagerService.getDeleted,
    });

    // Mutations
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => fileManagerService.createFolder(name),
        onMutate: async (newFolderName) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData(['files', 'root']);

            // Optimistically update to the new value
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

            // Reset creation state immediately for smooth transition
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

    const restoreFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFolder(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
        },
    });

    const restoreFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFile(id),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
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
        onSettled: (data, error, id) => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            if (!error) {
                toast.success('Folder moved to Trash', {
                    action: {
                        label: 'Undo',
                        onClick: () => restoreFolderMutation.mutate(id)
                    }
                });
            }
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFile(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            await queryClient.cancelQueries({ queryKey: ['recent-files'] });

            const previousData = queryClient.getQueryData(['files', 'root']);
            const previousRecent = queryClient.getQueryData(['recent-files']);

            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                files: old?.files?.filter((f: any) => f.id !== id) || []
            }));

            queryClient.setQueryData(['recent-files'], (old: any) => {
                const currentFiles = Array.isArray(old) ? old : [];
                return currentFiles.filter((f: any) => f.id !== id);
            });

            return { previousData, previousRecent };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
            queryClient.setQueryData(['recent-files'], context?.previousRecent);
        },
        onSettled: (data, error, id) => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            if (!error) {
                toast.success('File moved to Trash', {
                    action: {
                        label: 'Undo',
                        onClick: () => restoreFileMutation.mutate(id)
                    }
                });
            }
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
        onError: (err, { id, name }, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
        },
    });

    const renameFileMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => fileManagerService.renameFile(id, name),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            await queryClient.cancelQueries({ queryKey: ['recent-files'] });

            const previousData = queryClient.getQueryData(['files', 'root']);
            const previousRecent = queryClient.getQueryData(['recent-files']);

            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                files: old?.files?.map((f: any) => f.id === id ? { ...f, name } : f) || []
            }));

            queryClient.setQueryData(['recent-files'], (old: any) => {
                const currentFiles = Array.isArray(old) ? old : [];
                return currentFiles.map((f: any) => f.id === id ? { ...f, name } : f);
            });

            return { previousData, previousRecent };
        },
        onError: (err, { id, name }, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
            queryClient.setQueryData(['recent-files'], context?.previousRecent);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
        },
    });

    const moveFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.moveFile(id, targetFolderId),
        onMutate: async ({ id, targetFolderId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            await queryClient.cancelQueries({ queryKey: ['recent-files'] });
            const previousData = queryClient.getQueryData(['files', 'root']);
            const previousRecent = queryClient.getQueryData(['recent-files']);

            // If moving to a folder (not root), remove from current root view
            if (targetFolderId !== null) {
                queryClient.setQueryData(['files', 'root'], (old: any) => ({
                    ...old,
                    files: old?.files?.filter((f: any) => f.id !== id) || []
                }));
                queryClient.setQueryData(['recent-files'], (old: any) => {
                    const currentFiles = Array.isArray(old) ? old : [];
                    return currentFiles.filter((f: any) => f.id !== id);
                });
            }
            return { previousData, previousRecent };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousData);
            queryClient.setQueryData(['recent-files'], context?.previousRecent);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
        },
    });

    const copyFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.copyFile(id, targetFolderId),
        onMutate: async ({ id, targetFolderId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);

            // If copying to root, show optimistic item
            if (targetFolderId === null) {
                const sourceFile = (previousData as any)?.files?.find((f: any) => f.id === id);
                if (sourceFile) {
                    const optimisticFile = {
                        ...sourceFile,
                        id: 'temp-' + Date.now(),
                        name: sourceFile.name + ' (Copy)',
                        isOptimistic: true
                    };
                    queryClient.setQueryData(['files', 'root'], (old: any) => ({
                        ...old,
                        files: [optimisticFile, ...(old?.files || [])]
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

    const moveFolderMutation = useMutation({
        mutationFn: ({ id, targetParentId }: { id: string, targetParentId: string | null }) => fileManagerService.moveFolder(id, targetParentId),
        onMutate: async ({ id, targetParentId }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);

            // If moving to another folder, remove from current view
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

    const updateColorMutation = useMutation({
        mutationFn: ({ id, color }: { id: string, color: string }) => fileManagerService.updateFolderColor(id, color),
        onMutate: async ({ id, color }) => {
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            const previousData = queryClient.getQueryData(['files', 'root']);
            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                folders: old?.folders?.map((f: any) => f.id === id ? { ...f, color } : f) || []
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

    const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'folder' | 'empty', target: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, target });
    };

    const copyToClipboard = (type: 'file' | 'folder', target: any) => {
        // If multiple items are selected and the target is one of them, copy all selected
        // Otherwise copy just the target
        let itemsToCopy: { type: 'file' | 'folder', item: any }[] = [];

        if (selectedItems.has(target.id)) {
            // Copy all selected items
            const allVisibleFolders = folders; // Assuming 'folders' is available in scope
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
        // Same logic as copy
        let itemsToCut: { type: 'file' | 'folder', item: any }[] = [];

        if (selectedItems.has(target.id)) {
            const allVisibleFolders = folders;
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
                    // Entering marking mode - keep current selection or start fresh
                    // If clicking on an item, add it to selection
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
                        // Try to find if it's a folder or file to call correct mutation
                        // This is a bit tricky without knowing type of each ID directly.
                        // We can check against visible lists.
                        const isFolder = folders.some((f: any) => f.id === id);
                        if (isFolder) {
                            deleteFolderMutation.mutate(id);
                        } else {
                            deleteFileMutation.mutate(id);
                        }
                        deletedCount++;
                    });

                    // Clear selection after delete
                    setSelectedItems(new Set());
                    toast.success(`Deleted ${deletedCount} items`);
                } else {
                    // Single delete
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
                    const targetFolderId = type === 'folder' ? target.id : null;

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
        mutationFn: (file: File) => fileManagerService.uploadFile(file),
        onMutate: async (newFile) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['files', 'root'] });
            await queryClient.cancelQueries({ queryKey: ['recent-files'] });

            // Snapshot previous values
            const previousFiles = queryClient.getQueryData(['files', 'root']);
            const previousRecent = queryClient.getQueryData(['recent-files']);

            const optimisticFile = {
                id: 'temp-' + Date.now(),
                name: newFile.name,
                size: newFile.size,
                mimeType: newFile.type,
                url: '',
                isOptimistic: true,
                updatedAt: new Date().toISOString()
            };

            // Update root files cache
            queryClient.setQueryData(['files', 'root'], (old: any) => ({
                ...old,
                files: [optimisticFile, ...(old?.files || [])]
            }));

            // Update recent files cache
            queryClient.setQueryData(['recent-files'], (old: any) => {
                const currentFiles = Array.isArray(old) ? old : [];
                return [optimisticFile, ...currentFiles];
            });

            return { previousFiles, previousRecent };
        },
        onError: (err, newFile, context) => {
            queryClient.setQueryData(['files', 'root'], context?.previousFiles);
            queryClient.setQueryData(['recent-files'], context?.previousRecent);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadFileMutation.mutate(e.target.files[0]);
        }
    };

    // Derived Data
    const folders = contentsData?.folders || [];
    const allFiles = contentsData?.files || []; // Files in root
    const recentFiles = recentData || [];

    // Helper to extract size from backend categories array
    const getCategorySize = (catName: string) => {
        if (!statsData?.categories || !Array.isArray(statsData.categories)) return 0;
        const category = statsData.categories.find((c: any) => c.name === catName);
        return category ? category.size : 0;
    };

    const stats = {
        totalUsed: statsData?.totalUsed || 0,
        totalLimit: statsData?.totalCapacity || 150 * 1024 * 1024 * 1024, // 150 GB Default
        breakdown: {
            images: getCategorySize('Images'),
            video: getCategorySize('Videos'),
            audio: getCategorySize('Audio'),
            archives: getCategorySize('Archives'),
            documents: getCategorySize('Documents'),
            fonts: getCategorySize('Fonts'),
            other: getCategorySize('Others')
        }
    };

    // Filter files for Quick Access
    const filteredFiles = selectedCategory
        ? allFiles.filter((f: any) => {
            const ext = (f.name || '').split('.').pop()?.toLowerCase() || '';
            const type = (f.mimeType || '').toLowerCase();

            switch (selectedCategory) {
                case 'Images':
                    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif'].includes(ext) || type.startsWith('image/');
                case 'Videos':
                    return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'].includes(ext) || type.startsWith('video/');
                case 'Audio':
                    return ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext) || type.startsWith('audio/');
                case 'Documents':
                    return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'].includes(ext) ||
                        type.includes('pdf') || type.includes('document') || type.includes('spreadsheet') || type.includes('text');
                case 'Archives':
                    return ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext) ||
                        type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('archive');
                case 'Fonts':
                    return ['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext) || type.includes('font');
                default:
                    return true;
            }
        })
        : recentFiles;


    const getFileIconPath = (name: string, mimeType: string) => {
        const ext = (name || '').split('.').pop()?.toLowerCase() || '';
        const mime = (mimeType || '').toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif'].includes(ext) || mime.startsWith('image/'))
            return '/svg/image_icon.svg';
        if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'].includes(ext) || mime.startsWith('video/'))
            return '/svg/videos_icon.svg';
        if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext) || mime.startsWith('audio/'))
            return '/svg/audios_icon.svg';
        if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(ext) ||
            mime.includes('pdf') || mime.includes('document') || mime.includes('spreadsheet') || mime.includes('text'))
            return '/svg/files_icon.svg';
        if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext) || mime.includes('font'))
            return '/svg/fonts_icon.svg';
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext) ||
            mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('archive'))
            return '/svg/archieves_icon.svg';

        return '/svg/files_icon.svg';
    };

    // Helper for icons based on mime type
    const getFileIcon = (mimeType: string) => {
        const mime = (mimeType || '').toLowerCase();
        if (mime.startsWith('image/')) return <Image src="/svg/image_icon.svg" width={30} height={30} alt="Image" />;
        if (mime.startsWith('video/')) return <Image src="/svg/videos_icon.svg" width={30} height={30} alt="Video" />;
        if (mime.startsWith('audio/')) return <Image src="/svg/audios_icon.svg" width={30} height={30} alt="Audio" />;
        if (mime.includes('pdf') || mime.includes('document') || mime.includes('spreadsheet') || mime.includes('text'))
            return <Image src="/svg/files_icon.svg" width={30} height={30} alt="Doc" />;
        if (mime.includes('font')) return <Image src="/svg/fonts_icon.svg" width={30} height={30} alt="Font" />;
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar'))
            return <Image src="/svg/archieves_icon.svg" width={30} height={30} alt="Archive" />;
        return <Image src="/svg/files_icon.svg" width={30} height={30} alt="File" />;
    };

    // Helper to get clean file type label
    const getFileTypeLabel = (mimeType: string, filename: string) => {
        const mime = (mimeType || '').toLowerCase();
        const ext = filename?.split('.').pop()?.toUpperCase() || '';

        if (mime.startsWith('image/')) return ext || 'IMAGE';
        if (mime.startsWith('video/')) return ext || 'VIDEO';
        if (mime.startsWith('audio/')) return ext || 'AUDIO';
        if (mime === 'application/pdf') return 'PDF';
        if (mime.includes('word') || mime.includes('officedocument.word') || ext === 'DOC' || ext === 'DOCX') return 'DOC';
        if (mime.includes('spreadsheet') || mime.includes('excel') || ext === 'XLS' || ext === 'XLSX' || ext === 'CSV') return 'CELL';
        if (mime.includes('presentation') || mime.includes('powerpoint') || ext === 'PPT' || ext === 'PPTX') return 'SLIDE';
        if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar') || mime.includes('7z')) return 'ZIP';
        if (mime.includes('font') || ext === 'TTF' || ext === 'OTF') return 'FONT';

        return ext || 'FILE';
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

    // Helper for random color based on ID
    const getFolderHue = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash % 360);
    };

    return (
        <div className="flex bg-[#F2F7FA] min-h-screen">
            {/* Main Content Area Wrapper */}
            <div
                className="flex-1 overflow-auto p-12 pr-8"
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
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className={`text-[24px] font-semibold text-[#1A1A1A] ${sourceSans.className}`}>Folders</h1>
                    <div className="flex gap-4">
                        <AddNewDropdown
                            onCreateFolder={() => setIsCreatingFolder(true)}
                            onShowUploadModal={() => setIsUploadModalOpen(true)}
                        />
                    </div>
                </div>

                {/* Folders List */}
                <div className="grid grid-cols-3 gap-6 mb-12 relative">
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
                                                if (e.key === 'Enter') handleCreateFolder();
                                                if (e.key === 'Escape') cancelCreateFolder();
                                            }}
                                        />
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {isContentsLoading ? (
                        [1, 2, 3].map((i) => <FolderCardSkeleton key={i} />)
                    ) : (
                        folders.slice(0, 3).map((folder: any) => {
                            const isSelected = selectedItems.has(folder.id);
                            return (
                                <div
                                    key={folder.id}
                                    data-folder-item
                                    onClick={(e) => !folder.isOptimistic && handleItemSelect(e, folder.id, 'folder', folders)}
                                    onDoubleClick={() => !folder.isOptimistic && handleItemOpen(folder.id, 'folder', folder)}
                                    onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
                                    className={`bg-white rounded-[12px] p-5 relative transition-all min-h-[120px] ${folder.isOptimistic ? 'opacity-50 cursor-default' : 'cursor-pointer hover:shadow-lg'} ${isSelected ? 'ring-2 ring-[#00AAFF] bg-[#F0F9FF]' : ''}`}
                                >
                                    {/* Checkbox for marking mode */}
                                    {isMarkingMode && (
                                        <div
                                            className="absolute top-3 left-3 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItems(prev => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(folder.id)) {
                                                        newSet.delete(folder.id);
                                                    } else {
                                                        newSet.add(folder.id);
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
                                    <div className="flex flex-col h-full gap-3 min-w-0">
                                        <Image
                                            src="/svg/folder_icon.svg"
                                            alt="folder"
                                            width={48}
                                            height={48}
                                            style={folder.color ? getFolderStyle(folder.color) : {}}
                                        />
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
                                                className="w-full bg-white border border-[#00AAFF] rounded px-2 py-1 text-[15px] font-bold text-[#1A1A1A] outline-none"
                                            />
                                        ) : (
                                            <>
                                                <h3 className="font-bold text-[#1A1A1A] text-[15px] truncate" title={folder.name}>
                                                    {folder.name}
                                                </h3>
                                                {!folder.isOptimistic && (
                                                    <p className="text-[#8F9BB3] text-[12px] mt-1 whitespace-nowrap truncate">
                                                        {formatSize(folder.size)} ({folder._count?.files || 0} Files, {folder._count?.children || 0} Folders)
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <FolderProgress percentage={getPercentage(folder.size, stats.totalUsed)} />
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* View All Arrow */}
                    <button
                        onClick={() => router.push('/file-manager/folders')}
                        className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white border border-[#F1F4F9] rounded-full p-3 shadow-md hover:bg-gray-50 z-10"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    {folders.length === 0 && !isContentsLoading && (
                        <div className="col-span-3 py-10 text-center text-[#8F9BB3]">
                            The folder is empty
                        </div>
                    )}
                </div>

                {/* Quick Access */}
                <div className="mb-12">
                    <h2 className="text-[20px] font-bold mb-6 text-[#1A1A1A]">Quick Access</h2>
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {isContentsLoading ? (
                            [1, 2, 3, 4, 5, 6].map((i) => <CategorySkeleton key={i} />)
                        ) : (
                            [
                                { label: 'Images', icon: '/svg/image_icon.svg' },
                                { label: 'Videos', icon: '/svg/videos_icon.svg' },
                                { label: 'Audio', icon: '/svg/audios_icon.svg' },
                                { label: 'Archives', label2: 'Archieves', icon: '/svg/archieves_icon.svg' },
                                { label: 'Documents', icon: '/svg/files_icon.svg' },
                                { label: 'Fonts', icon: '/svg/fonts_icon.svg' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    onClick={() => router.push(`/file-manager/category/${item.label.toLowerCase()}`)}
                                    className={`flex flex-col items-center gap-3 cursor-pointer group min-w-[80px]`}
                                >
                                    <div className={`w-[70px] h-[70px] p-[15px] rounded-[10px] bg-white flex items-center justify-center transition-all ${selectedCategory === item.label ? 'ring-2 ring-[#00AAFF]' : ''}`}>
                                        <Image src={item.icon} width={32} height={32} alt={item.label} />
                                    </div>
                                    <span className={`font-semibold text-[14px] ${selectedCategory === item.label ? 'text-[#00AAFF]' : 'text-[#1A1A1A]'}`}>
                                        {item.label2 || item.label}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Files */}
                <div className="bg-white rounded-[24px] p-8 shadow-sm">
                    <h2 className="text-[20px] font-bold mb-8 text-[#1A1A1A]">
                        {selectedCategory ? `${selectedCategory}` : 'Recent Files'}
                    </h2>
                    <table className="w-full border-collapse">
                        <thead className="text-[#1A1A1A] text-[14px] font-bold border-b border-gray-100">
                            <tr>
                                <th className="text-left py-6 pl-6 w-[40%]">Name</th>
                                <th className="text-center py-6 w-[20%]">Last Modified</th>
                                <th className="text-center py-6 w-[20%]">File type</th>
                                <th className="text-right py-6 pr-6 w-[20%]">File size</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px]">
                            {isRecentLoading || isContentsLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="py-2">
                                            <TableRowSkeleton />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredFiles.slice(0, 10).map((file: any) => {
                                    const isSelected = selectedItems.has(file.id);
                                    return (
                                        <tr
                                            key={file.id}
                                            data-file-item
                                            onContextMenu={(e) => handleContextMenu(e, 'file', file)}
                                            className={`group transition-colors cursor-pointer ${file.isOptimistic ? 'opacity-50 pointer-events-none' : ''} ${isSelected ? 'bg-[#E0F2FE]' : 'hover:bg-[#F2F7FA]'}`}
                                            onClick={(e) => !file.isOptimistic && handleItemSelect(e, file.id, 'file', filteredFiles)}
                                            onDoubleClick={() => !file.isOptimistic && handleItemOpen(file.id, 'file', file)}
                                        >
                                            <td className="py-4 pl-6 flex items-center gap-4 relative">
                                                {/* Checkbox for marking mode */}
                                                {isMarkingMode && (
                                                    <div
                                                        className="mr-2"
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
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-[#00AAFF] border-[#00AAFF]' : 'bg-white border-gray-300 hover:border-[#00AAFF]'}`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className={`min-w-[50px] min-h-[50px] w-[50px] h-[50px] flex items-center justify-center rounded-[16px] ${isSelected ? 'bg-[#BAE6FD]' : 'bg-[#F9FBFF]'}`}>
                                                    <div className="transform scale-75">
                                                        {getFileIcon(file.mimeType)}
                                                    </div>
                                                </div>
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
                                                        className="bg-white border border-[#00AAFF] rounded px-2 py-1 text-[14px] font-medium text-[#1A1A1A] outline-none"
                                                    />
                                                ) : (
                                                    <span className="font-normal text-[#1A1A1A] text-[15px] truncate max-w-[200px]" title={file.name}>
                                                        {file.isOptimistic ? 'Saving...' : file.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 text-center text-[#8F9BB3] font-medium">{file.isOptimistic ? '-' : new Date(file.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="py-4 text-center text-[#8F9BB3] uppercase font-medium">{getFileTypeLabel(file.mimeType, file.name)}</td>
                                            <td className="py-4 text-right pr-6 text-[#8F9BB3] font-medium">{formatSize(file.size)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {filteredFiles.length === 0 && (
                        <div className="py-20 text-center text-[#8F9BB3]">
                            The folder is empty
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar - Storage Usage */}
            <div className="w-[450px] pr-12 pb-12 flex flex-col sticky top-0 h-screen">
                {isStatsLoading ? (
                    <StorageStatsSkeleton />
                ) : (
                    <div className="bg-white rounded-[24px] p-8 flex flex-col h-full shadow-sm overflow-hidden">
                        <h2 className="text-[22px] font-bold mb-10 text-center text-[#1A1A1A]">Storage usage</h2>
                        {/* Scrollable content area */}
                        <div className="overflow-y-auto flex-1 pr-0 scrollbar-hide pb-4">
                            {/* Storage Gauge */}
                            <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                                    <defs>
                                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={
                                                stats.totalUsed < 10 * 1024 * 1024 * 1024 ? "#00AAFF" :
                                                    stats.totalUsed < 50 * 1024 * 1024 * 1024 ? "#FFC107" : "#D32F2F"
                                            } />
                                            <stop offset="100%" stopColor={
                                                stats.totalUsed < 10 * 1024 * 1024 * 1024 ? "#00ECFF" :
                                                    stats.totalUsed < 50 * 1024 * 1024 * 1024 ? "#FFD54F" : "#EF5350"
                                            } />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M 50 150 A 70 70 0 1 1 150 150"
                                        fill="none"
                                        stroke="#F2F7FA"
                                        strokeWidth="16"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M 50 150 A 70 70 0 1 1 150 150"
                                        fill="none"
                                        stroke="url(#gaugeGradient)"
                                        strokeWidth="16"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="relative z-10 text-center flex flex-col items-center justify-center p-4">
                                    <span className={`text-[30px] font-medium text-[#1A1A1A] leading-tight ${sourceSans.className}`}>
                                        {formatSize(stats.totalUsed)}
                                    </span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-6 mb-12">
                                {(() => {
                                    const allCategories = [
                                        { label: 'Images', size: stats.breakdown.images, color: '#FF5252', icon: '/svg/image_icon.svg' },
                                        { label: 'Videos', size: stats.breakdown.video, color: '#448AFF', icon: '/svg/videos_icon.svg' },
                                        { label: 'Audio', size: stats.breakdown.audio, color: '#FFB300', icon: '/svg/audios_icon.svg' },
                                        { label: 'Archives', size: stats.breakdown.archives, color: '#7E57C2', icon: '/svg/archieves_icon.svg' },
                                        { label: 'Documents', size: stats.breakdown.documents, color: '#00E676', icon: '/svg/files_icon.svg' },
                                        { label: 'Fonts', size: stats.breakdown.fonts, color: '#FF7043', icon: '/svg/fonts_icon.svg' }
                                    ].sort((a, b) => b.size - a.size);

                                    const displayedCategories = showAllCategories ? allCategories : allCategories.slice(0, 3);
                                    const remainingCount = allCategories.length - 3;

                                    return (
                                        <>
                                            {displayedCategories.map((cat) => (
                                                <div key={cat.label} className="flex items-center gap-4">
                                                    <div className="w-12 h-12 min-w-[48px] rounded-[12px] bg-[#F9FBFF] flex items-center justify-center border border-gray-50">
                                                        <Image src={cat.icon} width={24} height={24} alt={cat.label} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="font-bold text-[#1A1A1A] text-[15px]">{cat.label}</span>
                                                            <span className="font-bold text-[#1A1A1A] text-[14px]">{formatSize(cat.size)}</span>
                                                        </div>
                                                        <div className="h-2.5 bg-[#F2F7FA] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${Math.min(100, (cat.size / (stats.totalUsed || 1)) * 100)}%`,
                                                                    backgroundColor: cat.color
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {!showAllCategories && remainingCount > 0 && (
                                                <button
                                                    onClick={() => setShowAllCategories(true)}
                                                    className="text-[#8F9BB3] text-[14px] font-bold pl-16 mt-2 hover:text-[#1A1A1A] transition-colors"
                                                >
                                                    +{remainingCount} More
                                                </button>
                                            )}
                                            {showAllCategories && allCategories.length > 3 && (
                                                <button
                                                    onClick={() => setShowAllCategories(false)}
                                                    className="text-[#8F9BB3] text-[15px] font-bold pl-[94px] mt-2 hover:text-[#1A1A1A] transition-colors"
                                                >
                                                    Show Less
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Recently Deleted Section */}
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[20px] font-bold text-[#1A1A1A]">Recently deleted</h3>
                                    <button
                                        onClick={() => router.push('/file-manager/recycle-bin')}
                                        className="text-[#00AAFF] text-[15px] font-bold hover:underline"
                                    >
                                        See all
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {(() => {
                                        const allDeleted = [
                                            ...(deletedData?.files || []).map((f: any) => ({ ...f, type: 'file' })),
                                            ...(deletedData?.folders || []).map((f: any) => ({ ...f, type: 'folder' }))
                                        ].sort((a: any, b: any) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

                                        const displayItems = allDeleted.slice(0, 3);
                                        if (displayItems.length === 0) return <div className="text-center text-[#8F9BB3] text-[14px] py-4">No deleted items</div>;

                                        return displayItems.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-[16px] bg-[#F9FBFF] flex items-center justify-center border border-gray-50">
                                                        <Image
                                                            src={item.type === 'folder' ? '/svg/folder_icon.svg' : getFileIconPath(item.name, item.mimeType)}
                                                            width={24}
                                                            height={24}
                                                            alt={item.name}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-[15px] text-[#1A1A1A] truncate max-w-[150px]">{item.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => item.id && (item.type === 'folder' ? restoreFolderMutation.mutate(item.id) : restoreFileMutation.mutate(item.id))}
                                                    className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:bg-[#F2F7FA] rounded-full transition-all"
                                                >
                                                    <RotateCcw size={20} />
                                                </button>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>
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
                    hasClipboard={!!clipboard}
                    isMarkingMode={isMarkingMode}
                    selectedCount={selectedItems.size}
                    onClose={() => setContextMenu(null)}
                    onAction={handleContextAction}
                />
            )}
        </div>
    );
}
