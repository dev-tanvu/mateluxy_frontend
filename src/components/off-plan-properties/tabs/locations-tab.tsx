'use client';

import React, { useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ImageIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyMap } from '../maps/property-map';
import { AddressAutocomplete } from '../maps/address-autocomplete';
import { AddNearbyHighlightModal } from '../modals/add-nearby-highlight-modal';

interface LocationsTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

export interface NearbyHighlight {
    title: string;
    subtitle: string;
    highlights: Array<{
        name: string;
        image?: string;
    }>;
}

export function LocationsTab({ register, control, errors, watch, setValue }: LocationsTabProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [focalPointImage, setFocalPointImage] = useState<string | null>(null);
    const [expandedHighlights, setExpandedHighlights] = useState<Set<number>>(new Set());

    const address = watch('address');
    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const nearbyHighlights = watch('nearbyHighlights') || [];

    const handleAddressChange = (newAddress: string, lat: number, lng: number) => {
        setValue('address', newAddress);
        setValue('latitude', lat);
        setValue('longitude', lng);
    };

    const handleMarkerDrag = (lat: number, lng: number, address: string) => {
        setValue('latitude', lat);
        setValue('longitude', lng);
        setValue('address', address);
    };

    const handleAddHighlight = (highlight: NearbyHighlight) => {
        const current = nearbyHighlights || [];
        setValue('nearbyHighlights', [...current, highlight]);
        setIsModalOpen(false);
    };

    const handleRemoveHighlight = (index: number) => {
        const current = nearbyHighlights || [];
        setValue('nearbyHighlights', current.filter((_: any, i: number) => i !== index));
        // Also remove from expanded set if it was expanded
        setExpandedHighlights(prev => {
            const next = new Set(prev);
            next.delete(index);
            return next;
        });
    };

    const toggleExpanded = (index: number) => {
        setExpandedHighlights(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleFocalPointImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFocalPointImage(reader.result as string);
                setValue('focalPointImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="grid grid-cols-[55%_45%] gap-8">
            {/* Left Column */}
            <div className="space-y-6">
                {/* Address */}
                <div className="space-y-2.5">
                    <Label htmlFor="address" className="text-[15px] font-medium text-gray-700">
                        Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <AddressAutocomplete
                            value={address || ''}
                            onChange={(addr, lat, lng) => {
                                setValue('address', addr);
                                setValue('latitude', lat);
                                setValue('longitude', lng);
                            }}
                            error={errors.address?.message as string}
                        />
                        {/* AI Suggestion Badge */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-[#00AAFF] text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-[15px]">High-demand waterfront zone with premium investor ROI</span>
                            </div>
                            <span className="text-[#00AAFF] font-semibold text-[15px]">9.2/10</span>
                        </div>
                    </div>
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message as string}</p>}
                </div>

                {/* Style */}
                <div className="space-y-2.5">
                    <Label htmlFor="style" className="text-[15px] font-medium text-gray-700">
                        Style
                    </Label>
                    <div className="relative">
                        <select
                            id="style"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                errors.style ? "border-red-500" : "border-[#EDF1F7]",
                                !watch('style') && "text-[#8F9BB3]"
                            )}
                            {...register('style')}
                        >
                            <option value="">Select style</option>
                            <option value="Luxury Living">Luxury Living</option>
                            <option value="Modern Contemporary">Modern Contemporary</option>
                            <option value="Traditional Arabic">Traditional Arabic</option>
                            <option value="Minimalist">Minimalist</option>
                            <option value="Coastal">Coastal</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Focal Point */}
                <div className="space-y-2.5">
                    <Label htmlFor="focalPoint" className="text-[15px] font-medium text-gray-700">
                        Focal Point
                    </Label>
                    <div className="relative">
                        <Input
                            id="focalPoint"
                            type="text"
                            placeholder="e.g. World-Class Yachting"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] pl-10"
                            {...register('focalPoint')}
                        />
                        <label htmlFor="focalPointImageUpload" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer">
                            <ImageIcon className="h-5 w-5 text-gray-400 hover:text-[#00AAFF] transition-colors" />
                        </label>
                        <input
                            id="focalPointImageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFocalPointImageUpload}
                        />
                    </div>

                    {/* Image Preview */}
                    {focalPointImage && (
                        <div className="mt-3 relative inline-block">
                            <img src={focalPointImage} alt="Focal point" className="h-20 w-20 object-cover rounded-lg border border-[#EDF1F7]" />
                            <button
                                type="button"
                                onClick={() => {
                                    setFocalPointImage(null);
                                    setValue('focalPointImage', '');
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Nearby Highlights */}
                <div className="space-y-3">
                    <Label className="text-[15px] font-medium text-gray-700">
                        Nearby Highlights
                    </Label>

                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#E0F7FF] text-[#00AAFF] rounded-lg hover:bg-[#BAE6FD] transition-colors text-[15px] font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Add Nearby Highlights
                    </button>

                    {/* Highlights List */}
                    {nearbyHighlights.length > 0 && (
                        <div className="space-y-2 mt-4">
                            {nearbyHighlights.map((highlight: NearbyHighlight, index: number) => {
                                const isExpanded = expandedHighlights.has(index);

                                return (
                                    <div key={index} className="bg-white rounded-lg border border-[#EDF1F7]">
                                        {/* Header */}
                                        <div className="flex items-center justify-between p-3">
                                            <div className="flex-1">
                                                <p className="text-[15px] font-medium text-gray-900">{highlight.title}</p>
                                                <p className="text-sm text-gray-500">{highlight.highlights.length} highlights</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpanded(index)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveHighlight(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div className="border-t border-[#EDF1F7] px-3 py-2 space-y-2 bg-gray-50">
                                                {highlight.highlights.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-10 w-10 object-cover rounded flex-shrink-0"
                                                            />
                                                        )}
                                                        <p className="text-[14px] text-gray-900">{item.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Map */}
            <div className="sticky top-4">
                <PropertyMap
                    address={address}
                    latitude={latitude}
                    longitude={longitude}
                    onAddressChange={handleAddressChange}
                    onMarkerDrag={handleMarkerDrag}
                    className="h-[350px]"
                />
            </div>

            {/* Add Nearby Highlight Modal */}
            <AddNearbyHighlightModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddHighlight}
            />
        </div>
    );
}
