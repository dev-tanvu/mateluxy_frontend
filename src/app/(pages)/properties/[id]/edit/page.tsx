'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProperty } from '@/services/property.service';
import { PropertyFormStep } from '@/components/properties/property-form-step';
import { Loader2 } from 'lucide-react';

export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: property, isLoading, error } = useQuery({
        queryKey: ['property', id],
        queryFn: () => getProperty(id),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00B7FF]" />
            </div>
        );
    }

    if (error || !property) {
        return <div className="p-8 text-center text-gray-500">Property not found</div>;
    }

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-[28px] font-bold font-[var(--font-outfit)] text-[#1A1A1A]">Edit Property</h1>
                    <p className="text-[#5F6A7A] mt-1">Update the details of your property listing.</p>
                </div>

                <PropertyFormStep
                    nocFile={null}
                    category={property.category || 'RESIDENTIAL'}
                    purpose={property.purpose?.toLowerCase() || 'sell'}
                    initialData={property}
                    onBack={() => router.back()}
                />
            </div>
        </div>
    );
}
