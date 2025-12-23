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
import { MultiSelectAgentDropdown } from '@/components/off-plan-properties/multi-select-agent-dropdown'; // Reusing this component

export interface PropertyFilterValues {
    agentIds: string[];
    category: string;
    purpose: string;
    location: string;
    reference: string;
    propertyTypes: string[];
    permitNumber: string;
    status: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
}

interface PropertyFiltersProps {
    onFiltersChange: (filters: PropertyFilterValues) => void;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    propertyTypes?: string[];
}

export function PropertyFilters({
    onFiltersChange,
    minPrice = 0,
    maxPrice = 100000000,
    minArea = 0,
    maxArea = 50000,
    propertyTypes = [] // Available types from backend
}: PropertyFiltersProps) {
    const [agentIds, setAgentIds] = useState<string[]>([]);
    const [category, setCategory] = useState<string>(''); // Default empty
    const [purpose, setPurpose] = useState<string>(''); // Default empty
    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
    const [propertyStatus, setPropertyStatus] = useState(''); // Default empty
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
    const [areaRange, setAreaRange] = useState([minArea, maxArea]);
    const [reference, setReference] = useState('');
    const [location, setLocation] = useState('');
    const [permitNumber, setPermitNumber] = useState('');

    // Update ranges when props change (e.g. after loading aggregates)
    useEffect(() => {
        setPriceRange([minPrice, maxPrice]);
    }, [minPrice, maxPrice]);

    useEffect(() => {
        setAreaRange([minArea, maxArea]);
    }, [minArea, maxArea]);

    const getIconForType = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('apartment') || lowerType.includes('flat')) return Building2;
        if (lowerType.includes('villa') || lowerType.includes('house')) return Home;
        if (lowerType.includes('office') || lowerType.includes('commercial')) return Building;
        return Building; // Default
    };

    const togglePropertyType = (type: string) => {
        setSelectedPropertyTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Notify parent when filters change
    useEffect(() => {
        onFiltersChange({
            agentIds,
            category,
            purpose,
            location,
            reference,
            propertyTypes: selectedPropertyTypes,
            permitNumber,
            status: propertyStatus,
            minPrice: priceRange[0] === minPrice ? undefined : priceRange[0],
            maxPrice: priceRange[1] === maxPrice ? undefined : priceRange[1],
            minArea: areaRange[0] === minArea ? undefined : areaRange[0],
            maxArea: areaRange[1] === maxArea ? undefined : areaRange[1],
        });
    }, [agentIds, category, purpose, location, reference, selectedPropertyTypes, permitNumber, propertyStatus, priceRange, areaRange, onFiltersChange, minPrice, maxPrice, minArea, maxArea]);

    return (
        <div className="w-[300px] flex-shrink-0 space-y-7">
            {/* Header */}
            <h2 className="text-[28px] font-bold text-[#1A1A1A]">Filter</h2>

            {/* Agents */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Agents</Label>
                <MultiSelectAgentDropdown selectedAgentIds={agentIds} onChange={setAgentIds} placeholder="Select agent" />
            </div>

            {/* Category */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-[50px] bg-white border-[#EDF1F7] rounded-xl text-[15px]">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Purpose (Rent/Buy) */}
            <div className="flex gap-4">
                <button
                    onClick={() => setPurpose(prev => prev === 'rent' ? '' : 'rent')}
                    className={`flex-1 h-[46px] rounded-xl text-[14px] font-medium transition-colors ${purpose === 'rent'
                        ? 'bg-[#00B7FF] text-white'
                        : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                        }`}
                >
                    For Rent
                </button>
                <button
                    onClick={() => setPurpose(prev => prev === 'sell' ? '' : 'sell')}
                    className={`flex-1 h-[46px] rounded-xl text-[14px] font-medium transition-colors ${purpose === 'sell'
                        ? 'bg-[#00B7FF] text-white'
                        : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                        }`}
                >
                    For Buy
                </button>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <Label className="text-[16px] font-medium text-[#1A1A1A]">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-[50px] bg-white border-[#EDF1F7] rounded-xl text-[15px]">
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* TODO: Add dynamic locations or search */}
                        <SelectItem value="Downtown Dubai">Downtown Dubai</SelectItem>
                        <SelectItem value="Dubai Marina">Dubai Marina</SelectItem>
                        <SelectItem value="Business Bay">Business Bay</SelectItem>
                        <SelectItem value="Palm Jumeirah">Palm Jumeirah</SelectItem>
                    </SelectContent>
                </Select>
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
                <div className="flex flex-wrap gap-3">
                    {propertyTypes && propertyTypes.length > 0 ? (
                        propertyTypes.map((type) => {
                            const Icon = getIconForType(type);
                            const isSelected = selectedPropertyTypes.includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => togglePropertyType(type)}
                                    className={`h-[46px] px-4 rounded-xl flex items-center gap-2 text-[14px] font-medium transition-colors ${isSelected
                                        ? 'bg-[#00B7FF] text-white'
                                        : 'bg-white border border-[#EDF1F7] text-[#8F9BB3]'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {type}
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-sm text-gray-400 italic w-full text-center">No property types found</div>
                    )}
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
                    {['published', 'unpublished', 'draft'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setPropertyStatus(prev => prev === status ? '' : status)}
                            className={`h-[42px] px-5 rounded-xl text-[14px] font-medium capitalize transition-colors ${propertyStatus === status
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
        </div >
    );
}
