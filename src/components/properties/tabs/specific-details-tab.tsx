'use client';

import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecificDetailsTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
}

export function SpecificDetailsTab({ register, control, errors, watch }: SpecificDetailsTabProps) {
    return (
        <div className="space-y-6">
            {/* Row 1: Emirate and Property Type */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="emirate" className="text-[15px] font-medium text-gray-700">
                        Emirate <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <select
                            id="emirate"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                errors.emirate ? "border-red-500" : "border-[#EDF1F7]",
                                !watch('emirate') && "text-[#8F9BB3]"
                            )}
                            {...register('emirate')}
                        >
                            <option value="">Select emirate</option>
                            <option value="Dubai">Dubai</option>
                            <option value="Abu Dhabi">Abu Dhabi</option>
                            <option value="Sharjah">Sharjah</option>
                            <option value="Ajman">Ajman</option>
                            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                            <option value="Fujairah">Fujairah</option>
                            <option value="Umm Al Quwain">Umm Al Quwain</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.emirate && <p className="text-sm text-red-500">{errors.emirate.message as string}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="propertyType" className="text-[15px] font-medium text-gray-700">
                        Property Type
                    </Label>
                    <div className="relative">
                        <select
                            id="propertyType"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                "border-[#EDF1F7]",
                                !watch('propertyType') && "text-[#8F9BB3]"
                            )}
                            {...register('propertyType')}
                        >
                            <option value="">Select property type</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Townhouse">Townhouse</option>
                            <option value="Penthouse">Penthouse</option>
                            <option value="Studio">Studio</option>
                            <option value="Duplex">Duplex</option>
                            <option value="Land">Land</option>
                            <option value="Office">Office</option>
                            <option value="Retail">Retail</option>
                            <option value="Warehouse">Warehouse</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Row 2: Area and Plot Area */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="area" className="text-[15px] font-medium text-gray-700">
                        Area ( sq.ft ) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="area"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1236"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.area && "border-red-500"
                        )}
                        {...register('area', { valueAsNumber: true })}
                    />
                    {errors.area && <p className="text-sm text-red-500">{errors.area.message as string}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="plotArea" className="text-[15px] font-medium text-gray-700">
                        Plot Area ( sq.ft )
                    </Label>
                    <Input
                        id="plotArea"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 580"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('plotArea', { valueAsNumber: true })}
                    />
                </div>
            </div>

            {/* Row 3: Bedrooms and Bathrooms */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="bedrooms" className="text-[15px] font-medium text-gray-700">
                        Bedrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="bedrooms"
                        type="number"
                        placeholder="e.g. 05"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.bedrooms && "border-red-500"
                        )}
                        {...register('bedrooms', { valueAsNumber: true })}
                    />
                    {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms.message as string}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="bathrooms" className="text-[15px] font-medium text-gray-700">
                        Bathrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="bathrooms"
                        type="number"
                        placeholder="e.g. 03"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.bathrooms && "border-red-500"
                        )}
                        {...register('bathrooms', { valueAsNumber: true })}
                    />
                    {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms.message as string}</p>}
                </div>
            </div>

            {/* Row 4: Kitchens and Unit Number */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="kitchens" className="text-[15px] font-medium text-gray-700">
                        Kitchens
                    </Label>
                    <Input
                        id="kitchens"
                        type="number"
                        placeholder="e.g. 02"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('kitchens', { valueAsNumber: true })}
                    />
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="unitNumber" className="text-[15px] font-medium text-gray-700">
                        Unit Number
                    </Label>
                    <Input
                        id="unitNumber"
                        placeholder="e.g. 3B"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('unitNumber')}
                    />
                </div>
            </div>

            {/* Row 5: Ownership Status and Parking Spaces */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="ownershipStatus" className="text-[15px] font-medium text-gray-700">
                        Ownership status
                    </Label>
                    <div className="relative">
                        <select
                            id="ownershipStatus"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                "border-[#EDF1F7]",
                                !watch('ownershipStatus') && "text-[#8F9BB3]"
                            )}
                            {...register('ownershipStatus')}
                        >
                            <option value="">Select status</option>
                            <option value="Freehold">Freehold</option>
                            <option value="Leasehold">Leasehold</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="parkingSpaces" className="text-[15px] font-medium text-gray-700">
                        Parking Spaces
                    </Label>
                    <Input
                        id="parkingSpaces"
                        placeholder="e.g. No parking"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('parkingSpaces')}
                    />
                </div>
            </div>
        </div>
    );
}
