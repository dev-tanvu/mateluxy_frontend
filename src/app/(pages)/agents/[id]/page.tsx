'use client';

import React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    MapPin,
    Briefcase,
    LayoutGrid,
    Languages,
    CheckCircle2,
    FileText,
    User,
    CreditCard,
    Calendar,
    Phone,
    ChevronDown
} from 'lucide-react';

import { getProperties } from '@/services/property.service';
import { useAgent } from '@/lib/hooks/use-agents';
import { PropertyCard } from '@/components/properties/property-card';
import { OffPlanPropertyCard } from '@/components/off-plan-properties/off-plan-property-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { offPlanPropertyService } from '@/lib/services/off-plan-property.service';

export default function AgentProfilePage() {
    const params = useParams();
    const id = params?.id as string;
    const [activeTab, setActiveTab] = React.useState<'properties' | 'posts' | 'documents'>('properties');
    const [isBioExpanded, setIsBioExpanded] = React.useState(false);

    // Fetch real agent data
    const { data: agent, isLoading: isAgentLoading } = useAgent(id);

    // Fetch standard properties
    const { data: propertiesData, isLoading: isPropertiesLoading } = useQuery({
        queryKey: ['agent-properties', id],
        queryFn: () => getProperties({ agentIds: [id], limit: 20 }),
        enabled: !!id,
    });

    // Fetch off-plan properties (where project expert or area expert)
    const { data: offPlanData, isLoading: isOffPlanLoading } = useQuery({
        queryKey: ['agent-off-plan', id],
        queryFn: () => offPlanPropertyService.getAll({
            projectExpertIds: [id],
            areaExpertIds: [id],
        }),
        enabled: !!id,
    });

    const standardProperties = propertiesData?.data || [];
    const offPlanProperties = offPlanData || [];

    // Combine standard and off-plan properties
    const combinedProperties = [
        ...standardProperties.map(p => ({ ...p, _type: 'standard' as const })),
        ...offPlanProperties.map(p => ({ ...p, _type: 'off-plan' as const }))
    ];

    if (isAgentLoading) {
        return (
            <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A3FF]"></div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Agent not found</h2>
                    <p className="text-gray-500">The agent profile you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    // Format dates safely
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (e) {
            return dateString;
        }
    };

    const bioText = agent.about || "No bio available for this agent.";

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-20 font-sans">
            <div className="max-w-[1440px] mx-auto px-[96px]">
                {/* Header Card */}
                <div className="bg-white border border-[#EEEEEE] rounded-[13px] overflow-hidden mb-8">
                    {/* Banner Section */}
                    <div className="relative h-[250px] w-full">
                        <Image
                            src="/agent_cover.png"
                            alt="Cover"
                            fill
                            className="object-cover"
                            priority
                        />

                        {/* Banner Info Overlays - Positioned to bottom-right of avatar */}
                        <div className="absolute bottom-6 left-[240px] flex items-center gap-[40px]">
                            {/* Joined */}
                            <div className="flex items-start gap-3">
                                <User className="w-[24px] h-[24px] text-white mt-[2px]" strokeWidth={1.5} />
                                <div className="flex flex-col">
                                    <span className="text-[16px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>Joined</span>
                                    <span className="text-[16px] text-white font-semibold leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                                        {formatDate(agent.joinedDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Visa Expires */}
                            <div className="flex items-start gap-3">
                                <CreditCard className="w-[24px] h-[24px] text-white mt-[2px]" strokeWidth={1.5} />
                                <div className="flex flex-col">
                                    <span className="text-[16px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>Visa Expires</span>
                                    <span className="text-[16px] text-white font-semibold leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                                        {formatDate(agent.visaExpiryDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Birthdate */}
                            <div className="flex items-start gap-3">
                                <Calendar className="w-[24px] h-[24px] text-white mt-[2px]" strokeWidth={1.5} />
                                <div className="flex flex-col">
                                    <span className="text-[16px] text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>Birthdate</span>
                                    <span className="text-[16px] text-white font-semibold leading-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                                        {formatDate(agent.birthdate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info Bar */}
                    <div className="px-10 py-5 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="relative w-[153px] h-[153px] rounded-full border-[3px] border-white bg-white overflow-hidden z-20 box-border -mt-[85px]">
                                    {agent.photoUrl ? (
                                        <Image
                                            src={agent.photoUrl}
                                            alt={agent.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-b from-[#E8F5E9] to-[#F1F8E9] flex items-center justify-center">
                                            <User className="h-16 w-16 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Name & Handle */}
                                <div className="">
                                    <h1 className="text-[24px] font-medium text-[#000000] leading-tight mb-0.5" style={{ fontFamily: 'var(--font-outfit)' }}>
                                        {agent.name}
                                    </h1>
                                    <p className="text-[#898989] text-[16px] font-normal" style={{ fontFamily: 'var(--font-outfit)' }}>
                                        @{agent.username || agent.name.toLowerCase().replace(/\s+/g, '')}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side Actions */}
                            <div className="flex items-center gap-5">
                                {/* Scoring Design */}
                                <div className="relative w-[48px] h-[48px] flex items-center justify-center mr-2">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#029DFE" />
                                                <stop offset="100%" stopColor="#00FFA6" />
                                            </linearGradient>
                                        </defs>
                                        {/* Track */}
                                        <path
                                            className="text-[#E7F9F7]"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                        />
                                        {/* Progress */}
                                        <path
                                            stroke="url(#scoreGradient)"
                                            strokeDasharray="80, 100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                        {/* Small White Knob/Dot at the end of the arc */}
                                        <circle cx="5" cy="11" r="3" fill="white" stroke="#00FFA6" strokeWidth="1.5" />
                                    </svg>
                                    <span className="absolute text-[14px] font-bold text-[#1A1A1A]">
                                        80
                                    </span>
                                </div>

                                {/* WhatsApp Button */}
                                <Button
                                    className="bg-[#E9F7F0] hover:opacity-90 text-[#249F62] border-none px-[20px] h-[48px] rounded-[10px] gap-2.5 font-semibold text-[12px]"
                                    style={{ fontFamily: 'var(--font-montserrat)' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(`https://wa.me/${agent.whatsapp}`, '_blank');
                                    }}
                                >
                                    <Image src="/svg/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                                    <span>WhatsApp</span>
                                </Button>

                                {/* Call Button */}
                                <Button
                                    variant="outline"
                                    className="bg-[#F6F6F6] text-[#595959] border-none hover:opacity-90 px-[20px] h-[48px] rounded-[10px] gap-2.5 font-semibold text-[12px]"
                                    style={{ fontFamily: 'var(--font-montserrat)' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `tel:${agent.phone}`;
                                    }}
                                >
                                    <Image src="/svg/phone_icon.svg" alt="Call" width={15} height={15} />
                                    <span>Call</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

                    {/* Left Column: About Section Card */}
                    <div className="space-y-6 sticky top-6 self-start">
                        <div className="bg-white rounded-[13px] border border-[#EEEEEE] p-8">
                            <h2 className="text-[18px] font-medium text-[#000000] mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>About</h2>

                            <div className="relative mb-2">
                                <p
                                    className={cn(
                                        "text-[#414141] text-[12px] leading-relaxed transition-all duration-300",
                                        !isBioExpanded && "line-clamp-3"
                                    )}
                                    style={{ fontFamily: 'var(--font-outfit)' }}
                                >
                                    "{bioText}"
                                </p>
                                {!isBioExpanded && bioText.length > 100 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                )}
                            </div>

                            {bioText.length > 100 && (
                                <button
                                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                                    className="flex items-center gap-1 text-left text-[14px] font-normal text-[#1A1A1A] font-[var(--font-source-sans)] mb-8"
                                >
                                    {isBioExpanded ? "Read less" : "Read more"}
                                    <ChevronDown className={cn("h-4 w-4 transition-transform", isBioExpanded ? "rotate-180" : "")} />
                                </button>
                            )}

                            <div className="space-y-[10px]">
                                <InfoItem iconSrc="/svg/address_icon.svg" text={agent.address || "No address provided"} />
                                <InfoItem iconSrc="/svg/work_icon.svg" text={<span>Works at <span className="font-bold text-[#1A1A1A]">{agent.department || "Frooxi"}</span></span>} />
                                <InfoItem iconSrc="/svg/post_icon.svg" text={`${0} Posts`} />
                                <InfoItem iconSrc="/svg/properties_icon.svg" text={`${(agent as any)._count?.totalAssigned || 0} Properties`} />
                                <InfoItem iconSrc="/svg/language_icon.svg" text={<span>Speaks <span className="font-bold text-[#1A1A1A]">{agent.languages?.join(', ') || "N/A"}</span></span>} />
                                <InfoItem iconSrc="/svg/area_expert_icon.svg" text={agent.areasExpertIn?.[0] ? `Expert in ${agent.areasExpertIn[0]}` : "Area expertise not specified"} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs and Content Card */}
                    <div className="space-y-6">
                        {/* Tabs Bar Card */}
                        <div className="bg-white rounded-[13px] border border-[#EEEEEE] px-2 py-2 flex items-center sticky top-0 z-30">
                            <TabBtn
                                active={activeTab === 'properties'}
                                iconSrc="/svg/properties_icon.svg"
                                label={`Properties (${combinedProperties.length})`}
                                onClick={() => setActiveTab('properties')}
                            />
                            <div className="w-[1px] h-6 bg-[#EEEEEE] mx-1"></div>
                            <TabBtn
                                active={activeTab === 'posts'}
                                iconSrc="/svg/post_icon.svg"
                                label="Posts"
                                onClick={() => setActiveTab('posts')}
                            />
                            <div className="w-[1px] h-6 bg-[#EEEEEE] mx-1"></div>
                            <TabBtn
                                active={activeTab === 'documents'}
                                iconSrc="/svg/document_icon.svg"
                                label="Documents"
                                onClick={() => setActiveTab('documents')}
                            />
                        </div>

                        {/* Tab Content Display */}
                        <div>
                            {activeTab === 'properties' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                    {isPropertiesLoading || isOffPlanLoading ? (
                                        Array(4).fill(0).map((_, i) => (
                                            <div key={i} className="h-[380px] w-full bg-white rounded-[13px] border border-[#EEEEEE] animate-pulse"></div>
                                        ))
                                    ) : (
                                        combinedProperties.map((property) => (
                                            property._type === 'standard' ? (
                                                <PropertyCard key={property.id} property={property as any} />
                                            ) : (
                                                <OffPlanPropertyCard key={property.id} property={property as any} />
                                            )
                                        ))
                                    )}
                                    {!(isPropertiesLoading || isOffPlanLoading) && combinedProperties.length === 0 && (
                                        <div className="col-span-2 py-20 text-center text-gray-400 bg-white rounded-[13px] border border-dashed border-[#EEEEEE]">
                                            No properties found for this agent.
                                        </div>
                                    )}
                                </div>
                            )}

                            {(activeTab === 'posts' || activeTab === 'documents') && (
                                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[13px] border border-[#EEEEEE]">
                                    <div className="w-16 h-16 bg-[#F8F9FC] rounded-full flex items-center justify-center mb-4">
                                        {activeTab === 'posts' ? <LayoutGrid className="text-gray-300" /> : <FileText className="text-gray-300" />}
                                    </div>
                                    <h3 className="text-[18px] font-medium text-[#1A1A1A]">No {activeTab === 'posts' ? 'Posts' : 'Documents'} Available</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code

function WhatsAppIcon() {
    return (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    )
}

function InfoItem({ iconSrc, text }: { iconSrc: string, text: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 text-[#656565]">
            <Image src={iconSrc} alt="" width={20} height={20} className="w-[20px] h-[20px]" />
            <span className="text-[12px] font-normal" style={{ fontFamily: 'var(--font-poppins)' }}>{text}</span>
        </div>
    )
}

function TabBtn({ active, iconSrc, label, onClick }: { active: boolean, iconSrc: string, label: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-3 py-3 text-[15px] transition-all duration-200",
                active ? "text-[#00AAFF] font-medium" : "text-[#616161] font-normal"
            )}
            style={{ fontFamily: 'var(--font-poppins)' }}
        >
            <div
                className={cn(
                    "w-[20px] h-[20px]",
                    active ? "bg-[#00AAFF]" : "bg-[#616161]"
                )}
                style={{
                    maskImage: `url(${iconSrc})`,
                    WebkitMaskImage: `url(${iconSrc})`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center'
                }}
            />
            {label}
        </button>
    )
}
