import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getProperties } from '@/services/property.service';
import { PropertyFilterValues } from '@/components/properties/property-filters';
import { SortConfig } from '@/components/properties/sort-menu';

export function useInfiniteProperties(
    searchQuery: string,
    filters: PropertyFilterValues,
    sortConfig: SortConfig
) {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['properties', searchQuery, filters, sortConfig],
        queryFn: ({ pageParam = 1 }) => getProperties({
            search: searchQuery,
            agentIds: filters.agentIds,
            category: filters.category,
            purpose: filters.purpose,
            location: filters.location,
            reference: filters.reference,
            propertyTypes: filters.propertyTypes,
            permitNumber: filters.permitNumber,
            status: filters.status,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minArea: filters.minArea,
            maxArea: filters.maxArea,
            sortBy: sortConfig.sortBy,
            sortOrder: sortConfig.sortOrder,
            page: pageParam as number,
            limit: 10,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.page < lastPage.meta.totalPages) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        // Cache properties for 3 minutes for faster navigation
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Intersection Observer for Infinite Scroll
    // Place the observer target in the middle of the list to trigger loading early
    const observerTarget = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '600px' // Start loading when the trigger is 600px away from viewport
            }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten properties from all pages
    const properties = data?.pages.flatMap((page) => page.data) || [];
    const totalCount = data?.pages[0]?.meta?.total || 0;

    return {
        properties,
        totalCount,
        isLoading,
        isFetchingNextPage,
        observerTarget,
        fetchNextPage,
        hasNextPage
    };
}
