'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserList } from '@/components/users/user-list';
import { AddUserSheet } from '@/components/users/add-user-sheet';
import { cn } from '@/lib/utils';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { DeactivateUserDialog } from '@/components/users/deactivate-user-dialog';
import { ActivateUserDialog } from '@/components/users/activate-user-dialog';
import { User } from '@/lib/services/user.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('All');
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
    const [activatingUser, setActivatingUser] = useState<User | null>(null);

    const currentUser = useAuthStore((state) => state.user);
    const isModerator = currentUser?.role === 'MODERATOR';

    const tabs = ['All', 'Admin', 'Moderator'];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsAddUserOpen(true);
    };

    const handleDelete = (user: User) => {
        setDeletingUser(user);
    };

    const handleDeactivate = (user: User) => {
        setDeactivatingUser(user);
    };

    const handleActivate = (user: User) => {
        setActivatingUser(user);
    };

    const handleCloseSheet = () => {
        setIsAddUserOpen(false);
        setEditingUser(null);
    };

    const handleCreateClick = () => {
        if (isModerator) {
            toast.error("You don't have permission to create users.");
            return;
        }
        setIsAddUserOpen(true);
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex items-center bg-[#F3F4F6] rounded-full p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                                activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-62">
                        <Input
                            placeholder="Search for admin or moderator.."
                            className="pr-10 pl-4 rounded-full border-gray-200 bg-white h-10 text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {!isModerator && (
                        <Button
                            onClick={handleCreateClick}
                            className="rounded-lg bg-[#E0F2FE] text-[#0095FF] hover:bg-[#BAE6FD] border-none shadow-none h-10 px-6"
                        >
                            <Plus className="h-4 w-4" /> Create new
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <UserList
                search={searchQuery}
                role={activeTab === 'Admin' ? 'ADMIN' : activeTab === 'Moderator' ? 'MODERATOR' : undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
            />

            {/* Add/Edit User Sheet */}
            <AddUserSheet
                isOpen={isAddUserOpen}
                onClose={handleCloseSheet}
                user={editingUser}
            />

            {/* Delete User Dialog */}
            <DeleteUserDialog
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                userId={deletingUser?.id || null}
                userName={deletingUser?.fullName || ''}
            />

            {/* Deactivate User Dialog */}
            <DeactivateUserDialog
                isOpen={!!deactivatingUser}
                onClose={() => setDeactivatingUser(null)}
                userId={deactivatingUser?.id || null}
                userName={deactivatingUser?.fullName || ''}
            />

            {/* Activate User Dialog */}
            <ActivateUserDialog
                isOpen={!!activatingUser}
                onClose={() => setActivatingUser(null)}
                userId={activatingUser?.id || null}
                userName={activatingUser?.fullName || ''}
            />
        </div>
    );
}
