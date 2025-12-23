'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

// Helper component for the editable label
const EditableLabel = ({
    value,
    onChange,
    placeholder = "Enter label name"
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) => {
    const [isEditing, setIsEditing] = useState(!value);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local state when prop changes (e.g. from initial load or external update)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        if (localValue?.trim()) {
            setIsEditing(false);
            if (localValue !== value) {
                onChange(localValue);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="text-[15px] font-medium text-gray-700 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none w-full pb-0.5 placeholder:font-normal"
                placeholder={placeholder}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="text-[15px] font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors truncate"
        >
            {value}
        </div>
    );
};

export function PriceTab({ register, control, errors, watch, setValue }: PriceTabProps) {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "paymentPlan.milestones"
    });

    // Initialize default milestone if empty
    React.useEffect(() => {
        if (fields.length === 0) {
            append({ label: "Down Payment", percentage: "", subtitle: "" });
        }
    }, [fields.length, append]);

    return (
        <div className="space-y-[10px]">
            {/* Top Section - Pricing Fields */}
            <div className="grid grid-cols-2 gap-8">
                {/* Starting Price */}
                <div className="space-y-2.5">
                    <Label htmlFor="startingPrice" className="text-[15px] font-medium text-gray-700">
                        Starting Price (AED) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="startingPrice"
                        type="number"
                        placeholder="e.g. 30,000"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.startingPrice && "border-red-500"
                        )}
                        {...register('startingPrice', { valueAsNumber: true })}
                    />
                    {errors.startingPrice && <p className="text-sm text-red-500">{errors.startingPrice.message as string}</p>}
                </div>

                {/* Service Charges */}
                <div className="space-y-2.5">
                    <Label htmlFor="serviceCharges" className="text-[15px] font-medium text-gray-700">
                        Service Charges
                    </Label>
                    <Input
                        id="serviceCharges"
                        type="number"
                        placeholder="eg. 5000"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('serviceCharges', { valueAsNumber: true })}
                    />
                </div>

                {/* Broker Fee */}
                <div className="space-y-2.5">
                    <Label htmlFor="brokerFee" className="text-[15px] font-medium text-gray-700">
                        Broker fee
                    </Label>
                    <Input
                        id="brokerFee"
                        type="text"
                        placeholder="Enter Broker fee"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('brokerFee')}
                    />
                </div>

                {/* ROI Potential */}
                <div className="space-y-2.5">
                    <Label htmlFor="roiPotential" className="text-[15px] font-medium text-gray-700">
                        ROI Potential (%)
                    </Label>
                    <div className="relative">
                        <Input
                            id="roiPotential"
                            type="number"
                            placeholder="e.g. 20"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('roiPotential', { valueAsNumber: true })}
                        />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Payment Plan Section */}
            <div className="border border-[#EDF1F7] rounded-xl p-6 bg-white shadow-sm mt-4">
                <h3 className="text-[18px] font-semibold text-gray-900 mb-6">Payment Plan</h3>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column: Section Info */}
                    <div className="col-span-4 space-y-6">
                        {/* Section Title */}
                        <div className="space-y-2.5">
                            <Label htmlFor="paymentPlan.title" className="text-[15px] font-medium text-gray-700">
                                Section Title
                            </Label>
                            <Input
                                id="paymentPlan.title"
                                placeholder="e.g. Lifestyle & attractions"
                                className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                {...register('paymentPlan.title')}
                            />
                        </div>

                        {/* Section Subtitle */}
                        <div className="space-y-2.5">
                            <Label htmlFor="paymentPlan.subtitle" className="text-[15px] font-medium text-gray-700">
                                Section Subtitle
                            </Label>
                            <textarea
                                id="paymentPlan.subtitle"
                                placeholder="e.g. Modern conveniences and leisure options nearby:"
                                className="w-full min-h-[120px] p-3 bg-white border border-[#EDF1F7] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] resize-none"
                                {...register('paymentPlan.subtitle')}
                            />
                        </div>
                    </div>

                    {/* Right Column: Milestones */}
                    <div className="col-span-8">
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-2 gap-8 relative group">
                                    {/* Remove Button (only for added rows) */}
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="absolute -right-3 -top-3 p-1 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}

                                    {/* Left Column: Label & Percentage */}
                                    <div className="space-y-2.5">
                                        {/* Dynamic Label Input */}
                                        <div className="flex justify-between items-center h-[24px]">
                                            <div className="flex items-center gap-1 w-full">
                                                <div className="flex-1">
                                                    <EditableLabel
                                                        value={(field as any).label}
                                                        onChange={(val) => {
                                                            update(index, { ...field, label: val } as any);
                                                            setValue(`paymentPlan.milestones.${index}.label`, val);
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[15px] font-medium text-gray-700 whitespace-nowrap">(%)</span>
                                            </div>
                                        </div>
                                        <Input
                                            placeholder="e.g. 20"
                                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                            {...register(`paymentPlan.milestones.${index}.percentage`)}
                                        />
                                    </div>

                                    {/* Right Column: Subtitle */}
                                    <div className="space-y-2.5">
                                        <Label className="text-[15px] font-medium text-gray-700">
                                            Subtitle
                                        </Label>
                                        <Input
                                            placeholder="Enter your subtitle"
                                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                            {...register(`paymentPlan.milestones.${index}.subtitle`)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Add More Button */}
                            <button
                                type="button"
                                onClick={() => append({ label: "", percentage: "", subtitle: "" })}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#E0F7FF] text-[#00AAFF] rounded-lg hover:bg-[#BAE6FD] transition-colors text-[15px] font-medium mt-4"
                            >
                                <Plus className="h-4 w-4" />
                                Add more
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
