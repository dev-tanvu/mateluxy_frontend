'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        onSuccess: () => {
            setIsCreateFolderOpen(false);
            queryClient.invalidateQueries({ queryKey: ['files', 'root'] });
        },
    });

    const folders = contentsData?.folders || [];
    const totalUsed = statsData?.totalUsed || 1;

    // Filter folders based on search
    const filteredFolders = folders.filter((f: any) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F2F7FA] p-8">
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
                            className="pl-12 pr-4 py-3 rounded-xl border border-[#EDF1F7] focus:outline-none focus:ring-2 focus:ring-[#00AAFF]/20 w-[300px]"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="flex items-center gap-2 bg-[#E1F5FE] text-[#00AAFF] px-6 py-3 rounded-xl font-semibold hover:bg-[#B3E5FC] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Folder
                    </button>
                </div>
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-4 gap-6">
                {filteredFolders.map((folder: any) => {
                    const hue = (folder.id.split('').reduce((acc: any, char: any) => acc + char.charCodeAt(0), 0) * 137) % 360;

                    return (
                        <div
                            key={folder.id}
                            onClick={() => router.push(`/file-manager/folder/${folder.id}`)}
                            className="bg-white rounded-[12px] p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-all min-h-[120px]"
                        >
                            <div className="flex flex-col justify-between h-full gap-3">
                                <Image
                                    src="/svg/folder_icon.svg"
                                    width={44}
                                    height={44}
                                    alt="Folder"
                                    style={{ filter: `hue-rotate(${hue}deg)` }}
                                />
                                <div>
                                    <h3 className="font-bold text-[15px] truncate text-[#1A1A1A] max-w-[120px]" title={folder.name}>{folder.name}</h3>
                                    <p className="text-[#8F9BB3] text-[12px] mt-1">
                                        {formatSize(folder.size)} <span className="text-[#8F9BB3]">({folder._count?.files || 0} files, {folder._count?.children || 0} folders)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredFolders.length === 0 && !isLoading && (
                    <div className="col-span-4 py-20 text-center text-gray-400">
                        No folders found matching "{searchTerm}".
                    </div>
                )}
            </div>

            {/* Create Folder Modal */}
            {isCreateFolderOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-[400px]">
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
                                    className="px-6 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#00AAFF] text-white font-bold rounded-lg hover:bg-[#0090D9] transition-colors"
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
