
'use client';

import React, { useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordList } from '@/components/passwords/password-list';
import { AddPasswordSheet } from '@/components/passwords/add-password-sheet';
import { PasswordDetails } from '@/services/password.service';

export default function PasswordManagerPage() {
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [passwordToEdit, setPasswordToEdit] = useState<PasswordDetails | null>(null);

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
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-600 rounded-[28px] shadow-lg shadow-indigo-100 ring-8 ring-indigo-50">
                        <ShieldCheck className="h-9 w-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[32px] font-black text-gray-900 leading-tight tracking-tight">Vault</h1>
                        <p className="text-gray-400 font-medium">Securing your team's digital assets with AES-256 encryption.</p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsAddSheetOpen(true)}
                    className="bg-[#00B7FF] hover:bg-[#0099DD] h-14 px-8 rounded-[20px] font-extrabold text-base shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
                >
                    <Plus className="mr-2 h-6 w-6 stroke-[3px]" />
                    New Credential
                </Button>
            </div>

            <div className="relative">
                <PasswordList onEdit={handleEdit} />
            </div>

            <AddPasswordSheet
                isOpen={isAddSheetOpen}
                onClose={handleCloseSheet}
                passwordToEdit={passwordToEdit}
            />
        </div>
    );
}
