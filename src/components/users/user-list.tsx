'use client';

import React from 'react';
import { Edit2, Trash2, MoreVertical, Loader2, Ban, CheckCircle } from 'lucide-react';
import { useUsers } from '@/lib/hooks/use-users';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from '@/lib/services/user.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';

interface UserListProps {
    search?: string;
    role?: string;
    onEdit?: (user: User) => void;
    onDelete?: (user: User) => void;
    onDeactivate?: (user: User) => void;
    onActivate?: (user: User) => void;
}

export function UserList({ search, role, onEdit, onDelete, onDeactivate, onActivate }: UserListProps) {
    const { data: users, isLoading, error } = useUsers(search, role);
    const currentUser = useAuthStore((state) => state.user);
    const isModerator = currentUser?.role === 'MODERATOR';

    const handleRestrictedAction = (action: string) => {
        toast.error(`You don't have permission to ${action} users.`);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center bg-white rounded-xl border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 w-full items-center justify-center bg-white rounded-xl border border-gray-100 text-red-500 text-[16px]">
                Failed to load users
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden">
            <table className="w-full border-separate border-spacing-0">
                <thead>
                    <tr className="text-left">
                        <th className="w-[120px] whitespace-nowrap py-6 pl-8 pr-1 text-[16px] font-normal text-black bg-[#F7F7F773] border-y border-l border-[#EDF1F7] rounded-l-[15px]">Profile</th>
                        <th className="w-[1%] whitespace-nowrap py-6 pl-1 pr-[80px] text-[16px] font-normal text-black bg-[#F7F7F773] border-y border-[#EDF1F7]">Name</th>
                        <th className="w-[1%] whitespace-nowrap py-6 pl-0 pr-[100px] text-[16px] font-normal text-black bg-[#F7F7F773] border-y border-[#EDF1F7]">Email</th>
                        <th className="whitespace-nowrap py-6 px-1 text-[16px] font-normal text-black bg-[#F7F7F773] border-y border-[#EDF1F7]">Role</th>
                        <th className="py-6 px-8 text-[16px] font-normal text-black text-right bg-[#F7F7F773] border-y border-r border-[#EDF1F7] rounded-r-[15px]">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user) => (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                            <td className="py-3 pl-8 pr-1">
                                <div className="h-[50px] w-[50px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-[16px] font-medium border border-gray-100">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                                    ) : (
                                        user.fullName.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap py-2 pl-1 pr-[80px] text-[16px] font-medium text-gray-700">
                                <div className="flex items-center gap-2">
                                    {user.fullName}
                                    {!user.isActive && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap py-2 pl-0 pr-[100px] text-[16px] text-[#0095FF] hover:underline cursor-pointer">{user.email}</td>
                            <td className="whitespace-nowrap py-2 px-1 text-[16px] text-gray-700">{user.role === 'ADMIN' ? 'Admin' : 'Moderator'}</td>
                            <td className="py-2 px-8 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => isModerator ? handleRestrictedAction('edit') : onEdit?.(user)}
                                        className={`p-1 transition-colors ${isModerator ? 'text-gray-300 cursor-not-allowed' : 'text-[#0095FF] hover:text-[#007acc]'}`}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => isModerator ? handleRestrictedAction('delete') : onDelete?.(user)}
                                        className={`p-1 transition-colors ${isModerator ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors outline-none">
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {user.isActive ? (
                                                <DropdownMenuItem
                                                    onClick={() => isModerator ? handleRestrictedAction('deactivate') : onDeactivate?.(user)}
                                                    className={isModerator ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer'}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    <span>Deactivate</span>
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => isModerator ? handleRestrictedAction('activate') : onActivate?.(user)}
                                                    className={isModerator ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer'}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    <span>Activate</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-[16px] text-gray-400">
                                No users found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
