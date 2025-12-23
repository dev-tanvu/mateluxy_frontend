'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Plus, ChevronDown, X } from 'lucide-react';
import { useOffPlanProperties } from '@/lib/hooks/use-off-plan-properties';
import { useQuery } from '@tanstack/react-query';
import { offPlanPropertyService } from '@/lib/services/off-plan-property.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OffPlanPropertyCard } from '@/components/off-plan-properties/off-plan-property-card';
import { OffPlanProperty } from '@/lib/services/off-plan-property.service';
import { PropertyFilters, PropertyFilterValues } from '@/components/off-plan-properties/property-filters';
import { SortMenu, SortConfig } from '@/components/properties/sort-menu';
import { useStickyFilter } from '@/hooks/use-sticky-filter';

export default function OffPlanUnpublishedPropertiesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ sortBy: 'date', sortOrder: 'desc' });
    const [filters, setFilters] = useState<PropertyFilterValues>({
        areaExpertIds: [],
        projectExpertIds: [],
        propertyTypes: [],
        minPrice: 0,
        maxPrice: 100000000,
        minArea: 0,
        maxArea: 50000,
        status: 'unpublished',
        reference: '',
        location: '',
        permitNumber: '',
    });

    // Fetch aggregates for dynamic filter ranges
    const { data: aggregates } = useQuery({
        queryKey: ['off-plan-aggregates'],
        queryFn: () => offPlanPropertyService.getAggregates(),
    });

    const { data: properties = [], isLoading } = useOffPlanProperties({
        search: searchQuery,
        areaExpertIds: filters.areaExpertIds,
        projectExpertIds: filters.projectExpertIds,
        propertyTypes: filters.propertyTypes,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minArea: filters.minArea,
        maxArea: filters.maxArea,
        status: filters.status,
        reference: filters.reference,
        location: filters.location,
        permitNumber: filters.permitNumber,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
    });

    const { isSticky, filterBarRef, sentinelRef } = useStickyFilter();

    return (
        <div className="flex min-h-screen bg-[#ffffff]">
            {/* Left Sidebar - Filters */}
            {isFiltersOpen && (
                <div className="w-[340px] flex-shrink-0 bg-white border-r border-[#EDF1F7] p-6 h-screen sticky top-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <PropertyFilters
                        onFiltersChange={setFilters}
                        minPrice={aggregates?.minPrice}
                        maxPrice={aggregates?.maxPrice}
                        minArea={aggregates?.minArea}
                        maxArea={aggregates?.maxArea}
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 p-8 max-w-[1600px] mx-auto">
                {/* Header Title */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[24px] font-semibold text-[#1A1A1A]">
                        Unpublished Properties <span className="text-[#8F9BB3] font-medium ml-1">({properties.length})</span>
                    </h1>
                    <Link href="/off-plan/new">
                        <Button className="bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] border-none shadow-none font-medium px-6 py-2.5 h-auto rounded-xl gap-2">
                            <Plus className="h-4 w-4" />
                            Add new
                        </Button>
                    </Link>
                </div>

                {/* Sentinel element to detect when filter bar should stick */}
                <div ref={sentinelRef} className="h-0" />

                {/* Search & Filters Bar - Sticky */}
                <div
                    ref={filterBarRef}
                    className={`flex items-center gap-3 bg-white py-4 mb-8 rounded-xl transition-all z-10 ${
                        isSticky ? 'sticky top-0 ' : ''
                    }`}
                >
                    {/* Search */}
                    <div className="relative flex-1 max-w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F9BB3]" />
                        <Input
                            type="text"
                            placeholder="Search for property, location.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border-[#EDF1F7] pl-10 h-[46px] rounded-xl focus:ring-[#0BA5EC] focus:border-[#0BA5EC] placeholder:text-[#8F9BB3] text-sm font-normal"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`h-[46px] px-5 rounded-lg border-[#EDF1F7] text-sm font-medium gap-2 shadow-none border-none transition-colors ${isFiltersOpen
                            ? 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                            : 'bg-white text-[#1A1A1A] hover:bg-gray-50'
                            }`}
                    >
                        {isFiltersOpen ? (
                            <X className="h-[18px] w-[18px]" />
                        ) : (
                            <SlidersHorizontal className="h-[18px] w-[18px]" />
                        )}
                        All Filters
                    </Button>

                    {/* Sort By */}
                    <div className="ml-auto">
                        <SortMenu value={sortConfig} onChange={setSortConfig} />
                    </div>
                </div>

                {/* Property Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-[450px] bg-gray-100 rounded-[20px] animate-pulse" />
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[20px] border border-[#EDF1F7] mt-8">
                        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No unpublished properties found</h3>
                        <p className="text-gray-500 max-w-sm">
                            We couldn't find any active properties that haven't been published to Property Finder.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                        {properties.map((property: OffPlanProperty) => (
                            <div key={property.id} className="flex justify-center">
                                <OffPlanPropertyCard property={property} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
