'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Layers, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const libraries: ("places")[] = ["places"];

interface PropertyMapProps {
    address?: string;
    latitude?: number;
    longitude?: number;
    onAddressChange: (address: string, lat: number, lng: number) => void;
    onMarkerDrag: (lat: number, lng: number, address: string) => void;
    className?: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

const defaultCenter = {
    lat: 25.2048, // Dubai default
    lng: 55.2708,
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true, // Hides all default UI including footer
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy', // Allow zooming with scroll wheel
    styles: [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9ca5b3" }]
        },
        {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{ "color": "#f2f2f2" }]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [
                { "color": "#c9c9c9" },
                { "weight": 0.5 }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#eeeeee" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#e8e8e8" }]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{ "color": "#e9ecf1" }]
        },
        {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};

export function PropertyMap({ address, latitude, longitude, onAddressChange, onMarkerDrag, className }: PropertyMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>(
        latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter
    );

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [mapType, setMapType] = useState<string>('roadmap');

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Update marker position when props change
    React.useEffect(() => {
        if (latitude && longitude) {
            const newPos = { lat: latitude, lng: longitude };
            setMarkerPosition(newPos);
            if (map) {
                map.panTo(newPos);
            }
        }
    }, [latitude, longitude, map]);

    // Geocode address when it changes
    React.useEffect(() => {
        if (address && !latitude && !longitude && isLoaded) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    setMarkerPosition({ lat, lng });
                    if (map) {
                        map.panTo({ lat, lng });
                    }
                    onAddressChange(address, lat, lng);
                }
            });
        }
    }, [address, latitude, longitude, isLoaded, map, onAddressChange]);

    const handlePositionChange = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });

            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    let formattedAddress = results[0].formatted_address;

                    // Remove Plus Code (e.g., "45W6+JM ") if present at the start
                    // Pattern: 4+ alphanumeric characters, a plus sign, 2+ alphanumeric characters, and a space
                    const plusCodePattern = /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s+/;
                    formattedAddress = formattedAddress.replace(plusCodePattern, '');

                    onMarkerDrag(lat, lng, formattedAddress);
                } else {
                    onMarkerDrag(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                }
            });
        }
    }, [onMarkerDrag]);

    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
    };

    if (loadError) {
        return (
            <div className={cn("bg-gray-100 rounded-2xl flex items-center justify-center border border-[#EDF1F7]", className)}>
                <div className="text-red-500">Error loading Google Maps</div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={cn("bg-gray-100 rounded-2xl flex items-center justify-center border border-[#EDF1F7]", className)}>
                <div className="text-gray-400">Loading map...</div>
            </div>
        );
    }

    return (
        <div className={cn("relative rounded-2xl overflow-hidden border border-[#EDF1F7] shadow-sm group", className)}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPosition}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                mapTypeId={mapType}
                onClick={handlePositionChange}
            >
                <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handlePositionChange}
                />
            </GoogleMap>

            {/* Map Type Toggle Button */}
            <button
                type="button"
                onClick={toggleMapType}
                className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-100 z-10"
                title={mapType === 'roadmap' ? "Switch to Satellite" : "Switch to Map"}
            >
                {mapType === 'roadmap' ? (
                    <Layers className="h-5 w-5 text-gray-600" />
                ) : (
                    <MapIcon className="h-5 w-5 text-gray-600" />
                )}
            </button>
        </div>
    );
}
