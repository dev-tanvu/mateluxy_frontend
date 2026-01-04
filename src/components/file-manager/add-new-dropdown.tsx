'use client';

import React from 'react';
import { Plus, Upload, FolderPlus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Source_Sans_3 } from 'next/font/google';
import { cn } from '@/lib/utils';

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

interface AddNewDropdownProps {
    onCreateFolder: () => void;
    onUploadFile?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Keep for backward compatibility
    onShowUploadModal: () => void;
    className?: string;
    showCreateFolder?: boolean;
    showUploadFile?: boolean;
}

export function AddNewDropdown({
    onCreateFolder,
    onUploadFile,
    onShowUploadModal,
    className,
    showCreateFolder = true,
    showUploadFile = true
}: AddNewDropdownProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className={cn("relative", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className={cn(
                            "flex items-center gap-2 bg-[#E1F5FE] text-[#00AAFF] px-6 py-3 rounded-xl font-semibold hover:bg-[#B3E5FC] transition-colors",
                            sourceSans.className
                        )}
                    >
                        <Plus className="w-5 h-5" />
                        Add new
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-[200px] p-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-none"
                >
                    {showCreateFolder && (
                        <DropdownMenuItem
                            onClick={onCreateFolder}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl hover:bg-[#F8F9FA] transition-colors group"
                        >
                            <Plus className="w-5 h-5 text-[#1A1A1A]" />
                            <span className={cn("text-[#1A1A1A] font-medium text-[15px]", sourceSans.className)}>
                                Create new folder
                            </span>
                        </DropdownMenuItem>
                    )}
                    {showUploadFile && (
                        <DropdownMenuItem
                            onClick={onShowUploadModal}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl hover:bg-[#F8F9FA] transition-colors group"
                        >
                            <Upload className="w-5 h-5 text-[#1A1A1A]" />
                            <span className={cn("text-[#1A1A1A] font-medium text-[15px]", sourceSans.className)}>
                                Upload new file
                            </span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {onUploadFile && (
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onUploadFile}
                />
            )}
        </div>
    );
}
