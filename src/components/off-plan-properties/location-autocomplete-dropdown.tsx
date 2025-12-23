'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const libraries: ("places")[] = ["places"];

interface LocationAutocompleteDropdownProps {
    value: string;
    onChange: (location: string) => void;
    placeholder?: string;
    className?: string;
}

export function LocationAutocompleteDropdown({
    value,
    onChange,
    placeholder = "Select Location",
    className
}: LocationAutocompleteDropdownProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Initialize autocomplete service when API is loaded
    useEffect(() => {
        if (isLoaded && window.google) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
        }
    }, [isLoaded]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search for place predictions
    useEffect(() => {
        if (!isLoaded || !autocompleteService.current || !searchQuery) {
            setPredictions([]);
            return;
        }

        setIsSearching(true);
        const timeoutId = setTimeout(() => {
            autocompleteService.current?.getPlacePredictions(
                {
                    input: searchQuery,
                    // Removed country restriction to allow UAE and Bangladesh
                    // Using location bias to still prioritize Dubai results
                    locationBias: {
                        center: new google.maps.LatLng(25.2048, 55.2708), // Dubai center
                        radius: 50000, // 50km radius for bias
                    },
                    types: ['locality', 'sublocality', 'neighborhood'],
                },
                (results, status) => {
                    setIsSearching(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        setPredictions(results);
                    } else {
                        setPredictions([]);
                    }
                }
            );
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isLoaded]);

    const handleLocationSelect = (prediction: google.maps.places.AutocompletePrediction) => {
        // Extract main location name (before the first comma)
        const locationName = prediction.structured_formatting.main_text;
        onChange(locationName);
        setShowDropdown(false);
        setSearchQuery('');
    };

    const handleInputClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            setSearchQuery('');
        }
    };

    if (!isLoaded) {
        return (
            <div className={cn("relative", className)}>
                <div className="relative">
                    <Input
                        type="text"
                        value=""
                        placeholder="Loading..."
                        disabled
                        className="h-[50px] pl-12 pr-12 bg-white border-[#EDF1F7] rounded-lg placeholder:text-gray-400"
                        readOnly
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className="relative">
                <Input
                    type="text"
                    value={showDropdown ? (searchQuery || '') : (value || '')}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={handleInputClick}
                    placeholder={placeholder}
                    className="h-[50px] pl-12 pr-12 bg-white border-[#EDF1F7] rounded-lg placeholder:text-gray-400 cursor-pointer"
                    autoComplete="off"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <ChevronDown
                    className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform pointer-events-none",
                        showDropdown && "rotate-180"
                    )}
                />
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-[#EDF1F7] shadow-lg max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Searching...</span>
                        </div>
                    ) : predictions.length > 0 ? (
                        <div className="py-2">
                            {predictions.map((prediction) => (
                                <button
                                    key={prediction.place_id}
                                    onClick={() => handleLocationSelect(prediction)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-0"
                                >
                                    <Search className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900">
                                            {prediction.structured_formatting.main_text}
                                        </div>
                                        {prediction.structured_formatting.secondary_text && (
                                            <div className="text-sm text-gray-500 truncate">
                                                {prediction.structured_formatting.secondary_text}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className="p-4 text-center text-gray-500">
                            No locations found for "{searchQuery}"
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Start typing to search locations in Dubai...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
