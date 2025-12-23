'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';

interface IconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (iconName: string) => void;
}

// Common amenity icons
const AMENITY_ICONS = [
    'GraduationCap', // School
    'Hospital',
    'Train', // Metro
    'Trees', // Park
    'Flower2', // Garden
    'Dumbbell', // Gym
    'Waves', // Pool
    'CarFront', // Parking
    'ShoppingCart', // Shopping
    'Coffee',
    'Church',
    'Building2',
    'Utensils', // Restaurant
    'Plane',
    'Bus',
    'Bike',
    'Heart',
    'Trophy',
    'Music',
    'Camera',
    'BookOpen',
    'Briefcase',
    'Home',
    'Store',
];

export function IconPickerModal({ isOpen, onClose, onSelect }: IconPickerModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = AMENITY_ICONS.filter(iconName =>
        iconName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleIconSelect = (iconName: string) => {
        onSelect(iconName);
        onClose();
        setSearchQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[600px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Select Icon</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search icons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Icons Grid */}
                <div className="grid grid-cols-8 gap-3 overflow-y-auto">
                    {filteredIcons.map((iconName) => {
                        const IconComponent = (Icons as any)[iconName];
                        if (!IconComponent) return null;

                        return (
                            <button
                                key={iconName}
                                onClick={() => handleIconSelect(iconName)}
                                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                                title={iconName}
                            >
                                <IconComponent className="h-6 w-6 text-gray-700 group-hover:text-blue-500" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
