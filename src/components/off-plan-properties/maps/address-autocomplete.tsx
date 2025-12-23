'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const libraries: ("places")[] = ["places"];

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, lat: number, lng: number) => void;
    error?: string;
}

export function AddressAutocomplete({ value, onChange, error }: AddressAutocompleteProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const address = place.formatted_address || '';
                setInputValue(address);
                onChange(address, lat, lng);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    if (!isLoaded) {
        return (
            <Input
                type="text"
                placeholder="Loading..."
                disabled
                className="h-[50px] bg-white border-[#EDF1F7] rounded-lg text-[15px]"
            />
        );
    }

    return (
        <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
                componentRestrictions: { country: 'ae' }, // Restrict to UAE
                fields: ['formatted_address', 'geometry', 'name'],
            }}
        >
            <Input
                id="address"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Start typing address..."
                className={cn(
                    "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                    error && "border-red-500"
                )}
            />
        </Autocomplete>
    );
}
