'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PropertyMap } from '../maps/property-map';

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: { lat: number; lng: number; address: string }) => void;
}

export function LocationPickerModal({ isOpen, onClose, onSelect }: LocationPickerModalProps) {
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

    const handleAddressChange = (address: string, lat: number, lng: number) => {
        setLocation({ lat, lng, address });
    };

    const handleMarkerDrag = (lat: number, lng: number, address: string) => {
        setLocation({ lat, lng, address });
    };

    const handleConfirm = () => {
        if (location) {
            onSelect(location);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Select Location</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-200 mb-4">
                    <PropertyMap
                        onAddressChange={handleAddressChange}
                        onMarkerDrag={handleMarkerDrag}
                        className="w-full h-full"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-[15px] font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!location}
                        className="px-6 py-2.5 bg-[#00B7FF] text-white rounded-lg hover:bg-[#00A0E3] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-[15px] font-medium"
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
}
