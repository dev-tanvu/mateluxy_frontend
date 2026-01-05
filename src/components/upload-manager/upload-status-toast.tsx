'use client';

import React, { useState } from 'react';
import { useUpload } from './upload-context';
import { X, ChevronDown, ChevronUp, Check, Play, Pause, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Source_Sans_3 } from 'next/font/google';

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export function UploadStatusToast() {
    const { uploads, removeUpload } = useUpload();
    const [isMinimized, setIsMinimized] = useState(false);

    if (uploads.length === 0) return null;

    const uploadingCount = uploads.filter(u => u.status === 'uploading').length;
    const completedCount = uploads.filter(u => u.status === 'completed').length;

    // Calculate overall progress
    const totalProgress = Math.round(
        uploads.reduce((acc, curr) => acc + curr.progress, 0) / uploads.length
    );

    return (
        <div className={cn(
            "fixed bottom-6 right-6 w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden z-[60] transition-all duration-300",
            sourceSans.className
        )}>
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 bg-white">
                <div className="flex items-center gap-3">
                    <span className="text-[16px] font-bold text-[#101828]">
                        {uploadingCount > 0 ? `Uploading ${uploadingCount + completedCount} items` : `Uploaded ${completedCount} items`}
                    </span>
                    {uploadingCount > 0 && (
                        <span className="text-[16px] font-bold text-[#00ADEF]">
                            {totalProgress}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 text-[#667085] hover:text-[#101828] transition-colors"
                    >
                        {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button
                        onClick={() => uploads.forEach(u => removeUpload(u.id))}
                        className="p-1 text-[#667085] hover:text-[#101828] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isMinimized ? "max-height-0 h-0" : "max-h-[300px] overflow-y-auto custom-scrollbar"
            )}>
                <div className="p-2">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-[16px] transition-colors group">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-[12px] bg-[#F9FBFF] flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-[#00ADEF]" />
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[14px] font-bold text-[#101828] truncate" title={upload.fileName}>
                                            {upload.fileName}
                                        </span>
                                    </div>
                                    {upload.status === 'uploading' && (
                                        <div className="h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden w-full">
                                            <div
                                                className="h-full bg-[#3B82F6] transition-all duration-300"
                                                style={{ width: `${upload.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {upload.status === 'completed' ? (
                                    <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                ) : upload.status === 'uploading' ? (
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 text-[#667085] hover:text-[#101828] transition-colors">
                                            <Pause size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeUpload(upload.id)}
                                            className="p-1.5 text-[#667085] hover:text-[#101828] transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-[12px] text-red-500 font-medium">Failed</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
