'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Home, Building } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MultiSelectAgentDropdown } from './multi-select-agent-dropdown';

export interface PropertyFilterValues {
    areaExpertIds: string[];
    projectExpertIds: string[];
    propertyTypes: string[];
    minPrice: number;
    maxPrice: number;
    minArea: number;
    maxArea: number;
    status: string;
    reference: string;
    location: string;
    permitNumber: string;
}

interface PropertyFiltersProps {
    onFiltersChange: (filters: PropertyFilterValues) => void;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
}

export function PropertyFilters({
    onFiltersChange,
    minPrice = 0,
    maxPrice = 100000000,
    minArea = 0,
    maxArea = 50000
}: PropertyFiltersProps) {
    const [areaExpertIds, setAreaExpertIds] = useState<string[]>([]);
    const [projectExpertIds, setProjectExpertIds] = useState<string[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
    const [propertyStatus, setPropertyStatus] = useState(''); // Empty means show all
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
    const [areaRange, setAreaRange] = useState([minArea, maxArea]);
    const [reference, setReference] = useState('');
    const [location, setLocation] = useState('');
    const [permitNumber, setPermitNumber] = useState('');

    // Update ranges when props change (e.g. after loading)
    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);

    useEffect(() => {
        setAreaRange([minArea, maxArea]);
    }, [minArea, maxArea]);

    const propertyTypeOptions = [
        { value: 'Apartment', label: 'Appartment', icon: Building2 },
        { value: 'Villa', label: 'Villa', icon: Home },
        { value: 'Office', label: 'Office', icon: Building },
        { value: 'Condominium', label: 'Condominiums', icon: Building },
        { value: 'Townhouse', label: 'Townhouses', icon: Home },
    ];

    const togglePropertyType = (type: string) => {
        setPropertyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Notify parent when filters change
    useEffect(() => {
        onFiltersChange({
            areaExpertIds,
            projectExpertIds,
            propertyTypes,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            minArea: areaRange[0],
            maxArea: areaRange[1],
            status: propertyStatus,
            reference,
            location,
            permitNumber,
        });
    }, [areaExpertIds, projectExpertIds, propertyTypes, priceRange, areaRange, propertyStatus, reference, location, permitNumber, onFiltersChange]);

    return (
        <div className="w-[300px] flex-shrink-0 space-y-7">
            {/* Header */}
            <h2 className="text-[28px] font-bold text-[#1A1A1A]">Filter</h2>

            {/* Area Experts */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Area Experts</Label>
                <MultiSelectAgentDropdown selectedAgentIds={areaExpertIds} onChange={setAreaExpertIds} />
            </div>

            {/* Project Experts */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Project Experts</Label>
                <MultiSelectAgentDropdown selectedAgentIds={projectExpertIds} onChange={setProjectExpertIds} />
            </div>



            {/* Location */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Location</Label>
                <Input
                    placeholder="Select location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-[50px] bg-white border-[#EDF1F7] rounded-xl placeholder:text-[#8F9BB3] text-[15px]"
                />
            </div>

            {/* Reference no. */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Reference no.</Label>
                <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="#Mateluxy-"
                    className="h-[50px] bg-white border-[#EDF1F7] rounded-xl placeholder:text-[#8F9BB3] text-[15px]"
                />
            </div>

            {/* Property type */}
            <div className="space-y-4">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Property type</Label>
                <div className="grid grid-cols-2 gap-3">
                    {propertyTypeOptions.slice(0, 2).map((type) => {
                        const Icon = type.icon;
                        const isSelected = propertyTypes.includes(type.value);
                        return (
                            <button
                                key={type.value}
                                onClick={() => togglePropertyType(type.value)}
                                className={`h-[46px] px-4 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium transition-colors ${isSelected
                                    ? 'bg-[#00B7FF] text-white'
                                    : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-3">
                    {propertyTypeOptions.slice(2).map((type) => {
                        const Icon = type.icon;
                        const isSelected = propertyTypes.includes(type.value);
                        return (
                            <button
                                key={type.value}
                                onClick={() => togglePropertyType(type.value)}
                                className={`h-[46px] px-4 rounded-xl flex items-center gap-2 text-[14px] font-medium transition-colors ${isSelected
                                    ? 'bg-[#00B7FF] text-white'
                                    : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Permit number */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Permit number</Label>
                <Input
                    placeholder="e.g. 45H78S"
                    value={permitNumber}
                    onChange={(e) => setPermitNumber(e.target.value)}
                    className="h-[50px] bg-white border-[#EDF1F7] rounded-xl placeholder:text-[#8F9BB3] text-[15px]"
                />
            </div>

            {/* Property status */}
            <div className="space-y-4">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Property status</Label>
                <div className="flex gap-3">
                    {['Published', 'Unpublished', 'Draft'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setPropertyStatus(status.toLowerCase())}
                            className={`h-[42px] px-5 rounded-xl text-[14px] font-medium transition-colors ${propertyStatus === status.toLowerCase()
                                ? 'bg-[#00B7FF] text-white'
                                : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Price Range</Label>
                <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={minPrice}
                    max={maxPrice}
                    step={10000}
                    className="my-6"
                />
                <div className="flex items-center justify-between text-[11px] text-[#8F9BB3] font-medium uppercase tracking-wide">
                    <span>AED {priceRange[0].toLocaleString()}</span>
                    <span>AED {priceRange[1] >= 1000000 ? `${(priceRange[1] / 1000000).toFixed(1)}M` : priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            {/* Property Area */}
            <div className="space-y-4">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Property Area</Label>
                <Slider
                    value={areaRange}
                    onValueChange={setAreaRange}
                    min={minArea}
                    max={maxArea}
                    step={100}
                    className="my-6"
                />
                <div className="flex items-center justify-between text-[11px] text-[#8F9BB3] font-medium uppercase tracking-wide">
                    <span>{areaRange[0]} sq.ft</span>
                    <span>{areaRange[1]} sq.ft</span>
                </div>
            </div>
        </div>
    );
}
