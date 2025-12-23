'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PropertyDetailsStep } from '@/components/off-plan-properties/property-details-step';
import { useOffPlanProperty, useUpdateOffPlanProperty } from '@/lib/hooks/use-off-plan-properties';
import { CreateOffPlanPropertyDto } from '@/lib/services/off-plan-property.service';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditOffPlanPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = React.use(params);
    const { data: property, isLoading } = useOffPlanProperty(id);
    const { mutate: updateProperty } = useUpdateOffPlanProperty();

    const handlePropertySubmit = (data: CreateOffPlanPropertyDto) => {
        console.log('📝 handlePropertySubmit (Update) called with data:', data);

        updateProperty({ id, data: { ...data, isActive: true } } as any, {
            onSuccess: () => {
                toast.success('Property updated successfully!');
                router.push('/off-plan');
            },
            onError: (error) => {
                console.error('❌ Error updating property:', error);
                toast.error('Failed to update property');
            },
        });
    };

    const handleSaveAsDraft = (data: CreateOffPlanPropertyDto) => {
        console.log('💾 handleSaveAsDraft (Update) called with data:', data);

        updateProperty({ id, data: { ...data, isActive: false } } as any, {
            onSuccess: () => {
                toast.success('Draft updated successfully!');
                router.push('/off-plan');
            },
            onError: (error) => {
                console.error('❌ Error updating draft:', error);
                toast.error('Failed to update draft');
            },
        });
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00B7FF]" />
            </div>
        );
    }

    if (!property) {
        return <div className="p-8">Property not found</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-2xl font-bold font-[var(--font-outfit)]">Edit Off Plan Property</h1>
            <div className="max-w-7xl mx-auto">
                <PropertyDetailsStep
                    developerId={property.developerId}
                    initialData={property}
                    onSubmit={handlePropertySubmit}
                    onSaveAsDraft={handleSaveAsDraft}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
