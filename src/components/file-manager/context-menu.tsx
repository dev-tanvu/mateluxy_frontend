'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Copy, Scissors, Edit2, Trash2, Clipboard } from 'lucide-react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAction: (action: 'copy' | 'cut' | 'rename' | 'delete' | 'paste') => void;
    type: 'file' | 'folder' | 'empty';
    hasClipboard: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction, type, hasClipboard }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Adjust position if it goes off screen
    const [position, setPosition] = useState({ top: y, left: x });

    useEffect(() => {
        if (menuRef.current) {
            const menuWidth = menuRef.current.offsetWidth;
            const menuHeight = menuRef.current.offsetHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            let newLeft = x;
            let newTop = y;

            if (x + menuWidth > screenWidth) {
                newLeft = x - menuWidth;
            }
            if (y + menuHeight > screenHeight) {
                newTop = y - menuHeight;
            }

            setPosition({ top: newTop, left: newLeft });
        }
    }, [x, y]);

    const menuItems = [
        ...(type !== 'empty' ? [
            { icon: <Copy size={16} />, label: 'Copy', action: 'copy' as const },
            { icon: <Scissors size={16} />, label: 'Cut', action: 'cut' as const },
            { icon: <Edit2 size={16} />, label: 'Rename', action: 'rename' as const },
            { type: 'separator' as const },
            { icon: <Trash2 size={16} />, label: 'Move to Trash', action: 'delete' as const, className: 'text-red-500 hover:bg-red-50' },
        ] : []),
        ...(type === 'empty' || type === 'folder' ? [
            { icon: <Clipboard size={16} />, label: 'Paste', action: 'paste' as const, disabled: !hasClipboard },
        ] : [])
    ];

    if (menuItems.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 min-w-[200px] animate-in fade-in zoom-in duration-200"
            style={{ top: position.top, left: position.left }}
        >
            {menuItems.map((item, index) => {
                if ('type' in item && item.type === 'separator') {
                    return <div key={index} className="h-[1px] bg-gray-100 my-1 mx-2" />;
                }

                const menuItem = item as { icon: React.ReactNode, label: string, action: 'copy' | 'cut' | 'rename' | 'delete' | 'paste', className?: string, disabled?: boolean };

                return (
                    <button
                        key={index}
                        onClick={() => !menuItem.disabled && onAction(menuItem.action)}
                        disabled={menuItem.disabled}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-[14px] font-medium transition-colors
                            ${menuItem.disabled ? 'opacity-30 cursor-not-allowed' : menuItem.className || 'text-[#1A1A1A] hover:bg-[#F2F7FA]'}
                        `}
                    >
                        <span className={menuItem.disabled ? 'text-gray-400' : ''}>
                            {menuItem.icon}
                        </span>
                        <span>{menuItem.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
