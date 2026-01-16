'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProperty, getPropertyFinderListing, getPropertyFinderStats, syncPropertyToPropertyFinder, publishToPropertyFinder, unpublishFromPropertyFinder, submitVerificationToPropertyFinder, checkVerificationEligibility, deleteProperty } from '@/services/property.service';
import { PropertyFinderLeadService } from '@/lib/services/property-finder-lead.service';
import { PropertyDetailView, PropertyDetailData } from '@/components/properties/property-detail-view';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StandardPropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const propertyId = params.id as string;
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isVerifying, setIsVerifying] = React.useState(false);

    const { data: property, isLoading: propertyLoading } = useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => getProperty(propertyId),
        enabled: !!propertyId,
    });

    const { data: pfListing } = useQuery({
        queryKey: ['property', propertyId, 'pf-listing'],
        queryFn: () => getPropertyFinderListing(propertyId),
        enabled: !!propertyId,
    });

    const { data: stats } = useQuery({
        queryKey: ['property', propertyId, 'pf-stats'],
        queryFn: () => getPropertyFinderStats(propertyId),
        enabled: !!propertyId,
    });

    const { data: leads = [] } = useQuery({
        queryKey: ['property-finder-leads', property?.reference || property?.id],
        queryFn: () => PropertyFinderLeadService.listLeads(property?.reference || property?.id),
        enabled: !!property,
    });

    // Check verification eligibility for published but unverified properties
    const { data: eligibility, isLoading: eligibilityLoading } = useQuery({
        queryKey: ['property', propertyId, 'verification-eligibility'],
        queryFn: () => checkVerificationEligibility(propertyId),
        enabled: !!property && property.pfPublished && property.pfVerificationStatus !== 'verified' && property.pfVerificationStatus !== 'approved',
    });

    if (propertyLoading) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0BA5EC]" />
            </div>
        );
    }

    if (!property) {
        return <div className="p-8 text-center text-[#8F9BB3]">Property not found</div>;
    }

    const propertyTitle = property.propertyTitle?.trim()?.toLowerCase();
    const locationValue = (() => {
        const pfPath = property.pfLocationPath?.trim();
        if (pfPath && pfPath.toLowerCase() !== propertyTitle) return pfPath;

        const addr = property.address?.trim();
        if (addr && addr.toLowerCase() !== propertyTitle) return addr;

        const emirate = property.emirate?.trim();
        if (emirate && emirate.toLowerCase() !== propertyTitle) return emirate;

        return 'not specified';
    })();

    // Transform data for the view
    const transformedData: PropertyDetailData = {
        id: property.id,
        type: 'standard',
        title: property.propertyTitle || 'Untitled Property',
        location: locationValue,
        description: property.propertyDescription || 'No description available for this property. It is a premium listing that matches all luxury standards.',
        price: property.price?.toLocaleString() || '0',
        area: property.area?.toLocaleString() || '0',
        coverPhoto: property.coverPhoto || '/placeholder-property.jpg',
        agent: {
            id: property.assignedAgent?.id || property.assignedAgentId,
            name: property.assignedAgent?.name || 'Tanvir Almas',
            photo: property.assignedAgent?.photoUrl || '/profile.svg',
            languages: property.assignedAgent?.languages || ['English', 'Bengali'],
            phone: property.assignedAgent?.phone || '+971 56 104 7161',
            phoneSecondary: property.assignedAgent?.phoneSecondary,
            whatsapp: property.assignedAgent?.whatsapp || property.assignedAgent?.phone || '971561047161',
        },
        status: (() => {
            if (!property.isActive) return 'draft';

            // Check verification status first
            const vStatus = (pfListing?.verificationStatus || property.pfVerificationStatus || '').toLowerCase();
            if (vStatus === 'approved' || vStatus === 'verified') return 'approved';
            if (vStatus === 'rejected') return 'rejected';

            // If published but not verified yet
            if (property.pfPublished) return 'published';

            // Default to pending
            return 'pending';
        })() as any,
        rejectionDetail: pfListing?.verificationStatus === 'rejected' ? {
            reason: pfListing?.rejectionReason || 'Cannot approve this submission because there are 3 other verified listings correctly matching this one.',
            date: pfListing?.updatedAt ? new Date(pfListing.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '9 September, 2025',
        } : (property.pfVerificationStatus === 'REJECTED' ? {
            reason: 'Cannot approve this submission because there are 3 other verified listings correctly matching this one.',
            date: '9 September, 2025',
        } : undefined),
        stats: {
            impressions: {
                label: 'Impressions',
                value: stats?.impressions || 329,
                trend: stats?.trends?.impressions?.value || 8,
                trendIsPositive: stats?.trends?.impressions?.isPositive ?? true,
                periodText: `than ${stats?.trends?.impressions?.period || 'last week'}`,
            },
            clicks: {
                label: 'Listing Clicks',
                value: stats?.listingClicks || 122,
                trend: stats?.trends?.clicks?.value || 2,
                trendIsPositive: stats?.trends?.clicks?.isPositive ?? true,
                periodText: `than ${stats?.trends?.clicks?.period || 'last week'}`,
            },
            interests: {
                label: 'Interests',
                value: stats?.interests || 109,
                trend: stats?.trends?.interests?.value || 8,
                trendIsPositive: stats?.trends?.interests?.isPositive ?? false,
                periodText: `than ${stats?.trends?.interests?.period || 'last month'}`,
            },
            leads: {
                label: 'Property Leads',
                value: property.leadsCount || 109,
                trend: stats?.trends?.leads?.value || 8,
                trendIsPositive: stats?.trends?.leads?.isPositive ?? false,
                periodText: `than ${stats?.trends?.leads?.period || 'last month'}`,
            },
        },
        insights: {
            ranking: 'Top 30',
            creditSpent: '30 AED',
            exposure: 'Standard',
            priceRange: 'Similar Properties are priced between the range of 3446 AED to 6880 AED',
        },
        qualityScore: property.pfQualityScore || 80,
        leads: leads.length > 0 ? leads.map((l: any) => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            interest: `Interested in ${property.propertyTitle}`,
            agentName: l.agentName || 'William Yong',
            agentImage: l.agentImageUrl || '/profile.svg',
            propertyImage: property.coverPhoto || '/placeholder-property.jpg',
        })) : [
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

    // Publish / Unpublish Logic

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // Step 1: Sync (Fetch-Merge-Push) - ensures full data submission
            await syncPropertyToPropertyFinder(propertyId);
            // Step 2: Publish - make it live
            await publishToPropertyFinder(propertyId);
            toast.success('Property synced and published successfully');
            // Invalidate to refresh status
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to publish property');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        setIsPublishing(true);
        try {
            await unpublishFromPropertyFinder(propertyId);
            toast.success('Property unpublished successfully');
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to unpublish property');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        try {
            await submitVerificationToPropertyFinder(propertyId);
            toast.success('Property submitted for verification successfully');
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to submit verification');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProperty(propertyId);
            toast.success('Property deleted successfully');
            router.push('/properties');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete property');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <PropertyDetailView
            data={transformedData}
            onEdit={() => router.push(`/properties/${propertyId}/edit`)}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
            onVerify={handleVerify}
            isPublishing={isPublishing}
            isDeleting={isDeleting}
            isVerifying={isVerifying}
            eligibility={eligibility}
            eligibilityLoading={eligibilityLoading}
        />
    );
}
