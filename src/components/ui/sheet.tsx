'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
    hideCloseButton?: boolean;
    side?: 'left' | 'right';
}

export function Sheet({ isOpen, onClose, children, title, className, side = 'right', hideCloseButton = false }: SheetProps) {
    // Prevent body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop - removed dark overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-transparent transition-opacity duration-300 pointer-events-none",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed inset-y-0 z-[60] w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out transform",
                    side === 'right' ? "right-0" : "left-0",
                    isOpen
                        ? "translate-x-0"
                        : side === 'right' ? "translate-x-full" : "-translate-x-full",
                    className
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    {(title || !hideCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4">
                            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                            {!hideCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-400" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className={cn("flex-1 overflow-y-auto px-6 pb-6", !title && "pt-6")}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
