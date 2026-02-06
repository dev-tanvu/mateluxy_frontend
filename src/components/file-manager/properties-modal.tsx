import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getFolderStyle } from '@/lib/utils/folder-colors';
import { fileManagerService } from '@/services/file-manager.service';

interface PropertiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any; // Folder or File object
    type: 'file' | 'folder';
}

function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string) {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

export function PropertiesModal({ isOpen, onClose, item, type }: PropertiesModalProps) {
    const [locationPath, setLocationPath] = useState<string>('Loading...');

    useEffect(() => {
        if (isOpen && item) {
            setLocationPath('Loading...');
            fileManagerService.getItemPath(item.id, type)
                .then(path => setLocationPath(path))
                .catch(err => {
                    console.error('Failed to get item path:', err);
                    setLocationPath('Unknown');
                });
        }
    }, [isOpen, item, type]);

    if (!isOpen || !item) return null;

    const iconSrc = type === 'folder'
        ? '/svg/folder_icon.svg'
        : getFileIconPath(item.name, item.mimeType);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-[400px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-[#1A1A1A] text-lg">Properties</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Icon & Name */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="relative w-20 h-20">
                            <Image
                                src={iconSrc}
                                alt={type}
                                fill
                                className="object-contain"
                                style={type === 'folder' ? getFolderStyle(item.color) : {}}
                            />
                        </div>
                        <div className="text-center">
                            <h2 className="font-bold text-xl text-[#1A1A1A] break-all">{item.name}</h2>
                            {/* Line separating header from details */}
                            <div className="w-full h-[1px] bg-gray-200 mt-4 mb-2"></div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Type:</span>
                            <span className="text-[#1A1A1A] font-medium">{type === 'folder' ? 'File Folder' : (item.mimeType || 'Unknown File')}</span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Location:</span>
                            <span className="text-[#1A1A1A] break-all">
                                {locationPath}
                            </span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Size:</span>
                            <span className="text-[#1A1A1A]">{formatSize(item.size)}</span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Contains:</span>
                            <span className="text-[#1A1A1A]">
                                {type === 'folder'
                                    ? `${item._count?.files || 0} Files, ${item._count?.children || 0} Folders`
                                    : '1 File'}
                            </span>
                        </div>

                        <div className="w-full h-[1px] bg-gray-100 my-2"></div>

                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Created:</span>
                            <span className="text-[#1A1A1A]">{formatDate(item.createdAt)}</span>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] items-baseline">
                            <span className="text-[#8F9BB3] font-medium">Modified:</span>
                            <span className="text-[#1A1A1A]">{formatDate(item.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#00AAFF] text-white font-bold rounded-lg hover:bg-[#0099E6] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helpers
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
