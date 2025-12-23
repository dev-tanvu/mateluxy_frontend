'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, BedDouble, Bath, Maximize2, Phone, ShieldCheck, Copy, Eye, Gauge, Pencil } from 'lucide-react';
import { OffPlanProperty } from '@/lib/services/off-plan-property.service';
import { Agent } from '@/lib/services/agent.service';
import { calculatePropertyScore, getScoreColor } from '@/lib/utils/property-scoring';

interface OffPlanPropertyCardProps {
    property: OffPlanProperty;
}

export function OffPlanPropertyCard({ property }: OffPlanPropertyCardProps) {
    const [showPhoneMenu, setShowPhoneMenu] = React.useState(false);
    const score = calculatePropertyScore(property);
    const scoreColor = getScoreColor(score);

    const handleWhatsAppClick = () => {
        // Placeholder for future implementation when we have agent details
        console.log("WhatsApp click - Agent details not available yet");
    };

    const handlePhoneClick = () => {
        // Placeholder for future implementation
        console.log("Phone click - Agent details not available yet");
    };

    const callPhone = (number: string) => {
        window.location.href = `tel:${number}`;
        setShowPhoneMenu(false);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on buttons or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
            return;
        }
        // Navigate to single property page (assuming route exists or will be created)
        // Using window.location for now as useRouter fits better in client components 
        // but we are already in a client component.
        // Let's use Link wrapper logic or just router.push if we add router.
        // Since we didn't import useRouter, let's add it.
    };

    return (
        <div className="bg-white rounded-[16px] border border-[1px] border-[#E6E6E6] hover:shadow-lg transition-all duration-300 group flex flex-col w-full relative cursor-pointer">
            <Link href={`/off-plan/${property.id}`} className="absolute inset-0 z-0" />

            {/* Edit Button - Always Visible, High Z-Index to be clickable over the card link */}
            <Link
                href={`/off-plan/${property.id}/edit`}
                className="absolute top-3 right-3 z-30 h-8 w-8 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-gray-700 hover:text-blue-500 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <Pencil className="h-4 w-4" />
            </Link>

            {/* Image Section */}
            <div className="relative h-[220px] w-full p-[10px] pointer-events-none">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden">
                    <Image
                        src={property.coverPhoto || '/placeholder-property.jpg'}
                        alt={property.projectTitle || 'Property Image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black-40 to-transparent" />

                    {/* Gradient Blur Overlay */}
                    <div
                        className="absolute rounded-[10px] inset-0 backdrop-blur-[7px]"
                        style={{
                            maskImage: 'linear-gradient(to top, black 0%, transparent 50%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 50%)'
                        }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                        <div className="px-[8px] h-[22px] py-[4px] bg-[#FF111180] text-white text-[11px] font-medium rounded-full tracking-wide"><span>
                            Off Plan
                        </span></div>
                        <span className={`px-[8px] py-[4px] text-white text-[11px] font-medium rounded-full tracking-wide ${property.isActive ? 'bg-[#00AAFF]' : 'bg-gray-500'
                            }`}>
                            {property.isActive ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                        {/* Glassmorphism Property Type */}
                        <div className="flex gap-2 flex-wrap max-w-[60%]">
                            {property.propertyType && property.propertyType.length > 0 ? (
                                property.propertyType.map((type, index) => (
                                    <div key={index} className="px-2.5 py-1 bg-[#C6EAFF]/40 border-[0.5px] border-[#25AFFF]/20 text-white text-[11px] font-medium rounded-md">
                                        {type}
                                    </div>
                                ))
                            ) : (
                                <div></div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="text-white font-semibold text-[18px] drop-shadow-lg tracking-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                            {property.startingPrice?.toLocaleString()} AED
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 pb-4 pt-1 flex-1 flex flex-col overflow-visible pointer-events-none">
                {/* Title */}
                <h3 className="text-[20px] font-medium text-[#1A1A1A] mb-2 line-clamp-1 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {property.projectTitle}
                </h3>

                {/* Location */}
                <div className="flex font-medium items-center gap-1.5 text-[#8F9BB3] text-[14px] mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="w-4 h-4 rounded-full border border-[#FF4D4D] flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-[#FF4D4D] rounded-full" />
                    </div>
                    <span className="line-clamp-1 font-medium">{property.address || property.emirate}</span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="flex items-center gap-1.5 text-[#000000]/40">
                        <BedDouble className="h-4 w-4 stroke-[1.5]" />
                        <span className="text-[13px] font-medium text-[#000000]/40">
                            {property.bedrooms != null ? property.bedrooms.toString().padStart(2, '0') : '-'}
                        </span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-[#000000]/40">
                        <Bath className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="text-[13px] font-medium text-[#000000]/40">
                            {property.bathrooms != null ? property.bathrooms.toString().padStart(2, '0') : '-'}
                        </span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-[#000000]/40">
                        <Maximize2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="text-[13px] font-medium text-[#000000]/40">
                            {property.area != null ? property.area : '-'} sq.ft
                        </span>
                    </div>
                </div>

                {/* Agent Section - Placeholder for now as we moved to multiple experts */}
                <div className="flex items-center justify-between mb-5 pointer-events-auto">
                    <div className="flex items-center">
                        <div className="relative h-[36px] w-[110px] flex items-center justify-start">
                            {property.developer?.logoUrl ? (
                                <Image
                                    src={property.developer.logoUrl}
                                    alt={property.developer.name}
                                    fill
                                    className="object-contain object-left"
                                />
                            ) : (
                                <span className="text-xs font-medium text-gray-500">
                                    {property.developer?.name || 'Developer'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 relative z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const salesManagerPhone = property.developer?.salesManagerPhone;
                                if (salesManagerPhone) {
                                    window.location.href = `tel:${salesManagerPhone}`;
                                }
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F7F9FC] text-[#8F9BB3] hover:bg-[#EDF1F7] hover:text-[#1A1A1A] transition-all duration-300 cursor-pointer"
                        >
                            <Phone className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-auto pt-3 border-t border-[#EDF1F7] flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5">
                        {/* Verification Shield */}
                        <Image
                            src="/PFApprovedStatus.svg"
                            alt="Verified"
                            width={32}
                            height={32}
                            className="flex-shrink-0"
                        />

                        {/* Score Pill */}
                        <div className="flex px-[8px] items-center gap-1 h-[32px] rounded-full" style={{ backgroundColor: scoreColor.bg }}>
                            <Gauge className="w-2.5 h-2.5" style={{ color: scoreColor.icon }} />
                            <span className="text-[11px] font-semibold" style={{ color: scoreColor.text, fontFamily: 'var(--font-plus-jakarta-sans)' }}>{score}/100</span>
                        </div>

                        {/* Leads Pill */}
                        <div className="flex px-[8px] items-center gap-1 h-[32px] bg-[#E3F2FD] rounded-full">
                            <Eye className="w-2.5 h-2.5 text-[#2196F3]" />
                            <span className="text-[11px] font-semibold text-[#2196F3]" style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}>
                                {property.leadsCount || 0} Leads
                            </span>
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="flex items-center gap-1 text-[#9E9E9E]">
                        <span className="text-[10px] font-normal">{property.reference || 'MAH173'}</span>
                        <Copy className="h-2.5 w-2.5 cursor-pointer hover:text-[#1A1A1A] transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
}
