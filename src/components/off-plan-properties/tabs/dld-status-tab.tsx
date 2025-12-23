'use client';

import React, { useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DldStatusTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
}

export function DldStatusTab({ register, control, errors, setValue }: DldStatusTabProps) {
    const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

    const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setQrCodePreview(result);
                setValue('dldQrCode', result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-[10px]">
            <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* DLD Permit Number */}
                    <div className="space-y-2.5">
                        <Label htmlFor="dldPermitNumber" className="text-[15px] font-medium text-gray-700">
                            DLD Permit Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="dldPermitNumber"
                            type="text"
                            placeholder="Enter your DLD permit number"
                            className={cn(
                                "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                                errors.dldPermitNumber && "border-red-500"
                            )}
                            {...register('dldPermitNumber')}
                        />
                        {errors.dldPermitNumber && <p className="text-sm text-red-500">{errors.dldPermitNumber.message as string}</p>}
                    </div>

                    {/* DLD QR Code */}
                    <div className="space-y-2.5">
                        <Label className="text-[15px] font-medium text-gray-700">
                            DLD QR Code
                        </Label>
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="dldQrCode"
                                className="flex flex-col items-center justify-center w-full h-[200px] border border-[#EDF1F7] rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                            >
                                {qrCodePreview ? (
                                    <img
                                        src={qrCodePreview}
                                        alt="DLD QR Code"
                                        className="w-full h-full object-contain rounded-lg p-4"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <svg
                                            className="w-12 h-12 text-gray-300 mb-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="text-[15px] text-gray-500">Upload QR Code</span>
                                    </div>
                                )}
                                <input
                                    id="dldQrCode"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleQrCodeUpload}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Project Stage */}
                    <div className="space-y-2.5">
                        <Label htmlFor="projectStage" className="text-[15px] font-medium text-gray-700">
                            Project Stage
                        </Label>
                        <div className="relative">
                            <select
                                id="projectStage"
                                className="flex h-[50px] w-full appearance-none rounded-lg border border-[#EDF1F7] bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                                {...register('projectStage')}
                            >
                                <option value="">Under construction</option>
                                <option value="planning">Planning</option>
                                <option value="under-construction">Under Construction</option>
                                <option value="completed">Completed</option>
                                <option value="handover">Handover</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Construction Progress */}
                    <div className="space-y-2.5">
                        <Label htmlFor="constructionProgress" className="text-[15px] font-medium text-gray-700">
                            Construction Progress (%)
                        </Label>
                        <Input
                            id="constructionProgress"
                            type="number"
                            placeholder="e.g. 60"
                            min="0"
                            max="100"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('constructionProgress', { valueAsNumber: true })}
                        />
                    </div>

                    {/* Handover Date */}
                    <div className="space-y-2.5">
                        <Label htmlFor="handoverDate" className="text-[15px] font-medium text-gray-700">
                            Handover Date
                        </Label>
                        <div className="relative">
                            <Input
                                id="handoverDate"
                                type="date"
                                placeholder="dd/mm/yyyy"
                                className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                {...register('handoverDate')}
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
