'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, updatePropertyStatus, togglePropertyActive, getPropertyAggregates, syncAllToPropertyFinder } from '@/services/property.service';
import { useInfiniteProperties } from '@/hooks/use-infinite-properties';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyCardSkeleton } from '@/components/properties/property-card-skeleton';
import { PropertyFilters, PropertyFilterValues } from '@/components/properties/property-filters';
import { SortMenu, SortConfig } from '@/components/properties/sort-menu';
import { Search, SlidersHorizontal, Plus, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { VirtuosoGrid } from 'react-virtuoso';
import { useStickyFilter } from '@/hooks/use-sticky-filter';

export default function AllPropertiesPage() {
    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showFilters, setShowFilters] = React.useState(false);
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ sortBy: 'date', sortOrder: 'desc' });
    const [filters, setFilters] = React.useState<PropertyFilterValues>({
        agentIds: [],
        category: '',
        purpose: '',
        location: '',
        reference: '',
        propertyTypes: [],
        permitNumber: '',
        status: 'published', // Initialize with published (Active)
        minPrice: 0,
        maxPrice: 100000000,
        minArea: 0,
        maxArea: 50000,
    });

    // Fetch aggregates
    const { data: aggregates } = useQuery({
        queryKey: ['property-aggregates'],
        queryFn: getPropertyAggregates,
    });

    // Use infinite scroll hook
    const { properties, totalCount, isLoading, isFetchingNextPage, observerTarget, fetchNextPage, hasNextPage } = useInfiniteProperties(
        searchQuery,
        filters,
        sortConfig
    );

    const { isSticky, filterBarRef, sentinelRef } = useStickyFilter();


    // Mutations with optimistic updates for instant UI feedback
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'AVAILABLE' | 'SOLD' | 'RENTED' }) =>
            updatePropertyStatus(id, status),
        onMutate: async ({ id, status }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['properties'] });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(['properties']);

            // Optimistically update cache
            queryClient.setQueriesData(
                { queryKey: ['properties'] },
                (old: any) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((prop: any) =>
                                prop.id === id ? { ...prop, status } : prop
                            ),
                        })),
                    };
                }
            );

            return { previousData };
        },
        onSuccess: () => {
            toast.success('Property status updated');
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(['properties'], context.previousData);
            }
            toast.error('Failed to update status');
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            // Also invalidate topAgents to update dashboard
            queryClient.invalidateQueries({ queryKey: ['topAgents'] });
        }
    });

    const activeMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            togglePropertyActive(id, isActive),
        onMutate: async ({ id, isActive }) => {
            await queryClient.cancelQueries({ queryKey: ['properties'] });
            const previousData = queryClient.getQueryData(['properties']);

            // Optimistically update
            queryClient.setQueriesData(
                { queryKey: ['properties'] },
                (old: any) => {
                    if (!old?.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((prop: any) =>
                                prop.id === id ? { ...prop, isActive } : prop
                            ),
                        })),
                    };
                }
            );

            return { previousData };
        },
        onSuccess: () => {
            toast.success('Property status toggled');
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['properties'], context.previousData);
            }
            toast.error('Failed to toggle status');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });

    const handleStatusChange = (id: string, status: 'AVAILABLE' | 'SOLD' | 'RENTED') => {
        statusMutation.mutate({ id, status });
    };

    const handleToggleActive = (id: string, isActive: boolean) => {
        activeMutation.mutate({ id, isActive });
    };

    const handleSyncToPropertyFinder = async () => {
        setIsSyncing(true);
        try {
            const result = await syncAllToPropertyFinder();
            if (result.success) {
                toast.success(`Synced ${result.synced} of ${result.total} properties to Property Finder`);
                if (result.failed > 0) {
                    toast.warning(`${result.failed} properties failed to sync`);
                }
            }
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        } catch (error: any) {
            toast.error(error.message || 'Failed to sync properties');
        } finally {
            setIsSyncing(false);
        }
    };



    return (
        <div className="flex min-h-screen bg-[#ffffff]">
            {/* Filters Sidebar */}
            {showFilters && (
                <div className="w-[340px] flex-shrink-0 bg-white border-r border-[#EDF1F7] p-6 h-screen sticky top-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <PropertyFilters
                        onFiltersChange={setFilters}
                        minPrice={aggregates?.minPrice}
                        maxPrice={aggregates?.maxPrice}
                        minArea={aggregates?.minArea}
                        maxArea={aggregates?.maxArea}
                        propertyTypes={aggregates?.propertyTypes || []}
                    />
                </div>
            )}

            <div className="flex-1 p-8 max-w-[1600px] mx-auto">
                {/* Header Title */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-[24px] font-semibold text-[#1A1A1A]" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Active Properties <span className="text-[#8F9BB3] font-medium ml-1">({totalCount})</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleSyncToPropertyFinder}
                            disabled={isSyncing}
                            className="bg-[#FFF3E0] text-[#FF9800] hover:bg-[#FFE0B2] border-none"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync to PF'}
                        </Button>
                        <Link
                            href="/properties/new"
                            onMouseEnter={() => {
                                // Prefetch agents list for the form
                                queryClient.prefetchQuery({
                                    queryKey: ['agents'],
                                    queryFn: async () => {
                                        const response = await fetch('/api/agents');
                                        return response.json();
                                    },
                                });
                                // Prefetch amenities if needed
                                queryClient.prefetchQuery({
                                    queryKey: ['amenities'],
                                    queryFn: async () => {
                                        const response = await fetch('/api/amenities');
                                        return response.json();
                                    },
                                });
                            }}
                        >
                            <Button className="bg-[#E3F2FD] text-[#2196F3] hover:bg-[#BBDEFB] border-none">
                                <Plus className="w-4 h-4 mr-2" />
                                Add new
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Sentinel element to detect when filter bar should stick */}
                <div ref={sentinelRef} className="h-0" />

                {/* Filters Bar - Sticky */}
                <div
                    ref={filterBarRef}
                    className={`flex items-center gap-4 bg-white py-4 mb-4 rounded-xl transition-all z-10 ${
                        isSticky ? 'sticky top-0' : ''
                    }`}
                >
                    <div className="relative flex-1 max-w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9BB3]" />
                        <Input
                            placeholder="Search for property, location.."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border-[#EDF1F7] pl-10 h-[44px] rounded-xl focus:ring-[#2196F3] focus:border-[#2196F3]"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-[46px] px-5 rounded-lg border-[#EDF1F7] text-sm font-medium gap-2 shadow-none border-none transition-colors ${showFilters
                            ? 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                            : 'bg-white text-[#1A1A1A] hover:bg-gray-50'
                            }`}
                    >
                        {showFilters ? (
                            <X className="h-[18px] w-[18px]" />
                        ) : (
                            <SlidersHorizontal className="h-[18px] w-[18px]" />
                        )}
                        All Filters
                    </Button>
                    <div className="ml-auto">
                        <SortMenu value={sortConfig} onChange={setSortConfig} />
                    </div>
                </div>

                {/* Grid Content */}
                {isLoading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex justify-center">
                                <PropertyCardSkeleton />
                            </div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn't find any properties matching your search. Try adjusting your filters or add a new property.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                        {properties.map((property) => (
                            <div key={property.id} className="flex justify-center">
                                <PropertyCard
                                    property={property}
                                    onStatusChange={handleStatusChange}
                                    onToggleActive={handleToggleActive}
                                />
                            </div>
                        ))}
                        {isFetchingNextPage && (
                            <div className="col-span-full flex justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        )}
                        {hasNextPage && !isFetchingNextPage && (
                            <div ref={observerTarget} className="h-4" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
