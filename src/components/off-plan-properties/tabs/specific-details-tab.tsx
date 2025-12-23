'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecificDetailsTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
}

const ProjectHighlightSelect = ({ value, onChange, error }: { value: string, onChange: (val: string) => void, error?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const categories = [
        {
            name: 'Luxury / Exclusive tone',
            options: ['Exclusive Collection', 'Now Open for Elite Buyers', 'Private Release', 'By Invitation Only', 'Limited Release – Premium Units Only']
        },
        {
            name: 'Sales/ Marketing tone',
            options: ['Selling Fast', 'Final Phase Released', 'High Demand Property', 'Limited Units Remaining', 'Last Chance to Own']
        },
        {
            name: 'Professional / Elegant tone',
            options: ['Prestige Edition', 'Signature Residences Now Available', 'Exclusive Opportunity', 'Select Availability', 'Prime Collection']
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-[50px] w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-[15px] cursor-pointer transition-colors",
                    error ? "border-red-500" : "border-[#EDF1F7] hover:border-gray-300",
                    isOpen && "ring-2 ring-blue-100 border-blue-500"
                )}
            >
                <span className={value ? "text-gray-900" : "text-[#8F9BB3]"}>
                    {value || "Select project highlight"}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-[900px] -left-0 rounded-xl border border-gray-100 bg-white shadow-xl p-6 grid grid-cols-3 gap-8">
                    {categories.map((category, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="h-[60px] flex items-center justify-center rounded-lg border border-[#EDF1F7] bg-white mb-4">
                                <h4 className="font-semibold text-gray-600 text-[15px]">
                                    {category.name}
                                </h4>
                            </div>
                            <ul className="flex flex-col">
                                {category.options.map((option) => (
                                    <li key={option} className="border-b border-[#EDF1F7] last:border-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onChange(option);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 text-[15px] text-left w-full py-4 hover:text-[#00AAFF] transition-colors group",
                                                value === option ? "text-[#00AAFF] font-medium" : "text-[#2E3A59]"
                                            )}
                                        >
                                            {option}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-red-500 mt-1.5">{error}</p>}
        </div>
    );
};

const PropertyTypeSelect = ({ value = [], onChange, error }: { value: string[], onChange: (val: string[]) => void, error?: string }) => {
    const [inputValue, setInputValue] = useState('');

    const commonTypes = ['Apartment', 'Studio', 'Villa', 'Townhouse', 'Penthouse'];

    const handleAdd = (type: string) => {
        if (type && !value.includes(type)) {
            onChange([...value, type]);
        }
        setInputValue('');
    };

    const handleRemove = (typeToRemove: string) => {
        onChange(value.filter(type => type !== typeToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(inputValue);
        }
    };

    return (
        <div className="space-y-3">
            <div className={cn(
                "flex flex-wrap gap-2 min-h-[50px] w-full rounded-lg border bg-white px-2 py-2 text-[15px] transition-colors",
                error ? "border-red-500" : "border-[#EDF1F7] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            )}>
                {value.map((type) => (
                    <span key={type} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-900 rounded-md font-medium text-[15px]">
                        <div className="rounded-full bg-gray-300 p-0.5">
                            <X className="h-3 w-3 text-gray-600 cursor-pointer hover:text-gray-900" onClick={() => handleRemove(type)} />
                        </div>
                        {type}
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? "Select or type property type" : ""}
                    className="flex-1 bg-transparent outline-none min-w-[120px] placeholder:text-[#8F9BB3] h-8"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {commonTypes.map(type => (
                    !value.includes(type) && (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleAdd(type)}
                            className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-full border border-gray-200 transition-colors"
                        >
                            + {type}
                        </button>
                    )
                ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
};

export function SpecificDetailsTab({ register, control, errors, watch }: SpecificDetailsTabProps) {
    return (
        <div className="space-y-[10px]">
            {/* Emirate and Launch Type */}
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
                    <Label htmlFor="launchType" className="text-[15px] font-medium text-gray-700">
                        Launch Type <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <select
                            id="launchType"
                            className={cn(
                                "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                                errors.launchType ? "border-red-500" : "border-[#EDF1F7]",
                                !watch('launchType') && "text-[#8F9BB3]"
                            )}
                            {...register('launchType')}
                        >
                            <option value="">Select property type</option>
                            <option value="Pre-Launch">Pre-Launch</option>
                            <option value="Launching Soon">Launching Soon</option>
                            <option value="New Launch">New Launch</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.launchType && <p className="text-sm text-red-500">{errors.launchType.message as string}</p>}
                </div>
            </div>

            {/* Project Highlight and Property Type */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label className="text-[15px] font-medium text-gray-700">
                        Project Highlight <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="projectHighlight"
                        control={control}
                        render={({ field }) => (
                            <ProjectHighlightSelect
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.projectHighlight?.message as string}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2.5">
                    <Label className="text-[15px] font-medium text-gray-700">
                        Property Type <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="propertyType"
                        control={control}
                        render={({ field }) => (
                            <PropertyTypeSelect
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.propertyType?.message as string}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Plot Area and Area */}
            <div className="grid grid-cols-2 gap-8">
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
            </div>

            {/* Bedrooms and Kitchens */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="bedrooms" className="text-[15px] font-medium text-gray-700">
                        Bedrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="bedrooms"
                        type="number"
                        placeholder="e.g. 03"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.bedrooms && "border-red-500"
                        )}
                        {...register('bedrooms', { valueAsNumber: true })}
                    />
                    {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms.message as string}</p>}
                </div>

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
            </div>

            {/* Bathrooms */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="bathrooms" className="text-[15px] font-medium text-gray-700">
                        Bathrooms <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="bathrooms"
                        type="number"
                        placeholder="e.g. 05"
                        className={cn(
                            "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                            errors.bathrooms && "border-red-500"
                        )}
                        {...register('bathrooms', { valueAsNumber: true })}
                    />
                    {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms.message as string}</p>}
                </div>
            </div>
        </div>
    );
}
