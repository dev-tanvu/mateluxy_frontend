'use client';

import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateUser } from '@/lib/hooks/use-users';

interface ActivateUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string;
}

export function ActivateUserDialog({ isOpen, onClose, userId, userName }: ActivateUserDialogProps) {
    const { mutate: updateUser, isPending } = useUpdateUser();

    if (!isOpen) return null;

    const handleActivate = () => {
        if (userId) {
            updateUser({
                id: userId,
                data: { isActive: true }
            }, {
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">Activate User</h3>
                        <p className="text-sm text-gray-500">
                            Are you sure you want to activate <span className="font-medium text-gray-900">{userName}</span>?
                            They will be able to access the system again.
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
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            onClick={handleActivate}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activating...
                                </>
                            ) : (
                                'Activate'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
