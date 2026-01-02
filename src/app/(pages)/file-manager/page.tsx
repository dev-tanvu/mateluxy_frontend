'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import {
    Folder, FileText, Upload, Plus, ChevronRight,
    Home, Trash2, FolderOpen, Image as ImageIcon,
    Video, Music, Archive, Type, RotateCcw,
    MoreHorizontal, Search, Settings, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FileManagerPage() {
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Queries
    const { data: contentsData, isLoading: isContentsLoading } = useQuery({
        queryKey: ['files', currentFolderId, selectedCategory],
        queryFn: async () => {
            if (selectedCategory) {
                // Fetch filtered by category
                // For now, we can fetch everything and filter client-side or add backend support.
                // Let's assume we fetch all files in the current context and filter.
                const data = await fileManagerService.getContents(currentFolderId);
                const filteredFiles = data.files.filter((f: any) => {
                    if (selectedCategory === 'Images') return f.mimeType.startsWith('image/');
                    if (selectedCategory === 'Videos') return f.mimeType.startsWith('video/');
                    if (selectedCategory === 'Audio') return f.mimeType.startsWith('audio/');
                    if (selectedCategory === 'Documents') return f.mimeType.includes('pdf') || f.mimeType.includes('doc') || f.mimeType.includes('text');
                    return true;
                });
                return { ...data, folders: [], files: filteredFiles }; // Hide folders when category selected
            }
            return fileManagerService.getContents(currentFolderId);
        },
    });

    const { data: statsData } = useQuery({
        queryKey: ['file-stats'],
        queryFn: () => fileManagerService.getStats(),
    });

    const { data: recentData } = useQuery({
        queryKey: ['recent-files'],
        queryFn: () => fileManagerService.getRecent(),
    });

    const { data: deletedData } = useQuery({
        queryKey: ['deleted-items'],
        queryFn: () => fileManagerService.getDeleted(),
    });

    // Mutations
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => fileManagerService.createFolder(name, currentFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
            setIsCreateFolderOpen(false);
        },
    });

    const uploadFileMutation = useMutation({
        mutationFn: (file: File) => fileManagerService.uploadFile(file, currentFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
            queryClient.invalidateQueries({ queryKey: ['file-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-files'] });
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFolder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
        },
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['file-stats'] });
        },
    });

    const restoreFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.restoreFile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
            queryClient.invalidateQueries({ queryKey: ['deleted-items'] });
            queryClient.invalidateQueries({ queryKey: ['file-stats'] });
        },
    });

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            createFolderMutation.mutate(newFolderName);
            setNewFolderName('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFileMutation.mutate(e.target.files[0]);
        }
    };

    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getPercentage = (used: number, total: number) => {
        if (!total) return 0;
        return Math.min(Math.round((used / total) * 100), 100);
    };

    const { folders = [], files = [], breadcrumbs = [] } = contentsData || {};
    const stats = statsData || { totalLimit: 150 * 1024 * 1024 * 1024, usedSize: 0, categories: {} };
    const recentFiles = recentData || [];
    const deletedItems = deletedData || { files: [], folders: [] };

    return (
        <div className="flex h-full bg-white text-[#1A1A1A]">
            {/* Main Content Area */}
            <div className="flex-1 overflow-auto p-8 border-r border-gray-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setCurrentFolderId(undefined);
                                setSelectedCategory(null);
                            }}
                            className={`text-[28px] font-bold ${!currentFolderId && !selectedCategory ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
                        >
                            Folders
                        </button>
                        {breadcrumbs.map((crumb: any) => (
                            <React.Fragment key={crumb.id}>
                                <ChevronRight className="w-6 h-6 text-gray-300" />
                                <button
                                    onClick={() => {
                                        setCurrentFolderId(crumb.id);
                                        setSelectedCategory(null);
                                    }}
                                    className={`text-[28px] font-bold ${currentFolderId === crumb.id ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-[#1A1A1A]'}`}
                                >
                                    {crumb.name}
                                </button>
                            </React.Fragment>
                        ))}
                        {selectedCategory && (
                            <>
                                <ChevronRight className="w-6 h-6 text-gray-300" />
                                <span className="text-[28px] font-bold text-[#1A1A1A]">{selectedCategory}</span>
                            </>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => setIsCreateFolderOpen(true)}
                            className="flex items-center gap-2 bg-[#F5F5FB] text-[#8F9BB3] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-[#EDF1F7]"
                        >
                            <Plus className="w-5 h-5" />
                            New Folder
                        </button>
                        <button
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="flex items-center gap-2 bg-[#E1F5FE] text-[#00AAFF] px-6 py-3 rounded-xl font-semibold hover:bg-[#B3E5FC] transition-colors"
                        >
                            <Upload className="w-5 h-5" />
                            Upload
                        </button>
                    </div>
                </div>

                {/* Folders Grid */}
                {!selectedCategory && (
                    <div className="grid grid-cols-3 gap-6 mb-12 relative">
                        {folders.map((folder: any) => {
                            const folderPercentage = getPercentage(folder.size, stats.totalLimit / 10);
                            return (
                                <div
                                    key={folder.id}
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    className="bg-[#FFFFFF] border border-[#F1F4F9] rounded-[20px] p-6 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl ${folder.name.includes('NOC') ? 'bg-[#FFF9C4]' :
                                                folder.name.includes('Contract') ? 'bg-[#E3F2FD]' : 'bg-[#F3E5F5]'
                                            }`}>
                                            <Folder className={`w-8 h-8 ${folder.name.includes('NOC') ? 'text-[#FBC02D]' :
                                                    folder.name.includes('Contract') ? 'text-[#1976D2]' : 'text-[#9C27B0]'
                                                } fill-current`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[16px] mb-1">{folder.name}</h3>
                                            <p className="text-[#8F9BB3] text-[13px]">
                                                {formatSize(folder.size)} / {formatSize(stats.totalLimit / 10)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative w-14 h-14 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="28" cy="28" r="24" stroke="#F1F4F9" strokeWidth="4" fill="none" />
                                            <circle
                                                cx="28" cy="28" r="24" stroke="#00AAFF" strokeWidth="4" fill="none"
                                                strokeDasharray={`${2 * Math.PI * 24}`}
                                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - (folderPercentage / 100 || 0.05))}`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span className="absolute text-[11px] font-bold">{folderPercentage}%</span>
                                    </div>
                                </div>
                            );
                        })}
                        {folders.length > 3 && (
                            <button className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border border-[#F1F4F9] rounded-full p-2 shadow-md">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                        {folders.length === 0 && !isContentsLoading && !currentFolderId && (
                            <div className="col-span-3 py-10 text-center text-gray-400 bg-gray-50 rounded-2xl">
                                No folders found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Access */}
                <div className="mb-12">
                    <h2 className="text-[22px] font-bold mb-8">Quick Access</h2>
                    <div className="flex gap-10">
                        {[
                            { label: 'Images', icon: ImageIcon, color: '#FF5252', bg: '#FFEBEE' },
                            { label: 'Videos', icon: Video, color: '#536DFE', bg: '#E8EAF6' },
                            { label: 'Audio', icon: Music, color: '#FFB300', bg: '#FFF8E1' },
                            { label: 'Archives', icon: Archive, color: '#9E9E9E', bg: '#F5F5F5' },
                            { label: 'Documents', icon: FileText, color: '#40C4FF', bg: '#E1F5FE' },
                            { label: 'Fonts', icon: Type, color: '#4DB6AC', bg: '#E0F2F1' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                onClick={() => setSelectedCategory(selectedCategory === item.label ? null : item.label)}
                                className={`flex flex-col items-center gap-4 cursor-pointer group p-2 rounded-2xl transition-all ${selectedCategory === item.label ? 'bg-gray-50 ring-2 ring-[#00AAFF]/20' : ''}`}
                            >
                                <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: item.bg }}>
                                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                                </div>
                                <span className={`font-semibold text-[15px] ${selectedCategory === item.label ? 'text-[#00AAFF]' : ''}`}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Files or Filtered Files */}
                <div>
                    <h2 className="text-[22px] font-bold mb-8">
                        {selectedCategory ? `${selectedCategory}` : (currentFolderId ? 'Files' : 'Recent Files')}
                    </h2>
                    <table className="w-full">
                        <thead className="text-[#8F9BB3] text-[15px] border-b border-gray-50">
                            <tr>
                                <th className="text-left font-medium pb-4">Name</th>
                                <th className="text-left font-medium pb-4">Last Modified</th>
                                <th className="text-left font-medium pb-4">File type</th>
                                <th className="text-left font-medium pb-4">File size</th>
                                {currentFolderId && <th className="text-right font-medium pb-4">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="text-[15px]">
                            {(selectedCategory || currentFolderId ? files : recentFiles).map((file: any) => (
                                <tr
                                    key={file.id}
                                    className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    <td className="py-4 flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.mimeType.startsWith('image/') ? 'bg-[#FFEBEE]' :
                                                file.mimeType.startsWith('video/') ? 'bg-[#E8EAF6]' : 'bg-[#E1F5FE]'
                                            }`}>
                                            {file.mimeType.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-[#FF5252]" /> :
                                                file.mimeType.startsWith('video/') ? <Video className="w-5 h-5 text-[#536DFE]" /> :
                                                    <FileText className="w-5 h-5 text-[#40C4FF]" />}
                                        </div>
                                        <span className="font-bold">{file.name}</span>
                                    </td>
                                    <td className="py-4 text-[#8F9BB3]">{new Date(file.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td className="py-4 text-[#8F9BB3] uppercase">{file.mimeType.split('/')[1]?.split('-')[0]?.split('+')[0]?.toUpperCase() || 'FILE'}</td>
                                    <td className="py-4 text-[#8F9BB3]">{formatSize(file.size)}</td>
                                    {currentFolderId && (
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Delete this file?')) deleteFileMutation.mutate(file.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(selectedCategory || currentFolderId ? files : recentFiles).length === 0 && (
                        <div className="py-20 text-center text-[#8F9BB3]">
                            No files found in this section.
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar (Storage Usage) */}
            <div className="w-[450px] p-10 bg-[#FFFFFF]">
                <h2 className="text-[24px] font-bold mb-10">Storage usage</h2>

                {/* Radial Progress */}
                <div className="relative w-full aspect-square flex flex-col items-center justify-center mb-12">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="42%"
                            stroke="#F8F9FA"
                            strokeWidth="35"
                            fill="none"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="42%"
                            stroke="#00AAFF"
                            strokeWidth="35"
                            fill="none"
                            strokeDasharray="1000"
                            strokeDashoffset={1000 - (1000 * (stats.usedSize / stats.totalLimit))}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-[34px] font-bold">{(stats.usedSize / (1024 ** 3)).toFixed(2)} GB</span>
                        <span className="text-[#8F9BB3] text-[16px]">of {Math.round(stats.totalLimit / (1024 ** 3))} GB used</span>
                        <button className="text-[#1A1A1A] font-bold underline mt-4 text-[15px]">More</button>
                    </div>
                </div>

                {/* Storage Breakdown */}
                <div className="space-y-8 mb-12">
                    {[
                        { label: 'Images', category: 'images', color: '#D50000', icon: ImageIcon },
                        { label: 'Videos', category: 'videos', color: '#FFAB00', icon: Video },
                        { label: 'Audio', category: 'audio', color: '#00E676', icon: Music },
                        { label: 'Documents', category: 'documents', color: '#40C4FF', icon: FileText },
                    ].map((item) => {
                        const usage = (stats.categories as any)[item.category] || 0;
                        const percentage = getPercentage(usage, stats.totalLimit);
                        return (
                            <div key={item.label} className="flex gap-4">
                                <div className="w-14 h-14 rounded-[18px] bg-gray-50 flex items-center justify-center">
                                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-[16px]">{item.label}</span>
                                        <span className="font-bold text-[14px]">{formatSize(usage)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-[#EEEEEE] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                backgroundColor: item.color,
                                                width: `${percentage || 1}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recently Deleted */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[20px] font-bold">Recently deleted</h3>
                        <Link href="#" className="text-[#00AAFF] font-bold text-[15px]">See all</Link>
                    </div>
                    <div className="space-y-6">
                        {deletedItems.files.slice(0, 3).map((file: any) => (
                            <div key={file.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#E1F5FE] flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-[#00AAFF]" />
                                    </div>
                                    <span className="font-bold text-[16px] truncate max-w-[180px]">{file.name}</span>
                                </div>
                                <button
                                    onClick={() => restoreFileMutation.mutate(file.id)}
                                    className="text-gray-400 hover:text-[#00AAFF] p-2 transition-colors"
                                    title="Restore"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {deletedItems.files.length === 0 && (
                            <p className="text-[#8F9BB3] text-center py-4">No recently deleted items</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Folder Modal */}
            {isCreateFolderOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <form onSubmit={handleCreateFolder} className="w-[400px] rounded-3xl bg-white p-8 shadow-2xl">
                        <h3 className="mb-6 text-xl font-bold">Create New Folder</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="mb-6 w-full rounded-xl border border-[#EDF1F7] bg-white px-5 py-4 outline-none focus:border-[#00AAFF] text-[15px]"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateFolderOpen(false)}
                                className="rounded-xl px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createFolderMutation.isPending}
                                className="rounded-xl bg-[#00AAFF] px-8 py-3 text-sm font-bold text-white hover:bg-[#0099EA]"
                            >
                                {createFolderMutation.isPending ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
