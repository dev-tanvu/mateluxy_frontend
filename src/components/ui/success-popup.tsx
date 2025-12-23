'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessPopupProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    message: string;
    autoCloseDuration?: number; // in ms
}

export function SuccessPopup({
    isOpen,
    onClose,
    title,
    message,
    autoCloseDuration
}: SuccessPopupProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            if (autoCloseDuration && onClose) {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setTimeout(onClose, 300); // Wait for exit animation
                }, autoCloseDuration);
                return () => clearTimeout(timer);
            }
        } else {
            setVisible(false);
        }
    }, [isOpen, autoCloseDuration, onClose]);

    if (!isOpen && !visible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0"
        )}>
            <div className={cn(
                "relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl transition-all duration-300",
                visible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
            )}>
                {/* Close Button (Optional) */}
                {onClose && !autoCloseDuration && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {/* Icon */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600 animate-in zoom-in duration-500" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600">{message}</p>

                {/* Progress Bar for Auto Close */}
                {autoCloseDuration && (
                    <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full bg-green-500 transition-all ease-linear"
                            style={{
                                width: visible ? '0%' : '100%',
                                transitionDuration: `${autoCloseDuration}ms`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
