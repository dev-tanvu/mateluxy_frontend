'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDrafts, deleteDraft, PropertyDraft, Property } from '@/services/property.service';
import { Loader2, FileEdit, Trash2 } from 'lucide-react';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

// Map PropertyDraft to Property-like object for use with PropertyCard
function mapDraftToProperty(draft: PropertyDraft): Property {
    const data = draft.data as any;
    return {
        id: draft.id, // Use draft ID for navigation
        category: data.category || '',
        purpose: data.purpose || '',
        clientName: data.clientName || '',
        nationality: data.nationality,
        phoneNumber: data.phoneNumber || '',
        emirate: data.emirate,
        propertyType: data.propertyType,
        plotArea: data.plotArea,
        area: data.area,
        bedrooms: data.bedrooms,
        kitchens: data.kitchens,
        bathrooms: data.bathrooms,
        unitNumber: data.unitNumber,
        ownershipStatus: data.ownershipStatus,
        parkingSpaces: data.parkingSpaces,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        furnishingType: data.furnishingType,
        price: data.price,
        rentalPeriod: data.rentalPeriod,
        brokerFee: data.brokerFee,
        numberOfCheques: data.numberOfCheques,
        dldPermitNumber: data.dldPermitNumber,
        dldQrCode: data.dldQrCode,
        propertyTitle: data.propertyTitle || 'Untitled Draft',
        propertyDescription: data.propertyDescription,
        coverPhoto: data.coverPhoto,
        videoUrl: data.videoUrl,
        mediaImages: data.mediaImages || [],
        reference: data.reference,
        availableFrom: data.availableFrom,
        amenities: data.amenities || [],
        nocDocument: data.nocDocument,
        passportCopy: data.passportCopy,
        emiratesIdScan: data.emiratesIdScan,
        titleDeed: data.titleDeed,
        assignedAgentId: data.assignedAgentId,
        assignedAgent: data.assignedAgent,
        isActive: false, // Drafts are always inactive
        status: 'AVAILABLE',
        pfListingId: undefined,
        pfPublished: false,
        pfVerificationStatus: undefined,
        pfQualityScore: undefined,
        pfSyncedAt: undefined,
        pfLocationId: data.pfLocationId,
        pfLocationPath: data.pfLocationPath,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        leadsCount: 0,
        projectStatus: data.projectStatus,
        completionDate: data.completionDate,
    };
}

export default function SavedDraftsPage() {
    const queryClient = useQueryClient();

    const { data: drafts, isLoading } = useQuery({
        queryKey: ['drafts'],
        queryFn: getDrafts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDraft,
        onSuccess: () => {
            toast.success('Draft deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['drafts'] });
        },
        onError: () => {
            toast.error('Failed to delete draft');
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#ffffff]">
            <div className="flex-1 p-8 max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[24px] font-semibold text-[#1A1A1A]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Saved Drafts <span className="text-[#8F9BB3] font-medium ml-1">({drafts?.length || 0})</span>
                    </h1>
                </div>

                {drafts?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FileEdit className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No drafts found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            You don't have any saved drafts. Start creating a property and save it as draft.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                        {drafts?.map((draft) => {
                            const propertyData = mapDraftToProperty(draft);
                            return (
                                <div key={draft.id} className="relative group">
                                    <PropertyCard
                                        property={propertyData}
                                        onClick={() => {
                                            // Navigate to resume draft page
                                            window.location.href = `/properties/saved-drafts/${draft.id}`;
                                        }}
                                    />
                                    {/* Delete button overlay */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this draft?')) {
                                                    deleteMutation.mutate(draft.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
