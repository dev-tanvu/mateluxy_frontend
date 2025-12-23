'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDeveloper, useDeleteDeveloper } from '@/lib/hooks/use-developers';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Mail, Phone, Globe, User, Languages as LanguagesIcon, Loader2 } from 'lucide-react';
import { AddDeveloperSheet } from '@/components/developers/add-developer-sheet';
import { OffPlanPropertyCard } from '@/components/off-plan-properties/off-plan-property-card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeveloperDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data: developer, isLoading, error } = useDeveloper(id);
    const { mutate: deleteDeveloper, isPending: isDeleting } = useDeleteDeveloper();

    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !developer) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
                <p>Failed to load developer details.</p>
                <Button variant="link" onClick={() => router.back()}>Go back</Button>
            </div>
        );
    }

    const handleDelete = () => {
        deleteDeveloper(id, {
            onSuccess: () => {
                router.push('/developers');
            }
        });
    };

    return (
        <div className="p-16 space-y-8 max-w-[1600px] mx-auto">
            {/* Header Actions */}
            <div className="flex justify-end gap-6 mb-8">
                <button
                    onClick={() => setIsEditSheetOpen(true)}
                    className="flex items-center gap-2 text-[#00A3FF] font-medium hover:opacity-80 transition-opacity"
                >
                    <Edit className="h-5 w-5" />
                    Edit
                </button>
                <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-2 text-[#FF3B30] font-medium hover:opacity-80 transition-opacity"
                >
                    <Trash2 className="h-5 w-5" />
                    Delete
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Column - Developer Info */}
                <div className="flex-1 space-y-8">
                    <div className="flex gap-8 items-center">
                        {/* Logo Box - matching developer list style */}
                        <div className="relative overflow-hidden w-[200px] h-[120px] bg-white rounded-lg border border-gray-200 flex items-center justify-center p-4">
                            {/* Decorative Ellipse */}
                            <div
                                className="absolute top-0 right-10 pointer-events-none"
                                style={{
                                    width: '130.89px',
                                    height: '72.81px',
                                    backgroundColor: '#00BBFF',
                                    opacity: 0.08,
                                    filter: 'blur(20px)',
                                    transform: 'translate(30%, -30%)',
                                }}
                            />
                            {developer.logoUrl ? (
                                <img src={developer.logoUrl} alt={developer.name} className="relative z-10 max-w-full max-h-full object-contain" />
                            ) : (
                                <div className="relative z-10 text-2xl font-bold text-gray-800 uppercase">{developer.name}</div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-0">
                            <h1 className="text-[22px] font-bold text-black">{developer.name}</h1>
                            <div className="text-[#4F4F4F] text-[18px] font-normal">{developer.email}</div>
                            <div className="text-[#4F4F4F] text-[18px] font-normal">{developer.phone}</div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8">
                        <h3 className="text-[20px] font-semibold text-black mb-2">About Developer</h3>
                        <p className="text-[#4F4F4F] text-[18px] font-normal">
                            {developer.about || "No description available."}
                        </p>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-[1px] bg-gray-200 self-stretch" />

                {/* Right Column - Sales Manager */}
                <div className="flex-shrink-0">
                    <div
                        className="rounded-[20px] border border-[2px] border-[#EDF1F7] p-10 flex flex-col items-center text-center h-full"
                        style={{
                            background: 'linear-gradient(to bottom, rgba(195, 243, 255, 0.4) 0%, rgba(237, 237, 237, 0.1) 40%)'
                        }}
                    >
                        {/* Profile Image - no border */}
                        <div className="w-[90px] h-[90px] rounded-full overflow-hidden mb-6 flex items-center justify-center">
                            {developer.salesManagerPhotoUrl ? (
                                <img src={developer.salesManagerPhotoUrl} alt={developer.salesManagerName} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-12 w-12 text-white" />
                            )}
                        </div>

                        <h3 className="text-[16px] font-normal text-black mb-8" style={{ fontFamily: 'var(--font-poppins)' }}>{developer.salesManagerName}</h3>

                        <div className="w-full space-y-2 text-left" style={{ fontFamily: 'var(--font-outfit)' }}>
                            <div className="flex items-center gap-4 text-[12px] font-normal text-[#656565]">
                                <Mail className="h-5 w-5 text-[#656565] shrink-0" />
                                <span className="text-base truncate">{developer.salesManagerEmail}</span>
                            </div>

                            <div className="flex items-center gap-4 text-[12px] font-normal text-[#656565]">
                                <User className="h-5 w-5 text-[#656565] shrink-0" />
                                <span className="text-base">Speaks {developer.languages?.join(', ') || 'N/A'}</span>
                            </div>

                            <div className="flex items-center gap-4 text-[12px] font-normal text-[#656565]">
                                <Phone className="h-5 w-5 text-[#656565] shrink-0" />
                                <span className="text-base">{developer.salesManagerPhone}</span>
                            </div>

                            <div className="flex items-center gap-4 text-[12px] font-normal text-[#656565]">
                                <Globe className="h-5 w-5 text-[#656565] shrink-0" />
                                <span className="text-base">Nationality : {developer.nationality || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Properties Section */}
            <div className="pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties ({developer.properties?.length || 0})</h2>
                {developer.properties && developer.properties.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                        {developer.properties.map((property) => (
                            <div key={property.id} className="flex justify-center">
                                <OffPlanPropertyCard
                                    property={{
                                        ...property,
                                        developer: {
                                            id: developer.id,
                                            name: developer.name,
                                            logoUrl: developer.logoUrl,
                                            salesManagerPhone: developer.salesManagerPhone,
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-500">
                        <p className="text-lg font-medium">No properties found</p>
                        <p className="text-sm">This developer hasn't added any properties yet.</p>
                    </div>
                )}
            </div>

            {/* Edit Sheet */}
            <AddDeveloperSheet
                isOpen={isEditSheetOpen}
                onClose={() => setIsEditSheetOpen(false)}
                developer={developer}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the developer
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
