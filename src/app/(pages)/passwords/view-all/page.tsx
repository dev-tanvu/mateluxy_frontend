'use client';

import React, { useState } from 'react';
import { PasswordList } from '@/components/passwords/password-list';
import { AddPasswordSheet } from '@/components/passwords/add-password-sheet';
import { PasswordDetails } from '@/services/password.service';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ViewAllPasswordsPage() {
    const router = useRouter();
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [passwordToEdit, setPasswordToEdit] = useState<PasswordDetails | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (details: PasswordDetails) => {
        setPasswordToEdit(details);
        setIsAddSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsAddSheetOpen(false);
        setPasswordToEdit(null);
    };

    return (
        <div className="p-8 space-y-10 min-h-screen bg-[#FDFDFF]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-semibold font-sans text-gray-900">All Passwords</h1>
                </div>

                <div className="flex-1 flex justify-center mx-4">
                    <div className="flex items-center gap-4 bg-transparent p-2 rounded-full border border-[#EDF1F7] shadow-none w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search Email & Passwords"
                            className="flex-1 bg-transparent border-none outline-none text-[15px] font-sans font-normal text-[#8F9BB3] placeholder:text-[#8F9BB3] px-4"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-transparent text-[#8F9BB3]">
                            <Search className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="bg-[#00B7FF]/[.08] hover:bg-[#00B7FF]/[.15] text-[#00B7FF] h-auto px-[20px] py-[15px] rounded-[10px] font-semibold transition-colors border-none shadow-none flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add new
                </Button>
            </div>

            <div className="relative">
                <PasswordList onEdit={handleEdit} searchTerm={searchTerm} />
            </div>

            <AddPasswordSheet
                isOpen={isAddSheetOpen}
                onClose={handleCloseSheet}
                passwordToEdit={passwordToEdit}
            />
        </div>
    );
}
