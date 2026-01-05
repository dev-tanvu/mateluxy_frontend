
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Check, Upload, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/user.service';
import { createPassword, updatePassword, PasswordDetails } from '@/services/password.service';
import { toast } from 'sonner';
import { DocumentUploadBox } from '@/components/properties/document-upload-box';
import api from '@/lib/api/axios';

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().optional(), // Optional for updates
    note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddPasswordSheetProps {
    isOpen: boolean;
    onClose: () => void;
    passwordToEdit?: PasswordDetails | null;
}

export function AddPasswordSheet({ isOpen, onClose, passwordToEdit }: AddPasswordSheetProps) {
    const queryClient = useQueryClient();
    const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getAll(),
        enabled: isOpen,
    });

    const adminModerators = React.useMemo(() =>
        users.filter(u => u.role === 'ADMIN' || u.role === 'MODERATOR'),
        [users]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen) {
            if (passwordToEdit) {
                setValue('title', passwordToEdit.title);
                setValue('username', passwordToEdit.username);
                setValue('note', passwordToEdit.note || '');
                // We show decrypted password if available (it should be since we fetched details to edit)
                setValue('password', passwordToEdit.password);
                setSelectedAccessIds(passwordToEdit.accessIds || []);
                setLogoUrl(passwordToEdit.logoUrl || null);
            } else {
                reset({
                    title: '',
                    username: '',
                    password: '',
                    note: '',
                });
                setSelectedAccessIds([]);
                setLogoUrl(null);
                setLogoFile(null);
            }
        }
    }, [isOpen, passwordToEdit, reset, setValue]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (passwordToEdit) {
                return updatePassword(passwordToEdit.id, data);
            }
            return createPassword(data);
        },
        onSuccess: () => {
            toast.success(passwordToEdit ? 'Password entry updated' : 'Password entry created');
            queryClient.invalidateQueries({ queryKey: ['passwords'] });
            if (passwordToEdit) {
                queryClient.invalidateQueries({ queryKey: ['password-details', passwordToEdit.id] });
            }
            handleClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || `Failed to ${passwordToEdit ? 'update' : 'create'} password entry`);
        }
    });

    const handleClose = () => {
        reset();
        setSelectedAccessIds([]);
        setLogoFile(null);
        setLogoUrl(null);
        onClose();
    };

    const toggleUserAccess = (userId: string) => {
        setSelectedAccessIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleFileSelect = (file: File) => {
        setLogoFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: FormValues) => {
        // Enforce password required for create, optional for update (if empty)
        if (!passwordToEdit && !data.password) {
            toast.error("Password is required");
            return;
        }

        let uploadedLogoUrl = logoUrl;

        // Upload file if selected
        if (logoFile) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', logoFile);
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedLogoUrl = res.data.url;
            } catch (error) {
                toast.error("Failed to upload logo image");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const payload: any = {
            ...data,
            accessIds: selectedAccessIds,
            logoUrl: uploadedLogoUrl, // Send only the key or URL
        };

        if (passwordToEdit && !data.password) {
            delete payload.password;
        }

        mutation.mutate(payload);
    };

    return (
        <Sheet isOpen={isOpen} onClose={handleClose} title={passwordToEdit ? "Edit Password" : "Add New Password"} titleClassName="font-sans font-semibold text-[24px]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Website Logo (Optional)</Label>
                    <DocumentUploadBox
                        label="Drop logo here"
                        icon={<Upload className="w-5 h-5" />}
                        file={logoFile || (logoUrl && !logoFile ? logoUrl : null)}
                        onFileSelect={handleFileSelect}
                        onRemove={() => { setLogoFile(null); setLogoUrl(null); }}
                        accept=".png,.jpg,.jpeg,.svg,.webp"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Purpose / Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Property Finder API"
                        className="h-[50px] bg-white border-gray-200"
                        {...register('title')}
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Email / Username</Label>
                    <Input
                        id="username"
                        placeholder="Enter email or username"
                        className="h-[50px] bg-white border-gray-200"
                        {...register('username')}
                    />
                    {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={passwordToEdit ? "Leave empty to keep current password" : "Enter secure password"}
                            className="h-[50px] bg-white border-gray-200 pr-10"
                            {...register('password')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Grant Access</Label>
                    <p className="text-xs text-gray-400 mb-2">Select admins or moderators who can view this decrypted password.</p>
                    <div className="border border-gray-100 rounded-[20px] divide-y divide-gray-50 max-h-[220px] overflow-y-auto bg-gray-50/30">
                        {adminModerators.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-400">No users found</div>
                        ) : adminModerators.map(user => {
                            const isSelected = selectedAccessIds.includes(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 hover:bg-white cursor-pointer transition-all group"
                                    onClick={() => toggleUserAccess(user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-200 overflow-hidden">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                                            ) : (
                                                user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.fullName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 bg-white'}`}>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="note" className="text-sm font-medium text-gray-700">Additional Note</Label>
                    <Textarea
                        id="note"
                        placeholder="Add any extra details or instructions..."
                        className="rounded-xl resize-none bg-white border-gray-200"
                        {...register('note')}
                        rows={3}
                    />
                </div>

                <div className="pt-4 flex justify-center">
                    <Button
                        type="submit"
                        className="bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] h-12 px-8 text-base font-medium rounded-lg w-auto min-w-[200px]"
                        disabled={mutation.isPending || isUploading}
                    >
                        {mutation.isPending || isUploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        {passwordToEdit ? 'Update Entry' : 'Create Entry'}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
