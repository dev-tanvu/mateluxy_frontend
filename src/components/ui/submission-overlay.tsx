import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionOverlayProps {
    isOpen: boolean;
    message?: string;
}

export function SubmissionOverlay({ isOpen, message = 'Processing...' }: SubmissionOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-blue-50 p-4 rounded-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
                    <p className="text-sm text-gray-500">Please wait while we process your request</p>
                </div>
            </div>
        </div>
    );
}
