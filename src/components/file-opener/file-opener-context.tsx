'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type FileType = 'pdf' | 'image' | 'video' | 'audio' | 'other';

export interface FileToOpen {
    url: string;
    name: string;
    type: FileType;
}

export interface FileOpenerContextType {
    file: FileToOpen | null;
    files: FileToOpen[];
    isOpen: boolean;
    openFile: (file: FileToOpen, allFiles?: FileToOpen[]) => void;
    closeFile: () => void;
    nextFile: () => void;
    prevFile: () => void;
}

const FileOpenerContext = createContext<FileOpenerContextType | null>(null);

export function useFileOpener() {
    const context = useContext(FileOpenerContext);
    if (!context) {
        throw new Error('useFileOpener must be used within a FileOpenerProvider');
    }
    return context;
}

// Helper function to determine file type from URL or extension
export function getFileType(url: string): FileType {
    const extension = url.split('.').pop()?.toLowerCase() || '';

    // PDF
    if (extension === 'pdf') return 'pdf';

    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
        return 'image';
    }

    // Videos
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(extension)) {
        return 'video';
    }

    // Audio
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(extension)) {
        return 'audio';
    }

    return 'other';
}

export function FileOpenerProvider({ children }: { children: React.ReactNode }) {
    const [file, setFile] = useState<FileToOpen | null>(null);
    const [files, setFiles] = useState<FileToOpen[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const openFile = useCallback((newFile: FileToOpen, allFiles?: FileToOpen[]) => {
        // Skip opening for fonts and archives
        const extension = newFile.url.split('.').pop()?.toLowerCase() || '';
        const skipExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'ttf', 'otf', 'woff', 'woff2', 'eot'];

        if (skipExtensions.includes(extension)) {
            // Just download these files
            window.open(newFile.url, '_blank');
            return;
        }

        setFile(newFile);
        if (allFiles) {
            // Filter only compatible files for navigation
            const compatibleFiles = allFiles.filter(f => !skipExtensions.includes(f.url.split('.').pop()?.toLowerCase() || ''));
            setFiles(compatibleFiles);
        } else {
            setFiles([newFile]);
        }
        setIsOpen(true);
    }, []);

    const closeFile = useCallback(() => {
        setIsOpen(false);
        // Delay clearing file to allow animation
        setTimeout(() => {
            setFile(null);
            setFiles([]);
        }, 300);
    }, []);

    const nextFile = useCallback(() => {
        if (!file || files.length <= 1) return;
        const currentIndex = files.findIndex(f => f.url === file.url);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % files.length;
        setFile(files[nextIndex]);
    }, [file, files]);

    const prevFile = useCallback(() => {
        if (!file || files.length <= 1) return;
        const currentIndex = files.findIndex(f => f.url === file.url);
        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + files.length) % files.length;
        setFile(files[prevIndex]);
    }, [file, files]);

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'ArrowRight') nextFile();
            if (e.key === 'ArrowLeft') prevFile();
            if (e.key === 'Escape') closeFile();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, nextFile, prevFile, closeFile]);

    return (
        <FileOpenerContext.Provider value={{ file, files, isOpen, openFile, closeFile, nextFile, prevFile }}>
            {children}
        </FileOpenerContext.Provider>
    );
}
