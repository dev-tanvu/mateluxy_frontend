"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { ChevronLeft, Plus, MoreVertical } from 'lucide-react';
import Image from 'next/image';

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

// Get the correct SVG icon path based on file type
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
    const category = params.category as string;
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (category) {
            fetchFiles();
        }
    }, [category]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/file-manager/category/${category}`);
            setFiles(data);
        } catch (error) {
            console.error('Failed to fetch category files:', error);
        } finally {
            setLoading(false);
        }
    };

    const capitalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

    // Get display name from filename (remove path if any)
    const getDisplayName = (name: string) => {
        const parts = name.split('/');
        return parts[parts.length - 1];
    };

    // Check if file is an image for thumbnail display
    const isImage = (mimeType: string) => mimeType?.toLowerCase().startsWith('image/');

    return (
        <div className="flex bg-white min-h-screen">
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
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
                    <button className="flex items-center gap-2 text-[#009DFF] font-medium hover:opacity-80 transition-opacity">
                        <Plus size={20} />
                        Add new
                    </button>
                </div>



                {/* File Grid */}
                {loading ? (
                    <div className="text-center py-20 text-[#8F9BB3]">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="text-center py-20 text-[#8F9BB3]">No files found</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-[#EEF5FA] rounded-[20px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow group p-[10px]"
                                onClick={() => window.open(file.url, '_blank')}
                            >
                                {/* Thumbnail Area */}
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

                                {/* File Info */}
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Image
                                            src={getFileIconPath(file.name, file.mimeType)}
                                            width={20}
                                            height={20}
                                            alt=""
                                        />
                                        <span className="text-[13px] text-[#1A1A1A] truncate" title={getDisplayName(file.name)}>
                                            {getDisplayName(file.name)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); /* TODO: Options menu */ }}
                                        className="p-1 text-[#8F9BB3] hover:text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
