'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import { ChevronLeft, Plus, MoreVertical, Upload, FolderPlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

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

    const [activeTab, setActiveTab] = useState('All');
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

    // Queries
    const { data: contentsData, isLoading } = useQuery({
        queryKey: ['files', folderId],
        queryFn: () => fileManagerService.getContents(folderId),
        enabled: !!folderId,
    });

    // Mutations
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => fileManagerService.createFolder(name, folderId),
        onSuccess: () => {
            setIsCreateFolderOpen(false);
            queryClient.invalidateQueries({ queryKey: ['files', folderId] });
        },
    });

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => fileManagerService.uploadFile(file, folderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', folderId] }),
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadFileMutation.mutate(e.target.files[0]);
            setIsAddMenuOpen(false);
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

    if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#8F9BB3]">Loading...</div>;

    return (
        <div className="min-h-screen bg-white p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-[#1A1A1A] hover:text-[#009DFF]">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-[20px] font-semibold text-[#1A1A1A]">{currentFolderName}</h1>
                </div>

                {/* Add New Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                        className="flex items-center gap-2 text-[#009DFF] font-medium hover:opacity-80"
                    >
                        <Plus size={20} />
                        Add new
                    </button>

                    {isAddMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[#E4E9F2] py-2 min-w-[180px] z-10">
                            <button
                                onClick={() => { setIsCreateFolderOpen(true); setIsAddMenuOpen(false); }}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F9FBFF] text-[#1A1A1A] text-[14px]"
                            >
                                <FolderPlus size={18} className="text-[#8F9BB3]" />
                                Create new folder
                            </button>
                            <label className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F9FBFF] text-[#1A1A1A] text-[14px] cursor-pointer">
                                <Upload size={18} className="text-[#8F9BB3]" />
                                Upload new file
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}
                </div>
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

            {/* Content Grid */}
            {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                <div className="text-center py-20 text-[#8F9BB3]">No items found</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* Folders */}
                    {filteredFolders.map((folder: any) => (
                        <div
                            key={folder.id}
                            onClick={() => router.push(`/file-manager/folder/${folder.id}`)}
                            className="bg-[#FAFBFC] rounded-[16px] p-4 cursor-pointer hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center justify-center py-6">
                                <Image
                                    src="/svg/folder_icon.svg"
                                    width={80}
                                    height={80}
                                    alt="Folder"
                                />
                            </div>
                            <div className="text-center">
                                <span className="text-[14px] text-[#1A1A1A] font-medium truncate block" title={folder.name}>
                                    {folder.name}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Files */}
                    {filteredFiles.map((file: any) => (
                        <div
                            key={file.id}
                            className="bg-[#EEF5FA] rounded-[20px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow group p-[10px]"
                            onClick={() => window.open(file.url, '_blank')}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-[4/3] bg-white rounded-[12px] relative overflow-hidden">
                                {isImage(file.name, file.mimeType) ? (
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
                                    onClick={(e) => { e.stopPropagation(); }}
                                    className="p-1 text-[#8F9BB3] hover:text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Folder Modal */}
            {isCreateFolderOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateFolderOpen(false)}>
                    <div className="bg-white p-8 rounded-2xl w-[400px]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6">Create New Folder</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const name = formData.get('folderName') as string;
                                if (name) createFolderMutation.mutate(name);
                            }}
                        >
                            <input
                                name="folderName"
                                type="text"
                                placeholder="Folder Name"
                                className="w-full bg-[#FAFBFF] border border-[#EDF1F7] rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#00AAFF]/20"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateFolderOpen(false)}
                                    className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#00AAFF] text-white font-bold rounded-lg hover:bg-[#0090D9]"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
