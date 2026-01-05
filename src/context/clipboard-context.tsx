'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ClipboardAction = 'copy' | 'cut';
export type ClipboardItemType = 'file' | 'folder';

export interface ClipboardItem {
    action: ClipboardAction;
    items: { type: ClipboardItemType, item: any }[];
}

interface ClipboardContextType {
    clipboard: ClipboardItem | null;
    copyToClipboard: (items: { type: ClipboardItemType, item: any }[]) => void;
    cutToClipboard: (items: { type: ClipboardItemType, item: any }[]) => void;
    clearClipboard: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({ children }: { children: ReactNode }) {
    const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);

    const copyToClipboard = (items: { type: ClipboardItemType, item: any }[]) => {
        setClipboard({ action: 'copy', items });
    };

    const cutToClipboard = (items: { type: ClipboardItemType, item: any }[]) => {
        setClipboard({ action: 'cut', items });
    };

    const clearClipboard = () => {
        setClipboard(null);
    };

    return (
        <ClipboardContext.Provider value={{ clipboard, copyToClipboard, cutToClipboard, clearClipboard }}>
            {children}
        </ClipboardContext.Provider>
    );
}

export function useClipboard() {
    const context = useContext(ClipboardContext);
    if (context === undefined) {
        throw new Error('useClipboard must be used within a ClipboardProvider');
    }
    return context;
}
