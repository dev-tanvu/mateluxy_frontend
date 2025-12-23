import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, BedDouble, Bath, Maximize2, Phone, Copy, Eye, Gauge, Check, X, Key, Tag, Pencil } from 'lucide-react';
import { Property, getProperty } from '@/services/property.service';
import { calculatePropertyScore, getScoreColor } from '@/lib/utils/property-scoring';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PropertyCardProps {
    property: Property;
    onStatusChange?: (id: string, status: 'AVAILABLE' | 'SOLD' | 'RENTED') => void;
    onToggleActive?: (id: string, isActive: boolean) => void;
}

export function PropertyCard({ property, onStatusChange, onToggleActive }: PropertyCardProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const score = calculatePropertyScore(property); // Now supports Property type
    const scoreColor = getScoreColor(score);

    const isDraft = !property.isActive;
    const isSold = property.status === 'SOLD';
    const isRented = property.status === 'RENTED';

    const handleWhatsAppClick = () => {
        const waNumber = property.assignedAgent?.whatsapp || property.assignedAgent?.phone;
        if (waNumber) {
            window.open(`https://wa.me/${waNumber.replace(/[^0-9]/g, '')}`, '_blank');
        }
    };

    const handleCall = (number: string) => {
        window.location.href = `tel:${number}`;
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on buttons or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="button"]')) {
            return;
        }
        router.push(`/properties/${property.id}`);
    };

    const handleCardHover = () => {
        // Prefetch property details when hovering
        queryClient.prefetchQuery({
            queryKey: ['property', property.id],
            queryFn: () => getProperty(property.id),
        });
    };

    const [imgSrc, setImgSrc] = React.useState(property.coverPhoto || '/placeholder-property.jpg');
    const [imgError, setImgError] = React.useState(false);

    const [useStandardImg, setUseStandardImg] = React.useState(false);

    // Reset image source when property changes
    React.useEffect(() => {
        setImgSrc(property.coverPhoto || '/placeholder-property.jpg');
        setUseStandardImg(false);
        setImgError(false);
    }, [property.coverPhoto]);

    // Simple Gray Blur Placeholder
    const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UzZTNlMyIvPjwvc3ZnPg==";

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={handleCardHover}
            className="bg-white rounded-[16px] border border-[1px] border-[#E6E6E6] hover:shadow-lg transition-all duration-300 group flex flex-col w-full max-w-[360px] overflow-hidden cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative h-[220px] w-full p-[10px]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-100">
                    {useStandardImg ? (
                        <img
                            src={imgSrc}
                            alt={property.propertyTitle || 'Property Image'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={() => {
                                if (!imgError) {
                                    setImgError(true);
                                    setImgSrc('/placeholder-property.jpg');
                                }
                            }}
                        />
                    ) : (
                        <Image
                            src={imgSrc}
                            alt={property.propertyTitle || 'Property Image'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                            quality={80}
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                            onError={() => {
                                // If Next/Image fails (e.g. 500 error), fallback to standard img tag
                                // This bypasses the Next.js image optimization layer which might be failing for this specific URL
                                setUseStandardImg(true);
                            }}
                        />
                    )}

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black-40 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        <div className={cn(
                            "px-[8px] h-[22px] py-[4px] text-white text-[11px] font-medium rounded-full tracking-wide",
                            property.purpose === 'Rent' ? "bg-[#FF111180]" : "bg-[#00AAFF80]"
                        )}>
                            <span>For {property.purpose?.toLowerCase()}</span>
                        </div>
                        <button
                            onClick={() => onToggleActive?.(property.id, !property.isActive)}
                            className={cn(
                                "px-[8px] py-[4px] text-white text-[11px] font-medium rounded-full tracking-wide cursor-pointer hover:opacity-90",
                                property.isActive ? "bg-[#00AAFF]" : "bg-gray-500"
                            )}
                        >
                            {property.isActive && property.pfPublished ? 'Published' : property.isActive ? 'Unpublished' : 'Draft'}
                        </button>
                    </div>

                    {/* Action Buttons (Top Right) */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        {['rent'].includes(property.purpose?.toLowerCase() || '') && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => onStatusChange?.(property.id, isRented ? 'AVAILABLE' : 'RENTED')}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer",
                                                isRented ? "bg-green-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                                            )}
                                        >
                                            <Key className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isRented ? 'Mark as Available' : 'Mark as Rented'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {['sale', 'sell', 'buy'].includes(property.purpose?.toLowerCase() || '') && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => onStatusChange?.(property.id, isSold ? 'AVAILABLE' : 'SOLD')}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer",
                                                isSold ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                                            )}
                                        >
                                            <Tag className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isSold ? 'Mark as Available' : 'Mark as Sold'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click
                                            router.push(`/properties/${property.id}/edit`);
                                        }}
                                        className="h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 bg-white/90 text-gray-700 hover:bg-white cursor-pointer"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit Property</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Bottom Overlay Info */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        {/* Property Type Badge */}
                        <div className="px-2.5 py-1 bg-[#C6EAFF]/40 border-[0.5px] border-[#25AFFF]/20 text-white text-[11px] font-medium rounded-md backdrop-blur-sm">
                            {property.propertyType || property.category}
                        </div>

                        {/* Price */}
                        <div className="text-white font-semibold text-[18px] drop-shadow-lg tracking-tight" style={{ fontFamily: 'var(--font-poppins)' }}>
                            {property.price?.toLocaleString()} AED
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-[18px] font-medium text-[#1A1A1A] mb-2 line-clamp-1 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    {property.propertyTitle}
                </h3>

                {/* Location */}
                <div className="flex font-medium items-center gap-1.5 text-[#8F9BB3] text-[13px] mb-4" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="w-4 h-4 rounded-full border border-[#FF4D4D] flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-[#FF4D4D] rounded-full" />
                    </div>
                    <span className="line-clamp-1">
                        {(() => {
                            // Priority 1: Use Property Finder location path (most accurate)
                            if (property.pfLocationPath) {
                                return property.pfLocationPath;
                            }

                            // Priority 2: Use address if it's different from title
                            const addr = property.address?.trim();
                            if (addr && addr !== property.propertyTitle) {
                                return addr;
                            }

                            // Priority 3: Use emirate
                            const emirate = property.emirate?.trim();
                            if (emirate) {
                                return emirate;
                            }

                            // Fallback
                            return 'Location not specified';
                        })()}
                    </span>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-5" style={{ fontFamily: 'var(--font-montserrat)' }}>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <BedDouble className="h-4 w-4 stroke-[1.5]" />
                        <span className="text-[13px] font-medium">
                            {property.bedrooms ? property.bedrooms.toString().padStart(2, '0') : '-'}
                        </span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Bath className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="text-[13px] font-medium">
                            {property.bathrooms ? property.bathrooms.toString().padStart(2, '0') : '-'}
                        </span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Maximize2 className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="text-[13px] font-medium">
                            {property.area || '-'} sq.ft
                        </span>
                    </div>
                </div>

                {/* Agent Info */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-100">
                            <Image
                                src={property.assignedAgent?.photoUrl || '/placeholder-user.jpg'}
                                alt={property.assignedAgent?.name || 'Agent'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-semibold text-[#1A1A1A] leading-tight">
                                {property.assignedAgent?.name || 'Unassigned'}
                            </span>
                            <span className="text-[11px] text-gray-500">
                                {property.assignedAgent?.languages?.length ? `Speaks ${property.assignedAgent.languages[0]}` : 'Agent'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleWhatsAppClick}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-[#E0F7FA] text-[#00C853] hover:bg-[#00C853] hover:text-white transition-all duration-300"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </button>

                        {property.assignedAgent?.phoneSecondary ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F7F9FC] text-[#8F9BB3] hover:bg-[#EDF1F7] hover:text-[#1A1A1A] transition-all duration-300">
                                        <Phone className="h-3.5 w-3.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleCall(property.assignedAgent!.phone)}>
                                        <Phone className="mr-2 h-4 w-4" />
                                        Primary: {property.assignedAgent?.phone}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCall(property.assignedAgent!.phoneSecondary!)}>
                                        <Phone className="mr-2 h-4 w-4" />
                                        Secondary: {property.assignedAgent?.phoneSecondary}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button
                                onClick={() => property.assignedAgent?.phone && handleCall(property.assignedAgent.phone)}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#F7F9FC] text-[#8F9BB3] hover:bg-[#EDF1F7] hover:text-[#1A1A1A] transition-all duration-300"
                            >
                                <Phone className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-auto pt-3 border-t border-[#EDF1F7] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        {/* Verification Shield */}
                        <Image
                            src={property.pfVerificationStatus?.toLowerCase() === 'approved' ? "/PFApprovedStatus.svg" : "/PFUnverifiedStatus.svg"}
                            alt={property.pfVerificationStatus?.toLowerCase() === 'approved' ? "Verified" : "Unverified"}
                            width={32}
                            height={32}
                            className="flex-shrink-0"
                        />

                        {/* Score Pill */}
                        <div className="flex px-[8px] items-center gap-1 h-[28px] rounded-full" style={{ backgroundColor: scoreColor.bg }}>
                            <Gauge className="w-2.5 h-2.5" style={{ color: scoreColor.icon }} />
                            <span className="text-[10px] font-semibold" style={{ color: scoreColor.text }}>
                                {property.pfVerificationStatus?.toLowerCase() === 'rejected' ? 'N/A' : `${score}/100`}
                            </span>
                        </div>
                        <div className="flex px-[8px] items-center gap-1 h-[28px] bg-[#E3F2FD] rounded-full">
                            <Eye className="w-2.5 h-2.5 text-[#2196F3]" />
                            <span className="text-[10px] font-semibold text-[#2196F3]">
                                {property.pfVerificationStatus?.toLowerCase() === 'rejected' ? 'N/A' : `${property.leadsCount || 0} Leads`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#9E9E9E]">
                        <span className="text-[10px] font-normal">{property.reference || 'REF-001'}</span>
                        <Copy className="h-2.5 w-2.5 cursor-pointer hover:text-[#1A1A1A]" />
                    </div>
                </div>
            </div>
        </div >
    );
}
