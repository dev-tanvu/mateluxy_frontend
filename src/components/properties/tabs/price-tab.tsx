'use client';

import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
}

export function PriceTab({ register, control, errors, watch }: PriceTabProps) {
    return (
        <div className="space-y-6">
            {/* Row 1: Price and Rental Period */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="price" className="text-[15px] font-medium text-gray-700">
                        Price (AED) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="price"
                        type="number"
                        placeholder="e.g. 30,000"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.price && "border-red-500"
                        )}
                        {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="rentalPeriod" className="text-[15px] font-medium text-gray-700">
                        Rental Period <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <select
                            id="rentalPeriod"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                errors.rentalPeriod ? "border-red-500" : "border-[#EDF1F7]",
                                !watch('rentalPeriod') && "text-[#8F9BB3]"
                            )}
                            {...register('rentalPeriod')}
                        >
                            <option value="">Select your rental period</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half Yearly">Half Yearly</option>
                            <option value="Yearly">Yearly</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.rentalPeriod && <p className="text-sm text-red-500">{errors.rentalPeriod.message as string}</p>}
                </div>
            </div>

            {/* Row 2: Broker Fee and Number of Cheques */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="brokerFee" className="text-[15px] font-medium text-gray-700">
                        Broker fee
                    </Label>
                    <Input
                        id="brokerFee"
                        placeholder="Enter Broker fee"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('brokerFee')}
                    />
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="numberOfCheques" className="text-[15px] font-medium text-gray-700">
                        Number of cheques
                    </Label>
                    <Input
                        id="numberOfCheques"
                        placeholder="Select number of cheques"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('numberOfCheques')}
                    />
                </div>
            </div>
        </div>
    );
}
