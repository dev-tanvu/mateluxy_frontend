'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Cloud, MoreVertical } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Source_Sans_3 } from 'next/font/google';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

// File type helpers from FolderPage
const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'ico', 'avif'];
const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'];
const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'];
const documentExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp'];
const fontExts = ['ttf', 'otf', 'woff', 'woff2', 'eot'];
const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

const getFileExtension = (filename: string) => filename?.split('.').pop()?.toLowerCase() || '';
const isImageFile = (name: string, type: string) => imageExts.includes(getFileExtension(name)) || type?.startsWith('image/');
const isVideoFile = (name: string, type: string) => videoExts.includes(getFileExtension(name)) || type?.startsWith('video/');
const isAudioFile = (name: string, type: string) => audioExts.includes(getFileExtension(name)) || type?.startsWith('audio/');
const isDocumentFile = (name: string, type: string) => documentExts.includes(getFileExtension(name)) || type?.includes('pdf') || type?.includes('document') || type?.includes('spreadsheet');
const isFontFile = (name: string, type: string) => fontExts.includes(getFileExtension(name)) || type?.includes('font');
const isArchiveFile = (name: string, type: string) => archiveExts.includes(getFileExtension(name)) || type?.includes('zip') || type?.includes('rar') || type?.includes('tar');

const getFileIconPath = (name: string, type: string): string => {
    if (isImageFile(name, type)) return '/svg/image_icon.svg';
    if (isVideoFile(name, type)) return '/svg/videos_icon.svg';
    if (isAudioFile(name, type)) return '/svg/audios_icon.svg';
    if (isDocumentFile(name, type)) return '/svg/files_icon.svg';
    if (isFontFile(name, type)) return '/svg/fonts_icon.svg';
    if (isArchiveFile(name, type)) return '/svg/archieves_icon.svg';
    return '/svg/files_icon.svg';
};

import { useUpload } from '../upload-manager/upload-context';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload?: (files: File[]) => void; // Keep for compatibility if needed
    folderId?: string;
}

interface FileCardProps {
    // ... (rest of the interface)
    file: File;
    onRemove: () => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const isImage = isImageFile(file.name, file.type);

    React.useEffect(() => {
        if (isImage) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file, isImage]);

    return (
        <div className="bg-[#EEF5FA] rounded-[20px] overflow-hidden group p-[10px] transition-all relative w-[180px] flex-shrink-0">
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-white rounded-[12px] relative overflow-hidden flex items-center justify-center">
                {isImage && previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Image
                            src={getFileIconPath(file.name, file.type)}
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
                        src={getFileIconPath(file.name, file.type)}
                        width={20}
                        height={20}
                        alt=""
                    />
                    <span className={cn("text-[13px] text-[#1A1A1A] truncate font-medium", sourceSans.className)} title={file.name}>
                        {file.name}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="p-1 text-[#8F9BB3] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

export function FileUploadModal({ isOpen, onClose, onUpload, folderId }: FileUploadModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const { addUploads } = useUpload();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            const filesArray = Array.from(e.dataTransfer.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            addUploads(selectedFiles, folderId);
            if (onUpload) {
                onUpload(selectedFiles);
            }
            setSelectedFiles([]);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent showCloseButton={false} className="w-[861px] max-w-[861px] h-[446px] p-0 bg-white rounded-[24px] border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col sm:max-w-[861px]">
                <div className="flex-1 flex flex-col p-10 relative">
                    <DialogHeader className="flex flex-row items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <DialogTitle className={cn("text-[20px] font-medium text-[#101828]", sourceSans.className)}>
                                Upload new file
                            </DialogTitle>
                            {selectedFiles.length > 0 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "px-4 py-1.5 border border-[#D0D5DD] rounded-[8px] font-semibold text-[#344054] hover:bg-gray-50 transition-colors text-[13px] shadow-sm ml-2",
                                        sourceSans.className
                                    )}
                                >
                                    Browse File
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-[#667085] hover:text-[#101828] transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </DialogHeader>

                    <div
                        className="flex-1 overflow-hidden"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {selectedFiles.length === 0 ? (
                            <div
                                className={cn(
                                    "h-full flex flex-col items-center justify-center border-[1px] border-dashed rounded-[16px] transition-all",
                                    isDragging
                                        ? "border-[#00ADEF] bg-[#F5FBFF]"
                                        : "border-[#D0D5DD] bg-white hover:border-[#00ADEF] hover:bg-[#F9FBFF]"
                                )}
                            >
                                {/* Custom Cloud Check Icon */}
                                <div className="mb-4 flex items-center justify-center">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#101828]">
                                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                        <path d="m9 16 3 3 6-6" />
                                    </svg>
                                </div>

                                <p className={cn("text-[18px] font-medium text-[#101828] mb-1", sourceSans.className)}>
                                    Choose a file or drag & drop it here
                                </p>
                                <p className={cn("text-[14px] text-[#667085] mb-6", sourceSans.className)}>
                                    JPEG, PNG, PDG, and more formats, up to 50MB
                                </p>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "px-6 py-2.5 border border-[#D0D5DD] rounded-[8px] font-semibold text-[#344054] hover:bg-gray-50 transition-colors text-[14px] shadow-sm",
                                        sourceSans.className
                                    )}
                                >
                                    Browse File
                                </button>
                            </div>
                        ) : (
                            <div className={cn(
                                "h-full flex items-center gap-6 overflow-x-auto pb-4 pr-2 custom-scrollbar transition-all",
                                isDragging && "bg-[#F5FBFF] ring-2 ring-[#00ADEF] ring-inset rounded-[16px]"
                            )}>
                                {selectedFiles.map((file, index) => (
                                    <FileCard
                                        key={`${file.name}-${index}-${file.size}`}
                                        file={file}
                                        onRemove={() => removeFile(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                    />

                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={handleUpload}
                            disabled={selectedFiles.length === 0}
                            className={cn(
                                "px-8 py-3 bg-[#E0F5FF] text-[#00ADEF] rounded-[8px] font-bold hover:bg-[#D0F0FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[16px]",
                                sourceSans.className
                            )}
                        >
                            Upload file
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
