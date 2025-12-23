'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProperty, getPropertyFinderListing, getPropertyFinderStats } from '@/services/property.service';
import { PropertyFinderLeadService, PropertyFinderLead } from '@/lib/services/property-finder-lead.service';
import Image from 'next/image';
import { ArrowLeft, Check, X, TrendingUp, TrendingDown, ChevronDown, ArrowLeftRight, FileText, Image as ImageIcon, LayoutGrid, Copy, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyDetailSkeleton } from '@/components/properties/property-detail-skeleton';

// Reuse lead card styles
const startCase = (str: string) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const statusColors: Record<string, { text: string; bg: string }> = {
    sent: { text: '#7c3aed', bg: '#f3e8ff' },
    delivered: { text: '#2aa0ff', bg: '#e8f4ff' },
    read: { text: '#f59e0b', bg: '#fff7e8' },
    replied: { text: '#22c55e', bg: '#e7f9ef' },
};

const defaultAvatar = '/profile.svg';

function formatPhone(phone?: string) {
    if (!phone) return '';
    return phone.replace(/\s+/g, ' ').trim();
}

function LeadCard({ lead }: { lead: PropertyFinderLead }) {
    return (
        <div className="rounded-[24px] bg-white px-5 py-4 border border-[#EDF1F7] mb-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="rounded-md bg-[#e0e7ff] px-2 py-0.5 text-[11px] font-medium text-[#4338ca]">
                    {lead.channel || 'Property Finder'}
                </span>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <div className="text-[16px] font-bold text-[#1f2837] leading-tight mb-1">{lead.name}</div>
                    <div className="text-[13px] text-[#5f6a7a] mb-3">
                        Interested in {lead.listingReference ? 'this property' : 'property'}
                        <div className="text-[12px] truncate max-w-[200px]">{lead.email}</div>
                        <div className="text-[12px]">{formatPhone(lead.phone)}</div>
                    </div>
                </div>
                {/* Placeholder for property image in lead card if available, or just use a generic icon */}
                <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden relative">
                    <Image
                        src="/placeholder-property.jpg" // You might want to use actual property image
                        alt="Property"
                        fill
                        className="object-cover"
                        onError={(e) => { (e.target as any).src = '/office-placeholder.jpg' }} // Fallback
                    />
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between text-sm text-[#1f2837]">
                <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 overflow-hidden rounded-full bg-[#f3f4f6]">
                        <Image
                            src={lead.agentImageUrl || defaultAvatar}
                            alt={lead.agentName || 'Agent'}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-[13px] font-medium">
                        {lead.agentName || (lead.assignedToIdentifier ? `Agent #${lead.assignedToIdentifier}` : 'William Yong')}
                    </span>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-[#5f6a7a] hover:text-[#1f2837] transition-colors">
                    <ArrowLeftRight className="h-3 w-3" />
                    <span>Transfer</span>
                </button>
            </div>
        </div>
    );
}

function QualityScoreItem({ label, value, max, icon: Icon }: { label: string; value: number; max: number; icon: any }) {
    const isPerfect = value === max;
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gray-50 text-[#5f6a7a]">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-[14px] text-[#5f6a7a]">{label}</span>
            </div>
            <span className={`text-[14px] font-semibold ${isPerfect ? 'text-green-500' : 'text-gray-900'}`}>
                {value}/{max}
            </span>
        </div>
    );
}

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const propertyId = params.id as string;

    const { data: property, isLoading: propertyLoading } = useQuery({
        queryKey: ['property', propertyId],
        queryFn: () => getProperty(propertyId),
        enabled: !!propertyId,
        staleTime: 5 * 60 * 1000,
    });

    const { data: pfListing, isLoading: pfListingLoading } = useQuery({
        queryKey: ['property', propertyId, 'pf-listing'],
        queryFn: () => getPropertyFinderListing(propertyId),
        enabled: !!propertyId, // Always fetch to get local quality preview if needed
        staleTime: 5 * 60 * 1000,
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['property', propertyId, 'pf-stats'],
        queryFn: () => getPropertyFinderStats(propertyId),
        enabled: !!propertyId,
        staleTime: 5 * 60 * 1000,
    });

    const { data: leads = [], isLoading: leadsLoading } = useQuery({
        queryKey: ['property-finder-leads', property?.reference || property?.id],
        queryFn: () => PropertyFinderLeadService.listLeads(property?.reference || property?.id),
        enabled: !!property,
        staleTime: 5 * 60 * 1000,
    });

    if (propertyLoading) {
        return <PropertyDetailSkeleton />;
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
                <div className="text-center text-[#7b8794]">Property not found</div>
            </div>
        );
    }

    // Status Determination
    const pfStatus = pfListing?.state || {};
    const verificationStatus = pfListing?.verificationStatus || property.pfVerificationStatus;

    const isDraft = !property.pfPublished;
    const isSubmitted = property.pfPublished && verificationStatus === 'pending';
    const isPendingReview = isSubmitted; // Simplifying for this specific flow from image
    const isRejected = verificationStatus === 'rejected';

    // Override logic to match the 4-step flow explicitly
    // 1. Draft Property (Active if unpublished)
    // 2. Submitted (Active if pushed to PF)
    // 3. Pending Review (Active if status is pending)
    // 4. Rejected (Active if rejected) OR Approved (Implicit fifth state?)

    // Let's assume the user wants the exact look.
    const currentStep = isRejected ? 4 : (isPendingReview ? 3 : (property.pfPublished ? 2 : 1));

    // Calculate stats with mock data if not available
    const impressions = stats?.impressions || 0;
    const listingClicks = stats?.listingClicks || 0;
    const interests = stats?.interests || 0;
    const totalLeads = stats?.leads || 0;

    // Real trend data from API
    const impressionsTrend = stats?.trends?.impressions || { value: 0, isPositive: true, change: 0, period: 'last week' };
    const clicksTrend = stats?.trends?.clicks || { value: 0, isPositive: true, change: 0, period: 'last week' };
    const interestsTrend = stats?.trends?.interests || { value: 0, isPositive: true, change: 0, period: 'last month' };
    const leadsTrend = stats?.trends?.leads || { value: 0, isPositive: true, change: 0, period: 'last month' };

    // Quality Score
    const qs = pfListing?.qualityScore;
    const qsValue = qs?.value || 0;
    const qsDetails = qs?.details || {};

    // Helper to extract detail value safely
    const getDetailValue = (key: string) => {
        const detail = qsDetails[key];
        return typeof detail === 'object' ? detail.value : (detail || 0);
    };

    return (
        <div className="min-h-screen bg-white p-8">
            {/* Header / Back */}
            <div className="mb-8">
                {/* Status Tracker */}
                <div className="flex items-center gap-8 mb-12">
                    {/* Step 1: Draft Property */}
                    <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                        <span className={`text-[15px] font-medium ${currentStep >= 1 ? 'text-[#1f2837]' : 'text-gray-400'}`}>Draft Property</span>
                    </div>

                    {/* Step 2: Submitted */}
                    <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                        <span className={`text-[15px] font-medium ${currentStep >= 2 ? 'text-[#1f2837]' : 'text-gray-400'}`}>Submitted</span>
                    </div>

                    {/* Step 3: Pending Review */}
                    <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            <Check className="h-5 w-5" />
                        </div>
                        <span className={`text-[15px] font-medium ${currentStep >= 3 ? 'text-[#1f2837]' : 'text-gray-400'}`}>Pending Review</span>
                    </div>

                    {/* Step 4: Rejected / Approved */}
                    {isRejected ? (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-red-600 text-white">
                                <X className="h-5 w-5" />
                            </div>
                            <span className="text-[15px] font-medium text-[#1f2837]">Rejected</span>
                        </div>
                    ) : (
                        // If approved or just standard flow end
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500`}>
                                <X className="h-5 w-5" />
                            </div>
                            <span className="text-[15px] font-medium text-gray-400">Rejected</span>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Impressions */}
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[15px] font-medium text-[#5f6a7a]">Impressions</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${impressionsTrend.isPositive ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                {impressionsTrend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {impressionsTrend.value}%
                            </span>
                        </div>
                        <div className="text-[28px] font-bold text-[#1f2837] mb-1">{impressions.toLocaleString()}</div>
                        <div className="text-[13px] text-[#9ca3af]">{impressionsTrend.isPositive ? '+' : '-'}{impressionsTrend.change} than {impressionsTrend.period}</div>
                    </div>

                    {/* Listing Clicks */}
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[15px] font-medium text-[#5f6a7a]">Listing Clicks</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${clicksTrend.isPositive ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                {clicksTrend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {clicksTrend.value}%
                            </span>
                        </div>
                        <div className="text-[28px] font-bold text-[#1f2837] mb-1">{listingClicks.toLocaleString()}</div>
                        <div className="text-[13px] text-[#9ca3af]">{clicksTrend.isPositive ? '+' : '-'}{clicksTrend.change} than {clicksTrend.period}</div>
                    </div>

                    {/* Interests */}
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[15px] font-medium text-[#5f6a7a]">Interests</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${interestsTrend.isPositive ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                {interestsTrend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {interestsTrend.value}%
                            </span>
                        </div>
                        <div className="text-[28px] font-bold text-[#1f2837] mb-1">{interests.toLocaleString()}</div>
                        <div className="text-[13px] text-[#9ca3af]">{interestsTrend.isPositive ? '+' : '-'}{interestsTrend.change} than {interestsTrend.period}</div>
                    </div>

                    {/* Property Leads */}
                    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[15px] font-medium text-[#5f6a7a]">Property Leads</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${leadsTrend.isPositive ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#fef2f2] text-[#ef4444]'}`}>
                                {leadsTrend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {leadsTrend.value}%
                            </span>
                        </div>
                        <div className="text-[28px] font-bold text-[#1f2837] mb-1">{totalLeads.toLocaleString()}</div>
                        <div className="text-[13px] text-[#9ca3af]">{leadsTrend.isPositive ? '+' : '-'}{leadsTrend.change} than {leadsTrend.period}</div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column (Stats/Ranking) - span 8 */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Ranking & Info */}
                    <div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <span className="text-[16px] text-[#1f2837]">Listing Ranking</span>
                                <span className="text-[16px] font-semibold text-[#1f2837]">Top 30</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <span className="text-[16px] text-[#1f2837]">Total Credit Spent</span>
                                <span className="text-[16px] font-semibold text-[#1f2837]">30 AED</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <span className="text-[16px] text-[#1f2837]">Exposure</span>
                                <span className="text-[16px] font-semibold text-[#1f2837]">Standard</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-[14px] text-[#9ca3af] italic">
                                    Similar Properties are priced between the range of 3446 AED to 6880 AED
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quality Score Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[18px] font-bold text-[#1f2837]">Quality Score</span>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-[#ecfdf5] px-3 py-1.5 rounded-full">
                                    <span className="text-green-600 font-bold text-[15px]">{qsValue}/100</span>
                                </div>
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            {/* Description */}
                            <QualityScoreItem
                                label="Description"
                                value={Number(getDetailValue('description'))}
                                max={10}
                                icon={FileText}
                            />
                            {/* Images */}
                            <QualityScoreItem
                                label="Images"
                                value={Number(getDetailValue('images'))}
                                max={6}
                                icon={ImageIcon}
                            />
                            {/* Image Diversity */}
                            <QualityScoreItem
                                label="Image Diversity"
                                value={Number(getDetailValue('imageDiversity'))}
                                max={5}
                                icon={LayoutGrid}
                            />
                            {/* Image Duplicates */}
                            <QualityScoreItem
                                label="Image Duplicates"
                                value={Number(getDetailValue('imageDuplicates'))}
                                max={10}
                                icon={Copy}
                            />
                            {/* Image Dimensions */}
                            <QualityScoreItem
                                label="Image Dimensions"
                                value={Number(getDetailValue('imageDimensions'))}
                                max={18}
                                icon={Maximize}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column (Leads) - span 4 */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="mb-6">
                        <h2 className="text-[22px] font-semibold text-[#1f2837]">Leads</h2>
                    </div>

                    <div>
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <LeadCard key={lead.id} lead={lead} />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-[24px] border border-gray-100">
                                <div className="text-gray-400 mb-2">No leads yet</div>
                                <div className="text-sm text-gray-400">Leads from Property Finder will appear here</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

