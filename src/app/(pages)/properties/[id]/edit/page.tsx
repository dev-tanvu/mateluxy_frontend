'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/use-properties';
import { PropertyFormStep } from '@/components/properties/property-form-step';

export default function EditPropertyPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;

    const { data: property, isLoading, isError } = useProperty(propertyId);

    const handleBack = () => {
        router.push('/properties/all');
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (isError || !property) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Error loading property</h2>
                    <p className="text-muted-foreground mb-4">Could not find the property you are looking for.</p>
                    <button
                        onClick={handleBack}
                        className="text-primary hover:underline"
                    >
                        Return to properties list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full p-8 w-full">
            <div className="w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Edit Property</h1>
                <PropertyFormStep
                    nocFile={null} // Files can't be pre-filled securely in browser from URL
                    category={property.category}
                    purpose={property.purpose}
                    initialData={property}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
