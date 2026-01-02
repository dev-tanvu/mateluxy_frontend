'use client';

import React, { useState } from 'react';
import { Property, getProperties, getPropertyAggregates } from '@/services/property.service';
import { OffPlanProperty } from '@/lib/services/off-plan-property.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PropertyCard } from '@/components/properties/property-card';
import { OffPlanPropertyCard } from '@/components/off-plan-properties/off-plan-property-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { offPlanPropertyService } from '@/lib/services/off-plan-property.service';
import { PropertyFilters, PropertyFilterValues } from '@/components/properties/property-filters';
import { SortMenu, SortConfig } from '@/components/properties/sort-menu';
import { useStickyFilter } from '@/hooks/use-sticky-filter';
import { Search, SlidersHorizontal, Plus, X, ChevronRight, MapPin, Bed, Bath, Square, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PropertySelectionStepProps {
    onSelect: (property: Property | OffPlanProperty) => void;
}

export function PropertySelectionStep({ onSelect }: PropertySelectionStepProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [selectedProperty, setSelectedProperty] = useState<Property | OffPlanProperty | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const router = useRouter();

    const { data: propertiesData, isLoading: isLoadingProps } = useQuery({
        queryKey: ['properties', activeSearch],
        queryFn: () => getProperties({
            search: activeSearch || undefined,
            page: 1,
            limit: 40
        }),
    });

    const { data: offPlanProperties, isLoading: isLoadingOffPlan } = useQuery({
        queryKey: ['off-plan-properties', activeSearch],
        queryFn: () => offPlanPropertyService.getAll({
            search: activeSearch || undefined,
        }),
    });

    // Suggestion logic
    const suggestions = React.useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return [];
        const combined = [
            ...(propertiesData?.data || []),
            ...(offPlanProperties || [])
        ];
        return combined
            .filter(p => {
                const title = 'propertyTitle' in p ? (p as Property).propertyTitle : (p as OffPlanProperty).projectTitle;
                return title?.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .slice(0, 5);
    }, [searchTerm, propertiesData, offPlanProperties]);

    const isLoading = isLoadingProps || isLoadingOffPlan;

    const handleSelect = (property: Property | OffPlanProperty) => {
        setSelectedProperty(prev => prev?.id === property.id ? null : property);
    };

    const handleSuggestionClick = (property: Property | OffPlanProperty) => {
        setSelectedProperty(property);
        setShowSuggestions(false);
        onSelect(property); // Auto-proceed
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setActiveSearch(searchTerm);
            setShowSuggestions(false);
        }
    };

    const handleNext = () => {
        if (selectedProperty) {
            onSelect(selectedProperty);
        }
    };

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden">
            <div className="flex-1 p-8 max-w-[1400px] mx-auto w-full flex flex-col min-h-0">
                {/* Header Section - EXACT IMAGE MATCH */}
                <div className="flex-shrink-0 flex items-center gap-8 mb-12">
                    <h1 className="text-[28px] font-semibold text-[#1A1A1A]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Select Property
                    </h1>

                    {/* Inline Search Bar with Suggestions */}
                    <div className="relative w-full max-w-[340px]">
                        <div className="relative group">
                            <Input
                                placeholder="Search for property, location.."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={handleSearchKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="bg-white border-gray-100 pr-12 pl-6 h-[48px] rounded-full focus:ring-gray-50 focus:border-gray-300 text-[15px] placeholder:text-gray-400 transition-all font-normal"
                            />
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9BB3]" />
                        </div>

                        {/* Suggestions Dropdown - EXACT IMAGE MATCH */}
                        {showSuggestions && (searchTerm.length >= 2) && (
                            <div className="absolute top-[56px] left-0 bg-white rounded-[16px] border border-gray-100 shadow-2xl z-50 overflow-hidden w-[600px]">
                                {suggestions.length > 0 ? (
                                    <div className="p-4 flex flex-col gap-4 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full">
                                        {suggestions.map((p) => {
                                            const isOffPlan = !('propertyTitle' in p);
                                            const title = isOffPlan ? (p as OffPlanProperty).projectTitle : (p as Property).propertyTitle;
                                            const image = isOffPlan
                                                ? ((p as OffPlanProperty).coverPhoto || (p as OffPlanProperty).exteriorMedia?.[0])
                                                : ((p as Property).coverPhoto || (p as Property).mediaImages?.[0]);
                                            const location = (p as any).address || (p as any).emirate || 'Location not specified';
                                            const price = isOffPlan ? (p as OffPlanProperty).startingPrice : (p as Property).price;
                                            const frequency = !isOffPlan ? (p as Property).rentalPeriod : '';

                                            const beds = (p as any).bedrooms || 0;
                                            const baths = (p as any).bathrooms || 0;
                                            const area = (p as any).area || 0;

                                            return (
                                                <div
                                                    key={p.id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent blur
                                                        handleSuggestionClick(p);
                                                    }}
                                                    className="flex gap-4 p-3 bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-[14px] cursor-pointer group transition-all"
                                                >
                                                    {/* Left: Image with Tag */}
                                                    <div className="relative w-[180px] h-[110px] flex-shrink-0">
                                                        <img
                                                            src={image || '/images/property-placeholder.jpg'}
                                                            alt={title || 'Property'}
                                                            className="w-full h-full object-cover rounded-[10px]"
                                                        />
                                                        {isOffPlan && (
                                                            <div className="absolute top-2 left-2 bg-[#FF6B6B] text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px] shadow-sm">
                                                                Off Plan
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Details */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                        <div className="flex flex-col gap-1">
                                                            <h4 className="text-[15px] font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-[#2196F3] transition-colors leading-tight">
                                                                {title}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                                <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-500/10" />
                                                                <span className="text-[12px] font-medium truncate">{location}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-gray-500">
                                                            <div className="flex items-center gap-1.5">
                                                                <Bed className="w-4 h-4 text-gray-400" />
                                                                <span className="text-[12px] font-bold">{String(beds).padStart(2, '0')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Bath className="w-4 h-4 text-gray-400" />
                                                                <span className="text-[12px] font-bold">{String(baths).padStart(2, '0')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Square className="w-4 h-4 text-gray-400" />
                                                                <span className="text-[12px] font-bold">{area} sq.ft</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-[17px] font-black text-[#1A1A1A]">
                                                                {(price || 0).toLocaleString()} AED
                                                            </span>
                                                            {frequency && (
                                                                <span className="text-[12px] text-gray-400 font-bold uppercase tracking-tight">/{frequency}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                            <Search className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-[14px] font-medium text-gray-500">No properties found matching "{searchTerm}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Grid - Scrollable */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-200">
                    {isLoading ? (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex justify-center">
                                    <div className="w-full max-w-[360px] h-[380px] rounded-[16px] bg-white p-3 border border-gray-100 animate-pulse">
                                        <Skeleton className="h-[220px] w-full rounded-[10px] mb-4" />
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 pb-10">
                            {propertiesData?.data.map((property) => (
                                <div key={property.id} className="flex justify-center">
                                    <PropertyCard
                                        property={property}
                                        onClick={handleSelect}
                                        isSelected={selectedProperty?.id === property.id}
                                    />
                                </div>
                            ))}
                            {offPlanProperties?.map((property) => (
                                <div key={property.id} className="flex justify-center">
                                    <OffPlanPropertyCard
                                        property={property}
                                        onClick={handleSelect}
                                        isSelected={selectedProperty?.id === property.id}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions - PINNED INSIDE CONTAINER */}
                <div className="flex-shrink-0 pt-8 pb-4 flex items-center justify-between bg-white z-10">
                    <Button
                        variant="ghost"
                        className="h-[56px] px-12 bg-[#F5F5F5] text-[#1A1A1A] font-medium hover:bg-gray-200 rounded-2xl transition-all"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="h-[56px] px-14 bg-[#E1F5FE] text-[#00B0FF] font-semibold hover:bg-[#CCEEFF] rounded-2xl gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group border-none shadow-none"
                        onClick={handleNext}
                        disabled={!selectedProperty}
                    >
                        Next
                        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
