'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileManagerService } from '@/services/file-manager.service';
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Trash2, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function FileManagerPage() {
    const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['files', currentFolderId],
        queryFn: () => fileManagerService.getContents(currentFolderId),
    });

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
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFolder(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] }),
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => fileManagerService.deleteFile(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] }),
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
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading files...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error loading files</div>;

    const { folders, files, breadcrumbs } = data || { folders: [], files: [], breadcrumbs: [] };

    return (
        <div className="flex h-full flex-col bg-[#F8F9FA] p-6 text-[#1A1A1A]">
            {/* Header / Toolbar */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentFolderId(undefined)}
                        className={`flex items-center gap-1 text-sm font-medium ${!currentFolderId ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                    </button>
                    {breadcrumbs && breadcrumbs.map((crumb: any) => (
                        <div key={crumb.id} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <button
                                onClick={() => setCurrentFolderId(crumb.id)}
                                className={`text-sm font-medium ${currentFolderId === crumb.id ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium border border-gray-200 shadow-sm hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4" /> New Folder
                    </button>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black">
                        <Upload className="h-4 w-4" /> Upload File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>

            {/* Create Folder Modal (Inline for now) */}
            {isCreateFolderOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <form onSubmit={handleCreateFolder} className="w-[400px] rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-lg font-semibold">Create New Folder</h3>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:border-[#00AAFF]"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreateFolderOpen(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createFolderMutation.isPending}
                                className="rounded-lg bg-[#00AAFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0099EA]"
                            >
                                {createFolderMutation.isPending ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Folders Section */}
                {folders.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Folders</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {folders.map((folder: any) => (
                                <div
                                    key={folder.id}
                                    className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-[#00AAFF]/30 hover:shadow-md"
                                    onClick={() => setCurrentFolderId(folder.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-lg bg-blue-50 p-2 text-[#00AAFF]">
                                            <Folder className="h-6 w-6 fill-current" />
                                        </div>
                                        {/* Context Menu / Actions could go here */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Delete folder?')) deleteFolderMutation.mutate(folder.id);
                                            }}
                                            className="opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="truncate font-medium text-gray-900">{folder.name}</h3>
                                        <p className="text-xs text-gray-400">{folder._count?.files || 0} files</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Section */}
                {files.length > 0 && (
                    <div>
                        <h2 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">Files</h2>
                        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">Size</th>
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {files.map((file: any) => (
                                        <tr key={file.id} className="group hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                        {file.mimeType?.startsWith('image/') ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={file.url} alt="" className="h-full w-full object-cover rounded-lg" />
                                                        ) : (
                                                            <FileText className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#00AAFF] hover:underline">
                                                        {file.name}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500">{formatSize(file.size)}</td>
                                            <td className="px-6 py-3 text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete file?')) deleteFileMutation.mutate(file.id);
                                                    }}
                                                    className="opacity-0 transition-opacity group-hover:opacity-100 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {folders.length === 0 && files.length === 0 && (
                    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-gray-50 p-6">
                            <FolderOpen className="h-12 w-12 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">This folder is empty</h3>
                        <p className="mt-1 text-gray-500">Upload files or create a new folder to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
