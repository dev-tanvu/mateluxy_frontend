'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAmenitiesByCategory, AmenityItem } from '@/lib/amenities-data';

interface AdditionalTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    category?: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function AdditionalTab({ register, control, errors, setValue, watch, category }: AdditionalTabProps) {
    // Watch form values for persistence
    const availableFrom = watch('availableFrom');
    const amenitiesList = watch('amenities');

    // Initialize state
    const [availabilityType, setAvailabilityType] = useState<'immediately' | 'fromDate'>(
        availableFrom ? 'fromDate' : 'immediately'
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        availableFrom ? new Date(availableFrom) : null
    );
    const [currentMonth, setCurrentMonth] = useState(
        availableFrom ? new Date(availableFrom) : new Date()
    );
    const [showMore, setShowMore] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());

    // Synchronize availability type and date from form value
    useEffect(() => {
        if (availableFrom) {
            setAvailabilityType('fromDate');
            const date = new Date(availableFrom);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date);
                setCurrentMonth(date);
            }
        } else {
            setAvailabilityType('immediately');
            setSelectedDate(null);
        }
    }, [availableFrom]);

    // Synchronize selected amenities set from form array
    useEffect(() => {
        const nextSet = new Set<string>();
        if (Array.isArray(amenitiesList)) {
            amenitiesList.forEach((slug: string) => nextSet.add(slug));
        }
        setSelectedAmenities(nextSet);
    }, [amenitiesList]);

    // Load static amenities based on category
    const amenities = getAmenitiesByCategory(category || 'Residential');

    // Group amenities by category for display
    const groupedAmenities = useMemo(() => {
        const groups: Record<string, AmenityItem[]> = {};
        amenities.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });
        return groups;
    }, [amenities]);

    // Sanitize amenities on mount or category change
    useEffect(() => {
        const validSlugs = new Set(amenities.map(a => a.slug));
        const currentAmenities = Array.isArray(amenitiesList) ? amenitiesList : [];

        const sanitized = currentAmenities.filter((slug: string) => validSlugs.has(slug));

        // Only update if there's a difference to avoid infinite loops
        if (sanitized.length !== currentAmenities.length ||
            (currentAmenities.length > 0 && !sanitized.every((val: string, index: number) => val === currentAmenities[index]))) {

            setValue('amenities', sanitized);
        }
    }, [category, amenities, setValue]);

    const handleAutoGenerate = () => {
        const randomRef = `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        setValue('reference', randomRef);
    };

    const toggleAmenity = (slug: string) => {
        const next = new Set(selectedAmenities);
        if (next.has(slug)) {
            next.delete(slug);
        } else {
            next.add(slug);
        }
        // Update form value with selected amenity slugs
        setValue('amenities', Array.from(next));
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        setValue('availableFrom', newDate.toISOString());
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="space-y-6">
            {/* Row 1: Reference and Available */}
            <div className="grid grid-cols-2 gap-8">
                {/* Reference */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="reference" className="text-[15px] font-medium text-gray-700">
                            Reference <span className="text-red-500">*</span>
                        </Label>
                        <button
                            type="button"
                            onClick={handleAutoGenerate}
                            className="flex items-center gap-1 text-[#00AAFF] text-sm font-medium hover:text-[#0090dd] transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Auto Generate
                        </button>
                    </div>
                    <Input
                        id="reference"
                        placeholder="Enter property reference"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.reference && "border-red-500"
                        )}
                        {...register('reference')}
                    />
                    {errors.reference && <p className="text-sm text-red-500">{errors.reference.message as string}</p>}
                </div>

                {/* Available */}
                <div className="space-y-2.5">
                    <Label className="text-[15px] font-medium text-gray-700">
                        Available :
                    </Label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setAvailabilityType('immediately');
                                setValue('availableFrom', null);
                            }}
                            className={cn(
                                "flex-1 h-[50px] rounded-full border text-[15px] font-medium transition-colors",
                                availabilityType === 'immediately'
                                    ? "bg-white border-[#EDF1F7] text-gray-700"
                                    : "bg-white border-[#EDF1F7] text-gray-400"
                            )}
                        >
                            Immediately
                        </button>
                        <button
                            type="button"
                            onClick={() => setAvailabilityType('fromDate')}
                            className={cn(
                                "flex-1 h-[50px] rounded-full border text-[15px] font-medium transition-colors",
                                availabilityType === 'fromDate'
                                    ? "bg-[#FFF5F5] border-[#FF6B6B] text-[#FF6B6B]"
                                    : "bg-white border-[#EDF1F7] text-gray-400"
                            )}
                        >
                            From Date
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 2: Amenities and Calendar */}
            <div className="grid grid-cols-2 gap-8">
                {/* Amenities */}
                <div className="bg-[#F7F7F74F] rounded-xl border border-[#EDF1F7] p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[16px] font-semibold text-gray-900">
                            {category?.toLowerCase() === 'commercial' ? 'Commercial Amenities' : 'Residential Amenities'}
                        </h3>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                        {Object.entries(groupedAmenities).map(([group, items]) => (
                            <div key={group} className="space-y-3">
                                <h4 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">{group}</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {items.map((amenity) => (
                                        <label
                                            key={amenity.slug}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-blue-200 hover:bg-blue-50/30",
                                                selectedAmenities.has(amenity.slug)
                                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                                    : "bg-white border-gray-200"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                                    selectedAmenities.has(amenity.slug)
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : "bg-white border-gray-300"
                                                )}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleAmenity(amenity.slug);
                                                }}
                                            >
                                                {selectedAmenities.has(amenity.slug) && (
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-[14px] font-medium select-none truncate",
                                                selectedAmenities.has(amenity.slug) ? "text-blue-700" : "text-gray-700"
                                            )}>
                                                {amenity.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar (only visible when From Date is selected) */}
                {availabilityType === 'fromDate' && (
                    <div className="bg-white rounded-xl border border-[#EDF1F7] p-4">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <span className="text-[15px] font-medium text-gray-900">
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day headers */}
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                <div key={day} className="h-8 flex items-center justify-center text-[11px] font-medium text-gray-400">
                                    {day}
                                </div>
                            ))}

                            {/* Empty days */}
                            {emptyDays.map((_, index) => (
                                <div key={`empty-${index}`} className="h-9" />
                            ))}

                            {/* Days */}
                            {days.map((day) => {
                                const isSelected = selectedDate &&
                                    selectedDate.getDate() === day &&
                                    selectedDate.getMonth() === currentMonth.getMonth() &&
                                    selectedDate.getFullYear() === currentMonth.getFullYear();

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={cn(
                                            "h-9 w-9 mx-auto flex items-center justify-center rounded-full text-[14px] transition-colors",
                                            isSelected
                                                ? "bg-[#FF6B6B] text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
