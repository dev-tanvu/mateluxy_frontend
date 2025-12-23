'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeveloperList } from '@/components/developers/developer-list';
import { AddDeveloperSheet } from '@/components/developers/add-developer-sheet';

export default function DevelopersPage() {
    const [isAddDeveloperOpen, setIsAddDeveloperOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-[241px]">
                    <Input
                        placeholder="Search for developer"
                        className="pr-10 pl-4 h-10 text-sm placeholder:text-gray-400 border-gray-200 rounded-full py-5now focus-visible:ring-0 focus-visible:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                    onClick={() => setIsAddDeveloperOpen(true)}
                    className="rounded-lg bg-[#E0F2FE] text-[#0095FF] hover:bg-[#BAE6FD] border-none shadow-none h-10 px-6"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add new
                </Button>
            </div>

            {/* Developer List */}
            <DeveloperList search={searchQuery} />

            {/* Add Developer Sheet */}
            <AddDeveloperSheet
                isOpen={isAddDeveloperOpen}
                onClose={() => setIsAddDeveloperOpen(false)}
            />
        </div>
    );
}
