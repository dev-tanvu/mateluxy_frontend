'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Phone,
    MessageSquare,
    Edit3,
    Trash2,
    Check,
    X,
    ChevronDown,
    ArrowLeftRight,
    Gauge,
    Target,
    ChevronUp,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

// --- Shared Types ---

interface StatItem {
    label: string;
    value: string | number;
    trend: number;
    trendIsPositive: boolean;
    periodText: string;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    interest: string;
    agentName: string;
    agentImage: string;
    propertyImage: string;
}

export interface PropertyDetailData {
    id: string;
    title: string;
    location: string;
    description: string;
    price: string | number;
    area: string | number;
    coverPhoto: string;
    agent: {
        id?: string;
        name: string;
        photo: string;
        languages: string[];
        phone: string;
        phoneSecondary?: string;
        whatsapp: string;
    };
    developer?: {
        name: string;
        logoUrl: string;
        salesManagerPhone?: string;
        salesManagerPhoneSecondary?: string;
    };
    type: 'standard' | 'off-plan';
    status: 'draft' | 'submitted' | 'pending' | 'rejected' | 'approved' | 'published' | 'unpublished';
    rejectionDetail?: {
        reason: string;
        date: string;
    };
    stats: {
        impressions: StatItem;
        clicks: StatItem;
        interests: StatItem;
        leads: StatItem;
    };
    insights: {
        ranking: string;
        creditSpent: string;
        exposure: string;
        priceRange: string;
    };
    qualityScore: number;
    leads: Lead[];
}

// --- Sub-components ---

