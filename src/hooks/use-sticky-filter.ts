import { useEffect, useRef, useState } from 'react';

/**
 * Hook to handle sticky filter bar behavior
 * The filter bar should scroll with the page initially,
 * then stick to the top when it reaches the viewport top
 */
export function useStickyFilter() {
    const [isSticky, setIsSticky] = useState(false);
    const filterBarRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const filterBar = filterBarRef.current;
        const sentinel = sentinelRef.current;

        if (!filterBar || !sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When the sentinel (which is positioned right before the filter bar) 
                // goes out of view, it means the filter bar has reached the top
                setIsSticky(!entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, []);

    return {
        isSticky,
        filterBarRef,
        sentinelRef,
    };
}

