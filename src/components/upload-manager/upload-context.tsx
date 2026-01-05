'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { fileManagerService } from '@/services/file-manager.service';
import { useQueryClient } from '@tanstack/react-query';

export interface UploadItem {
    id: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error' | 'paused';
    cancelToken?: () => void; // For future cancellation support
}

interface UploadContextType {
    uploads: UploadItem[];
    addUploads: (files: File[], folderId?: string) => void;
    removeUpload: (id: string) => void;
    clearCompleted: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const queryClient = useQueryClient();

    const addUploads = useCallback((files: File[], folderId?: string) => {
        files.forEach((file) => {
            const id = Math.random().toString(36).substring(2, 11);
            const newItem: UploadItem = {
                id,
                fileName: file.name,
                progress: 0,
                status: 'uploading',
            };

            setUploads((prev) => [newItem, ...prev]);

            fileManagerService.uploadFile(file, folderId, (progress) => {
                setUploads((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, progress } : item
                    )
                );
            }).then(() => {
                setUploads((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, status: 'completed', progress: 100 } : item
                    )
                );
                // Invalidate queries to refresh file list in the background
                queryClient.invalidateQueries({ queryKey: ['files'] });
                queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
                queryClient.invalidateQueries({ queryKey: ['recent-files'] });
            }).catch(() => {
                setUploads((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, status: 'error' } : item
                    )
                );
            });
        });
    }, [queryClient]);

    const removeUpload = useCallback((id: string) => {
        setUploads((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearCompleted = useCallback(() => {
        setUploads((prev) => prev.filter((item) => item.status !== 'completed'));
    }, []);

    return (
        <UploadContext.Provider value={{ uploads, addUploads, removeUpload, clearCompleted }}>
            {children}
        </UploadContext.Provider>
    );
}

export function useUpload() {
    const context = useContext(UploadContext);
    if (context === undefined) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
}
