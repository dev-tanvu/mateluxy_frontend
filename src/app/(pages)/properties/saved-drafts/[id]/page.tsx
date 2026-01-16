'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDraft } from '@/services/property.service';
import { PropertyFormStep } from '@/components/properties/property-form-step';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeDraftPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: draft, isLoading, error } = useQuery({
        queryKey: ['draft', id],
        queryFn: () => getDraft(id),
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !draft) {
        toast.error('Draft not found');
        router.push('/properties/saved-drafts');
        return null;
    }

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Resume Draft</h1>
                    <p className="text-gray-500">Continue editing your property draft.</p>
                </div>

                {/* 
                  Pass draft data as initialData.
                  pass draftId so the form knows to update this draft or delete it upon publish.
                */}
                <PropertyFormStep
                    nocFile={null}
                    category={originalCategory(draft.data)}
                    purpose={originalPurpose(draft.data)}
                    initialData={draft.data}
                    onBack={() => router.push('/properties/saved-drafts')}
                    draftId={draft.id}
                />
            </div>
        </div>
    );
}

// Helper to safely extract category/purpose if missing or structured differently
function originalCategory(data: any): string {
    return data.category || 'RESIDENTIAL'; // Default fallback
}

function originalPurpose(data: any): string {
    return data.purpose || 'SALE'; // Default fallback
}
