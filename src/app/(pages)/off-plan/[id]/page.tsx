'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { offPlanPropertyService } from '@/lib/services/off-plan-property.service';
import { PropertyDetailView, PropertyDetailData } from '@/components/properties/property-detail-view';
import { Loader2 } from 'lucide-react';

export default function OffPlanPropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;

    const { data: property, isLoading } = useQuery({
        queryKey: ['off-plan-property', propertyId],
        queryFn: () => offPlanPropertyService.getOne(propertyId),
        enabled: !!propertyId,
    });

    if (isLoading) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0BA5EC]" />
            </div>
        );
    }

    if (!property) {
        return <div className="p-8 text-center text-[#8F9BB3]">Off-plan property not found</div>;
    }

    const projectTitle = property.projectTitle?.trim()?.toLowerCase();
    const locationValue = (() => {
        const addr = property.address?.trim();
        if (addr && addr.toLowerCase() !== projectTitle) return addr;

        const emirate = property.emirate?.trim();
        if (emirate && emirate.toLowerCase() !== projectTitle) return emirate;

        return 'not specified';
    })();

    // Transform data for the view
    // Off-plan doesn't have Property Finder stats yet, using mock for stats/insights
    const transformedData: PropertyDetailData = {
        id: property.id,
        type: 'off-plan',
        title: property.projectTitle || 'Untitled Project',
        location: locationValue,
        description: property.projectDescription || property.shortDescription || 'No description available for this property. It is a premium listing that matches all luxury standards.',
        price: property.startingPrice?.toLocaleString() || '0',
        area: (property.area || property.plotArea)?.toLocaleString() || '0',
        coverPhoto: property.coverPhoto || '/placeholder-property.jpg',
        agent: {
            name: 'Tanvir Almas',
            photo: '/profile.svg',
            languages: ['English', 'Bengali'],
            phone: '+971 56 104 7161',
            whatsapp: '971561047161',
        },
        developer: property.developer ? {
            name: property.developer.name,
            logoUrl: property.developer.logoUrl || '',
            salesManagerPhone: property.developer.salesManagerPhone,
            salesManagerPhoneSecondary: property.developer.salesManagerPhoneSecondary,
        } : undefined,
        status: (property.isActive ? 'published' : 'draft') as any,
        rejectionDetail: undefined,
        stats: {
            impressions: {
                label: 'Impressions',
                value: 329,
                trend: 8,
                trendIsPositive: true,
                periodText: 'than last week',
            },
            clicks: {
                label: 'Listing Clicks',
                value: 122,
                trend: 2,
                trendIsPositive: true,
                periodText: 'than last week',
            },
            interests: {
                label: 'Interests',
                value: 109,
                trend: 8,
                trendIsPositive: false,
                periodText: 'than last month',
            },
            leads: {
                label: 'Property Leads',
                value: property.leadsCount || 109,
                trend: 8,
                trendIsPositive: false,
                periodText: 'than last month',
            },
        },
        insights: {
            ranking: 'Top 30',
            creditSpent: '30 AED',
            exposure: 'Standard',
            priceRange: 'Similar Properties are priced between the range of 3446 AED to 6880 AED',
        },
        qualityScore: 80,
        leads: [
            {
                id: '1',
                name: 'Abdullah Mahi',
                email: 'abdullahmahi@mateluxy.com',
                phone: '+971 56 104 7161',
                interest: 'Interested in Off Plan properties',
                agentName: 'William Yong',
                agentImage: '/profile.svg',
                propertyImage: property.coverPhoto || '/placeholder-property.jpg',
            },
            {
                id: '2',
                name: 'Abdullah Mahi',
                email: 'abdullahmahi@mateluxy.com',
                phone: '+971 56 104 7161',
                interest: 'Interested in Off Plan properties',
                agentName: 'William Yong',
                agentImage: '/profile.svg',
                propertyImage: property.coverPhoto || '/placeholder-property.jpg',
            }
        ],
    };

    return (
        <PropertyDetailView
            data={transformedData as any}
            onEdit={() => router.push(`/off-plan/${propertyId}/edit`)}
        />
    );
}