const OverviewTab = ({ data, onEdit }: { data: PropertyDetailData, onEdit?: () => void }) => {
    const isOffPlan = data.type === 'off-plan';

    const steps = isOffPlan ? [
        { key: 'draft', label: 'Draft Property' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'final', label: data.status === 'published' ? 'Published' : 'Unpublished' },
    ] : [
        { key: 'draft', label: 'Draft Property' },
        { key: 'submitted', label: 'Submitted' },
        { key: 'pending', label: 'Pending Verification' },
        { key: 'final', label: data.status === 'rejected' ? 'Not Verified' : 'Verified' },
    ];

    // Status mapping for timeline
    const isDraftDone = true; // Always checked
    const isSubmittedDone = data.status !== 'draft';
    const isPendingDone = data.status !== 'draft' && data.status !== 'submitted';
    const isFinalDone = isOffPlan ? data.status === 'published' : data.status === 'approved';
    const isRejected = !isOffPlan && data.status === 'rejected';

    const [isRejectionExpanded, setIsRejectionExpanded] = useState(false);
    const [isReasonExpanded, setIsReasonExpanded] = useState(false);

    return (
        <div className="p-10 space-y-10">
            <div className="relative pl-12 space-y-[30px]">
                {/* Vertical Line Removed as requested ("gray left bar below the statuses, don't need that") */}
                {/* We will render connecting lines individually per step */}

                {steps.map((step, index) => {
                    let isCompleted = false;
                    let stepRejected = false;

                    if (step.key === 'draft') isCompleted = isDraftDone;
                    if (step.key === 'submitted') isCompleted = isSubmittedDone;
                    if (step.key === 'pending') isCompleted = isPendingDone;
                    if (step.key === 'final') {
                        isCompleted = isFinalDone;
                        stepRejected = isRejected;
                    }

                    // Determine if the connecting line should be green (only if NEXT step is completed)
                    let isNextCompleted = false;
                    if (index < steps.length - 1) {
                        const nextStepKey = steps[index + 1].key;
                        if (nextStepKey === 'draft') isNextCompleted = isDraftDone;
                        if (nextStepKey === 'submitted') isNextCompleted = isSubmittedDone;
                        if (nextStepKey === 'pending') isNextCompleted = isPendingDone;
                        if (nextStepKey === 'final') isNextCompleted = isFinalDone;
                    }

                    // Only show rejection details if this is the rejected step and it is expanded
                    // We need a state for expansion. Since we are inside a map, we might need to lift state or assumes only one rejection possible.
                    // Given the request "dropdown... expanded also can be collapsed on click of not verified".
                    // I will change the Step Label to be a button or interactive.

                    return (
                        <div key={step.key} className="relative flex flex-col min-h-[50px]">
                            {/* Connecting Line (except for last step) */}
                            {index !== steps.length - 1 && (
                                <div className={cn(
                                    "absolute left-[14px] top-[15px] w-[2px] h-[calc(100%+50px)] z-0",
                                    isNextCompleted ? "bg-[#22C55E]" : "bg-[#EDF1F7]"
                                )} />
                            )}

                            <div className="flex items-center">
                                {/* Icon Circle */}
                                <div className={cn(
                                    "flex-shrink-0 h-[30px] w-[30px] rounded-full flex items-center justify-center z-10",
                                    isCompleted ? "bg-[#22C55E]" : stepRejected ? "bg-[#EF4444]" : "bg-[#EDF1F7]"
                                )}>
                                    {stepRejected ? (
                                        <X className="h-[14px] w-[14px] text-white" />
                                    ) : (
                                        <Check className={cn("h-[14px] w-[14px]", isCompleted ? "text-white" : "text-white")} />
                                    )}
                                </div>

                                {/* Text - Clickable for rejection */}
                                <div
                                    className={cn(
                                        "flex items-center gap-[17px] ml-[17px]",
                                        stepRejected ? "cursor-pointer" : ""
                                    )}
                                    onClick={() => stepRejected && setIsRejectionExpanded(!isRejectionExpanded)}
                                >
                                    <span className={cn(
                                        "text-[20px] font-normal transition-colors font-[var(--font-source-sans)]",
                                        (isCompleted || stepRejected) ? "text-[#1A1A1A]" : "text-[#8F9BB3]"
                                    )}>
                                        {step.label}
                                    </span>
                                    {stepRejected && (
                                        <ChevronDown className={cn(
                                            "h-6 w-6 text-gray-400 transition-transform duration-200",
                                            isRejectionExpanded ? "rotate-180" : ""
                                        )} />
                                    )}
                                </div>
                            </div>

                            {stepRejected && data.rejectionDetail && isRejectionExpanded && (
                                <div className="ml-[37px] mt-4 bg-[#F7F7F7] border-none rounded-[10px] p-[10px] space-y-3 shadow-none w-[365px]">
                                    <div className="space-y-1">
                                        <h4 className="text-[18px] font-normal text-black font-[var(--font-source-sans)]">Verification rejected</h4>
                                        <p className={cn(
                                            "text-[13px] font-normal font-[var(--font-outfit)] leading-relaxed",
                                            isReasonExpanded
                                                ? "text-[#8A8A8A]"
                                                : "bg-gradient-to-b from-[#8A8A8A] to-[#FFFCFC] bg-clip-text text-transparent line-clamp-2"
                                        )}>
                                            There are some issues with the property verification. The detailed reason has been sent to your email address.
                                            This issue typically arises when the provided documents do not match the property records or if there are discrepancies in the submitted information. Please review the guidelines.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                                            className="flex items-center gap-1 text-left text-[14px] font-normal text-[#1A1A1A] font-[var(--font-source-sans)]"
                                        >
                                            {isReasonExpanded ? "Read less" : "Read more"}
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", isReasonExpanded ? "rotate-180" : "")} />
                                        </button>

                                        <Button
                                            onClick={onEdit}
                                            className="w-full h-[40px] bg-[rgba(0,183,255,0.08)] hover:bg-[rgba(0,183,255,0.15)] text-[#00AAFF] text-[15px] font-normal rounded-[10px] font-[var(--font-outfit)] border-none shadow-none"
                                        >
                                            Resubmit Property
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const InsightsTab = ({ data }: { data: PropertyDetailData }) => {
    const stats = [
        { ...data.stats.impressions },
        { ...data.stats.clicks },
        { ...data.stats.interests },
        { ...data.stats.leads },
    ];


    return (
        <div className="p-10 space-y-10">
            {/* Disclaimer */}
            <div className="text-center text-[#8F9BB3] text-[14px] italic font-[var(--font-source-sans)] bg-[#F9FAFB] py-2 rounded-lg border border-[#EDF1F7] mb-2">
                Data fetched from Mateluxy Website
            </div>
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#FBFBFB] border border-[#EDF1F7] rounded-[15px] p-5 shadow-none flex flex-col justify-center">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[18px] font-semibold text-[#6D6D6D] font-[var(--font-source-sans)]">{stat.label}</span>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-bold bg-[#F5F5F5] text-[#8F9BB3]">
                                N/A
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[17px] font-semibold text-[#1A1A1A] font-[var(--font-source-sans)]">0</span>
                            <span className="text-[14px] font-normal text-[#848484] font-[var(--font-source-sans)]">
                                + 0 than last week
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0]">
                    <span className="text-[16px] font-normal text-[#1A1A1A] font-[var(--font-source-sans)]">Listing Ranking</span>
                    <span className="text-[16px] font-medium text-[#1A1A1A] font-[var(--font-source-sans)]">N/A</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0]">
                    <span className="text-[16px] font-normal text-[#1A1A1A] font-[var(--font-source-sans)]">Total Credit Spent</span>
                    <span className="text-[16px] font-medium text-[#1A1A1A] font-[var(--font-source-sans)]">N/A</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-[#F0F0F0]">
                    <span className="text-[16px] font-normal text-[#1A1A1A] font-[var(--font-source-sans)]">Exposure</span>
                    <span className="text-[16px] font-medium text-[#1A1A1A] font-[var(--font-source-sans)]">N/A</span>
                </div>

                <div className="text-center italic text-[#8F9BB3] text-[14px] font-[var(--font-source-sans)] pt-4 pb-2">
                    {(() => {
                        const priceNum = typeof data.price === 'string' ? parseFloat(data.price.replace(/,/g, '')) : data.price;
                        if (!priceNum || isNaN(priceNum)) return "Price range data unavailable";
                        const lower = Math.floor(priceNum * 0.9);
                        const upper = Math.ceil(priceNum * 1.1);
                        return `Similar Properties are priced between the range of ${lower.toLocaleString()} AED to ${upper.toLocaleString()} AED`;
                    })()}
                </div>
            </div>

            <div className="bg-[#F8F9FC] rounded-[24px] border border-[#EDF1F7] overflow-hidden">
                <div className="w-full flex items-center justify-between p-6">
                    <span className="text-[18px] font-bold text-[#1A1A1A]">Quality Score</span>
                    <div className="bg-[#E7F9EF] text-[#22C55E] px-4 py-1.5 rounded-full flex items-center gap-2 text-[15px] font-bold">
                        <Gauge className="h-4.5 w-4.5" />
                        {data.qualityScore}/100
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeadsTab = ({ data }: { data: PropertyDetailData }) => {
    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
            <div className="h-16 w-16 bg-[#F9FAFB] rounded-full flex items-center justify-center border border-[#EDF1F7]">
                <Users className="h-8 w-8 text-[#8F9BB3]" />
            </div>
            <div className="space-y-2">
                <h3 className="text-[18px] font-semibold text-[#1A1A1A] font-[var(--font-source-sans)]">No Leads Available Yet</h3>
                <p className="text-[14px] text-[#8F9BB3] font-[var(--font-source-sans)] max-w-[300px] mx-auto">
                    Leads data will be fetched directly from the Mateluxy Website once connected.
                </p>
            </div>
        </div>
    );
};

// --- Main View ---

interface PropertyDetailViewProps {
    data: PropertyDetailData;
    onEdit?: () => void;
}

export function PropertyDetailView({ data, onEdit }: PropertyDetailViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'leads'>('overview');

    return (
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8 p-10 font-[var(--font-plus-jakarta-sans)] bg-[#FDFDFD]">
            {/* Left Column */}
            <div
                className="border border-[#EDF1F7] rounded-[15px] p-[10px] flex flex-col h-fit sticky top-10 shadow-none space-y-[20px]"
                style={{ backgroundColor: 'rgba(247, 247, 247, 0.31)' }}
            >
                <div className="relative aspect-[2/1] w-full rounded-[10px] overflow-hidden border border-[#EDF1F7] shadow-sm">
                    <Image
                        src={data.coverPhoto}
                        alt={data.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="space-y-[20px] flex-1">
                    <div className="space-y-3">
                        <h1
                            className="text-[26px] font-normal leading-[1.2] font-[var(--font-outfit)] bg-clip-text text-transparent bg-gradient-to-br from-[#2D2D2D] to-[#878787]"
                        >
                            {data.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border border-[#EF4444] flex items-center justify-center flex-shrink-0">
                                <Target className="h-3 w-3 text-[#EF4444] fill-[#EF4444]" />
                            </div>
                            <span
                                className="text-[16px] font-medium font-[var(--font-montserrat)]"
                                style={{ color: 'rgba(0, 0, 0, 0.4)' }}
                            >
                                {data.location}
                            </span>
                        </div>
                    </div>

                    <p className="text-[16px] leading-[1.6] line-clamp-3 font-normal font-[var(--font-outfit)] bg-clip-text text-transparent bg-gradient-to-b from-[#8A8A8A] to-[#FFFCFC]">
                        {data.description}
                    </p>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between pb-2 border-b border-[#EDF1F7]">
                            <span className="text-[16px] font-normal text-[#000000] font-[var(--font-source-sans)]">Property Price</span>
                            <span className="text-[16px] font-medium text-[#000000] font-[var(--font-source-sans)]">{data.price} AED</span>
                        </div>
                        <div className="flex items-center justify-between pb-2">
                            <span className="text-[16px] font-normal text-[#000000] font-[var(--font-source-sans)]">Property Area</span>
                            <span className="text-[16px] font-medium text-[#000000] font-[var(--font-source-sans)]">{data.area} sq.ft.</span>
                        </div>
                    </div>

                    {/* Agent/Developer Section */}
                    <div className="bg-[#F8F8F8] rounded-[10px] p-5">
                        {data.developer ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative h-[36px] w-[140px] flex items-center justify-start">
                                        <Image
                                            src={data.developer.logoUrl}
                                            alt={data.developer.name}
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {data.developer?.salesManagerPhoneSecondary ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="h-[44px] w-[44px] flex items-center justify-center rounded-full bg-[#F2F2F2] text-[#1A1A1A] hover:bg-gray-200 transition-all duration-300 cursor-pointer">
                                                    <Phone className="h-[20px] w-[20px]" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => window.location.href = `tel:${data.developer?.salesManagerPhone} `}>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Primary: {data.developer?.salesManagerPhone}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.location.href = `tel:${data.developer?.salesManagerPhoneSecondary} `}>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Secondary: {data.developer?.salesManagerPhoneSecondary}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <button
                                            onClick={() => data.developer?.salesManagerPhone && (window.location.href = `tel:${data.developer.salesManagerPhone} `)}
                                            className="h-[44px] w-[44px] flex items-center justify-center rounded-full bg-[#F2F2F2] text-[#1A1A1A] hover:bg-gray-200 transition-all duration-300 cursor-pointer"
                                        >
                                            <Phone className="h-[20px] w-[20px]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                        const agentId = data.agent.id || '1';
                                        router.push(`/agents/${agentId}`);
                                    }}
                                >
                                    <div className="relative h-[50px] w-[50px] rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={data.agent.photo || "/profile.svg"}
                                            alt={data.agent.name || "Agent"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[16px] font-normal text-[#000000] leading-tight font-[var(--font-poppins)]">
                                            {data.agent.name}
                                        </span>
                                        <span className="text-[12px] font-normal text-[#000000]/40 font-[var(--font-poppins)] mt-0.5">
                                            Speaks in {data.agent.languages.join(', ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5">
                                    <button
                                        onClick={() => {
                                            const cleanPhone = data.agent.whatsapp.replace(/\D/g, '');
                                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                        }}
                                        className="h-[44px] w-[44px] flex items-center justify-center rounded-full bg-[#E7F9EF] text-[#22C55E] hover:opacity-80 transition-all duration-300"
                                    >
                                        <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </button >

                                    {
                                        data.agent.phoneSecondary ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-[44px] w-[44px] flex items-center justify-center rounded-full bg-[#F2F2F2] text-[#1A1A1A] hover:opacity-80 transition-all duration-300">
                                                        <Phone className="h-[20px] w-[20px]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => window.location.href = `tel:${data.agent.phone}`}>
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Primary: {data.agent.phone}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.location.href = `tel:${data.agent.phoneSecondary}`}>
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Secondary: {data.agent.phoneSecondary}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <button
                                                onClick={() => data.agent.phone && (window.location.href = `tel:${data.agent.phone}`)}
                                                className="h-[44px] w-[44px] flex items-center justify-center rounded-full bg-[#F2F2F2] text-[#1A1A1A] hover:opacity-80 transition-all duration-300"
                                            >
                                                <Phone className="h-[20px] w-[20px]" />
                                            </button>
                                        )
                                    }
                                </div >
                            </div >
                        )}
                    </div >

                </div >

                {/* Actions */}
                < div className="grid grid-cols-2 gap-4 pt-2" >
                    <Button
                        className="h-[56px] border-none shadow-none gap-2 transition-transform active:scale-[0.98] rounded-[10px]"
                        style={{ backgroundColor: 'rgba(0, 183, 255, 0.08)', color: '#00AAFF' }}
                        onClick={onEdit}
                    >
                        <Edit3 className="h-6 w-6" style={{ color: '#00AAFF' }} />
                        <span className="text-[15px] font-normal font-[var(--font-outfit)]">Edit Property</span>
                    </Button>
                    <Button
                        className="h-[56px] border-none shadow-none gap-2 transition-transform active:scale-[0.98] rounded-[10px]"
                        style={{ backgroundColor: 'rgba(255, 0, 0, 0.08)', color: '#FF0000' }}
                    >
                        <Trash2 className="h-6 w-6" style={{ color: '#FF0000' }} />
                        <span className="text-[16px] font-normal font-[var(--font-outfit)]">Delete Property</span>
                    </Button>
                </div >
            </div >

            {/* Right Column (Tabs) */}
            < div
                className="border border-[#EDF1F7] rounded-[15px] flex flex-col h-fit overflow-hidden"
                style={{ backgroundColor: 'rgba(247, 247, 247, 0.31)' }}
            >
                {/* Tab Headers */}
                < div className="flex p-[7px] bg-transparent rounded-[15px] border border-[#EDF1F7]" style={{ backgroundColor: 'rgba(247, 247, 247, 0.31)' }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "flex-1 py-4.5 text-[16px] font-semibold transition-all rounded-[10px] font-[var(--font-source-sans)]",
                            activeTab === 'overview' ? "bg-[#E9F8FF] text-[#00AAFF]" : "text-[#585858] hover:text-[#00AAFF]"
                        )}
                    >
                        Property Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={cn(
                            "flex-1 py-4.5 text-[16px] font-semibold transition-all rounded-[10px] font-[var(--font-source-sans)]",
                            activeTab === 'insights' ? "bg-[#E9F8FF] text-[#00AAFF]" : "text-[#585858] hover:text-[#00AAFF]"
                        )}
                    >
                        Property Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={cn(
                            "flex-1 py-4.5 text-[16px] font-semibold transition-all rounded-[10px] font-[var(--font-source-sans)]",
                            activeTab === 'leads' ? "bg-[#E9F8FF] text-[#00AAFF]" : "text-[#585858] hover:text-[#00AAFF]"
                        )}
                    >
                        Property Leads
                    </button>
                </div >

                {/* Tab Content */}
                < div className="flex-1 min-h-[700px]" >
                    {activeTab === 'overview' && <OverviewTab data={data} onEdit={onEdit} />}
                    {activeTab === 'insights' && <InsightsTab data={data} />}
                    {activeTab === 'leads' && <LeadsTab data={data} />}
                </div >
            </div >
        </div >
    );
}
