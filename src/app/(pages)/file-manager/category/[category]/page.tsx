"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { ChevronLeft } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import Image from 'next/image';
import { useFileOpener, getFileType } from '@/components/file-opener';
import { FileUploadModal } from '@/components/file-manager/upload-file-modal';
import { ContextMenu } from '@/components/file-manager/context-menu';
import { useClipboard } from '@/context/clipboard-context';
import { FileCardSkeleton } from '@/components/file-manager/skeletons';
import { PropertiesModal } from '@/components/file-manager/properties-modal';

// Helper Functions
function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface FileItem {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    updatedAt: string;
    url: string;
    isS3?: boolean;
}

// File type helpers
const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif'];
const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'];
const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'];
const fontExts = ['ttf', 'otf', 'woff', 'woff2', 'eot'];
const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

const getFileExtension = (filename: string) => filename?.split('.').pop()?.toLowerCase() || '';
const isImageFile = (name: string, mime: string) => imageExts.includes(getFileExtension(name)) || mime?.startsWith('image/');

const getFileIconPath = (name: string, mime: string): string => {
    const ext = getFileExtension(name);
    if (imageExts.includes(ext) || mime?.startsWith('image/')) return '/svg/image_icon.svg';
    if (videoExts.includes(ext) || mime?.startsWith('video/')) return '/svg/videos_icon.svg';
    if (audioExts.includes(ext) || mime?.startsWith('audio/')) return '/svg/audios_icon.svg';
    if (documentExts.includes(ext) || mime?.includes('pdf') || mime?.includes('document')) return '/svg/files_icon.svg';
    if (fontExts.includes(ext) || mime?.includes('font')) return '/svg/fonts_icon.svg';
    if (archiveExts.includes(ext) || mime?.includes('zip') || mime?.includes('rar')) return '/svg/archieves_icon.svg';
    return '/svg/files_icon.svg';
};

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { openFile } = useFileOpener();
    const category = params.category as string;
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Global Clipboard Context
    const { clipboard, copyToClipboard, cutToClipboard, clearClipboard } = useClipboard();

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'file' | 'folder' | 'empty', target: any } | null>(null);

    // Rename state
    const [renamingItem, setRenamingItem] = useState<{ id: string, name: string, type: 'file' | 'folder' } | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Properties Modal State
    const [propertiesModal, setPropertiesModal] = useState<{ isOpen: boolean, item: any, type: 'file' | 'folder' }>({ isOpen: false, item: null, type: 'folder' });

    useEffect(() => {
        if (renamingItem?.id && renameInputRef.current) {
            const timer = setTimeout(() => {
                renameInputRef.current?.focus();
                renameInputRef.current?.select();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [renamingItem?.id]);

    // Queries
    const { data: files = [], isLoading: loading } = useQuery({
        queryKey: ['category-files', category],
        queryFn: async () => {
            const { data } = await api.get(`/file-manager/category/${category}`);
            return data as FileItem[];
        },
        enabled: !!category,
    });

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => fileManagerService.uploadFile(file),
        onMutate: async (newFile) => {
            await queryClient.cancelQueries({ queryKey: ['category-files', category] });
            const previousData = queryClient.getQueryData(['category-files', category]);

            const optimisticFile = {
                id: 'temp-' + Date.now(),
                name: newFile.name,
                size: newFile.size,
                mimeType: newFile.type,
                url: '',
                isOptimistic: true,
                updatedAt: new Date().toISOString()
            };

            queryClient.setQueryData(['category-files', category], (old: any) => [optimisticFile, ...(old || [])]);
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['category-files', category], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['category-files', category] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFile(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['category-files', category] });
            const previousData = queryClient.getQueryData(['category-files', category]);
            queryClient.setQueryData(['category-files', category], (old: any) => old?.filter((f: any) => f.id !== id) || []);
            return { previousData };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['category-files', category], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['category-files', category] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const renameFileMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => fileManagerService.renameFile(id, name),
        onMutate: async ({ id, name }) => {
            await queryClient.cancelQueries({ queryKey: ['category-files', category] });
            const previousData = queryClient.getQueryData(['category-files', category]);
            queryClient.setQueryData(['category-files', category], (old: any) => old?.map((f: any) => f.id === id ? { ...f, name } : f) || []);
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['category-files', category], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['category-files', category] });
        },
    });

    const moveFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.moveFile(id, targetFolderId),
        onMutate: async ({ id, targetFolderId }) => {
            await queryClient.cancelQueries({ queryKey: ['category-files', category] });
            const previousData = queryClient.getQueryData(['category-files', category]);
            queryClient.setQueryData(['category-files', category], (old: any) => old?.filter((f: any) => f.id !== id) || []);
            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['category-files', category], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['category-files', category] });
        },
    });

    const copyFileMutation = useMutation({
        mutationFn: ({ id, targetFolderId }: { id: string, targetFolderId: string | null }) => fileManagerService.copyFile(id, targetFolderId),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['category-files', category] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    const handleContextMenu = (e: React.MouseEvent, type: 'file' | 'folder' | 'empty', target: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, target });
    };

    const handleContextAction = async (action: 'copy' | 'cut' | 'rename' | 'delete' | 'paste' | 'properties' | 'color', color?: string) => {
        if (!contextMenu) return;
        const { type, target } = contextMenu;
        setContextMenu(null);

        switch (action) {
            case 'copy':
                copyToClipboard([{ type: type as any, item: target }]);
                break;
            case 'cut':
                cutToClipboard([{ type: type as any, item: target }]);
                break;
            case 'rename':
                setRenamingItem({ id: target.id, name: target.name, type: type as any });
                break;
            case 'delete':
                if (type === 'file') deleteFileMutation.mutate(target.id);
                break;
            case 'properties':
                setPropertiesModal({ isOpen: true, item: target, type: type as any });
                break;
            case 'color':
                // Files don't have color, but type requirement
                break;
            case 'paste':
                if (clipboard) {
                    const targetFolderId = type === 'folder' ? target.id : null;
                    if (clipboard.action === 'cut') {
                        if (clipboard.type === 'folder') Promise.resolve(); // Folders not in category view
                        else moveFileMutation.mutate({ id: clipboard.item.id, targetFolderId: targetFolderId });
                        clearClipboard();
                    } else {
                        if (clipboard.type === 'folder') Promise.resolve();
                        else copyFileMutation.mutate({ id: clipboard.item.id, targetFolderId: targetFolderId });
                    }
                }
                break;
        }
    };

    const handleRenameSubmit = () => {
        if (renamingItem) {
            if (renamingItem.type === 'file') {
                renameFileMutation.mutate({ id: renamingItem.id, name: renamingItem.name });
            }
            setRenamingItem(null);
        }
    };

    const capitalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
    const getDisplayName = (name: string) => name.split('/').pop() || name;

    return (
        <div
            className="min-h-[calc(100vh-64px)] bg-white p-8 flex flex-col"
            onContextMenu={(e) => {
                const target = e.target as HTMLElement;
                const isOnItem = target.closest('[data-file-item]');
                if (!isOnItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContextMenu(e, 'empty', null);
                }
            }}
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#009DFF] transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-[20px] font-semibold text-[#1A1A1A]">
                        {capitalizedCategory}
                    </h1>
                </div>
            </div>

            <div className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <FileCardSkeleton key={`cate-skele-${i}`} />)}
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-20 text-[#8F9BB3]">The folder is empty</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {files.map((file: any) => (
                            <div
                                key={file.id}
                                data-file-item
                                className={`bg-[#EEF5FA] rounded-[20px] overflow-hidden cursor-pointer transition-all group p-[10px] hover:shadow-sm ${file.isOptimistic ? 'opacity-50 pointer-events-none' : ''}`}
                                onContextMenu={(e) => handleContextMenu(e, 'file', file)}
                                onClick={() => openFile({
                                    url: file.url,
                                    name: file.name,
                                    type: getFileType(file.url)
                                })}
                            >
                                <div className="aspect-[4/3] bg-white rounded-[12px] relative overflow-hidden">
                                    {isImageFile(file.name, file.mimeType) ? (
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
                                                {getDisplayName(file.name)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                />
            )}
        </div>
    );
}
