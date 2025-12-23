import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface PfLocation {
    id: number;
    name: string;
    path: string;
    type: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

interface PfLocationAutocompleteProps {
    value?: string; // This will display the path
    pfLocationId?: number;
    onChange: (location: PfLocation) => void;
    placeholder?: string;
    className?: string;
    error?: string;
}

export function PfLocationAutocomplete({
    value,
    pfLocationId,
    onChange,
    placeholder = "Search Property Finder Location...",
    className,
    error
}: PfLocationAutocompleteProps) {
    const [searchQuery, setSearchQuery] = useState(''); // What user types
    const [displayValue, setDisplayValue] = useState(value || ''); // What is shown in input
    const [showDropdown, setShowDropdown] = useState(false);
    const [locations, setLocations] = useState<PfLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounce search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Update display value if prop changes
    useEffect(() => {
        if (value !== undefined) {
            setDisplayValue(value || '');
        }
    }, [value]);

    // Search effect
    useEffect(() => {
        const search = async () => {
            if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
                setLocations([]);
                return;
            }

            setIsLoading(true);
            try {
                // Using axios directly or confirm path. Assuming standard axios setup.
                // If api helper not found, fall back to fetch
                // Let's assume relative path /api/properties/pf-locations works if proxy is set up or full URL
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/properties/pf-locations?search=${encodeURIComponent(debouncedSearchQuery)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Basic auth handling
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLocations(data);
                } else {
                    console.error('Failed to search locations');
                }
            } catch (error) {
                console.error('Error searching locations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (showDropdown && debouncedSearchQuery) {
            search();
        }
    }, [debouncedSearchQuery, showDropdown]);

    const handleSelect = (location: PfLocation) => {
        console.log('PfLocationAutocomplete selected:', location);
        // Fallback to name if path is empty/null, as path is preferred but name should be safe
        const path = location.path || location.name || '';
        console.log('PfLocationAutocomplete setting displayValue to:', path);

        setDisplayValue(path);
        setSearchQuery(''); // Clear manual typing

        // Pass original location, but ensure we send safe data if needed
        onChange(location);
        setShowDropdown(false);
    };

    const handleInputClick = () => {
        setShowDropdown(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setDisplayValue(e.target.value);
        setShowDropdown(true);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
                // If closed without selection, revert to prop value if valid, or keep strict?
                // For now, let's just close.
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className="relative">
                <Input
                    type="text"
                    value={displayValue ?? ''}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    className={cn(
                        "h-[50px] pl-10 pr-10 bg-white border-[#EDF1F7] rounded-lg placeholder:text-gray-400 cursor-pointer text-left overflow-hidden text-ellipsis whitespace-nowrap",
                        error && "border-red-500"
                    )}
                    autoComplete="off"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    {/* PF Logo or Distinctive Icon */}
                    <span className="font-bold text-[10px] text-white bg-[#E6007E] rounded-full w-5 h-5 flex items-center justify-center">PF</span>
                </div>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    <ChevronDown
                        className={cn(
                            "h-5 w-5 text-gray-400 transition-transform pointer-events-none",
                            showDropdown && "rotate-180"
                        )}
                    />
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-[#EDF1F7] shadow-lg max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Searching Property Finder...</span>
                        </div>
                    ) : locations.length > 0 ? (
                        <div className="py-2">
                            {locations.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelect(loc)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex flex-col gap-1 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-gray-900">{loc.name}</span>
                                        {pfLocationId === loc.id && <Check className="w-4 h-4 text-[#E6007E]" />}
                                    </div>
                                    <span className="text-xs text-gray-500">{loc.path}</span>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery.length > 1 ? (
                        <div className="p-4 text-center text-gray-500">
                            No locations found
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Type to search locations...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
