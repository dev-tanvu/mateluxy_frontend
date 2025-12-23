'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Loader2, Save } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/lib/hooks/use-users';
import { User } from '@/lib/services/user.service';
import { MENU_ITEMS } from '@/lib/config/menu';

interface AddUserSheetProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

export function AddUserSheet({ isOpen, onClose, user }: AddUserSheetProps) {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const { mutate: createUser, isPending: isCreating } = useCreateUser();
    const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

    const isPending = isCreating || isUpdating;

    const userSchema = z.object({
        fullName: z.string().min(2, 'Name must be at least 2 characters'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: user
            ? z.string().optional()
            : z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['ADMIN', 'MODERATOR']),
    });

    type UserFormValues = z.infer<typeof userSchema>;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
    });

    const selectedRole = watch('role');

    useEffect(() => {
        if (isOpen) {
            if (user) {
                reset({
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                    role: user.role as 'ADMIN' | 'MODERATOR',
                    password: '',
                });
                setProfileImage(user.avatarUrl || null);
                setSelectedPermissions(user.permissions || []);
            } else {
                reset({
                    fullName: '',
                    username: '',
                    email: '',
                    role: undefined,
                    password: '',
                });
                setProfileImage(null);
                setSelectedPermissions([]);
            }
        }
    }, [isOpen, user, reset]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePermission = (permission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const onSubmit = (data: UserFormValues) => {
        const fileInput = document.getElementById('profile-upload') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        const onSuccess = () => {
            reset();
            setProfileImage(null);
            setSelectedPermissions([]);
            if (fileInput) fileInput.value = '';
            onClose();
        };

        if (user) {
            updateUser({
                id: user.id,
                data: {
                    ...data,
                    password: data.password || undefined,
                    avatar: file,
                    permissions: selectedRole === 'MODERATOR' ? selectedPermissions : []
                }
            }, { onSuccess });
        } else {
            // For creation, password is required by schema, so data.password is string
            if (!data.password) return;

            createUser({
                ...data,
                password: data.password,
                avatar: file,
                permissions: selectedRole === 'MODERATOR' ? selectedPermissions : []
            }, { onSuccess });
        }
    };

    // Derive permissions from MENU_ITEMS to stay in sync with sidebar
    const availablePermissions = useMemo(() => {
        const perms = new Set<string>();
        MENU_ITEMS.forEach(item => {
            if (item.permission) {
                perms.add(item.permission);
            }
        });
        return Array.from(perms);
    }, []);

    return (
        <Sheet isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Add User"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-start gap-6">
                    <div className="relative flex-shrink-0">
                        <div className="h-28 w-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            )}
                        </div>
                        <label
                            htmlFor="profile-upload"
                            className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md cursor-pointer hover:bg-gray-50 border border-gray-200"
                        >
                            <Camera className="h-4 w-4 text-gray-600" />
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    </div>

                    <div className="flex-1 space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Name</Label>
                        <Input
                            id="fullName"
                            placeholder="Enter full name"
                            className="h-11"
                            {...register('fullName')}
                        />
                        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter username"
                            className="h-11"
                            {...register('username')}
                        />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            className="h-11"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={user ? "Leave blank to keep current" : "Create a secure password"}
                            className="h-11"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <select
                            id="role"
                            className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('role')}
                        >
                            <option value="">Select role</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MODERATOR">Moderator</option>
                        </select>
                        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                    </div>
                </div>

                {selectedRole === 'MODERATOR' && (
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-500">Permission</Label>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {availablePermissions.map((perm) => (
                                <div key={perm} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`perm-${perm}`}
                                        checked={selectedPermissions.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`perm-${perm}`} className="text-sm text-gray-700 cursor-pointer">
                                        {perm}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] mt-6 h-12 text-base font-medium rounded-lg"
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : user ? (
                        <Save className="mr-2 h-5 w-5" />
                    ) : (
                        <Plus className="mr-2 h-5 w-5" />
                    )}
                    {user ? 'Update User' : `Create ${selectedRole === 'ADMIN' ? 'Admin' : selectedRole === 'MODERATOR' ? 'Moderator' : 'Admin'}`}
                </Button>
            </form>
        </Sheet>
    );
}
