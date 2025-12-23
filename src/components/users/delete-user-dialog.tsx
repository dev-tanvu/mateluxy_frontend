'use client';

import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteUser } from '@/lib/hooks/use-users';

interface DeleteUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

export function DeleteUserDialog({ isOpen, onClose, userId, userName }: DeleteUserDialogProps) {
    const { mutate: deleteUser, isPending } = useDeleteUser();

    if (!isOpen) return null;

    const handleDelete = () => {
        if (userId) {
            deleteUser(userId, {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete <span className="font-medium text-gray-900">{userName}</span>?
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="flex w-full gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
