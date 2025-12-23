'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneralDetailsTabProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

export function GeneralDetailsTab({ register, errors }: GeneralDetailsTabProps) {
    return (
        <div className="space-y-6 max-w-3xl">
            {/* Property Title */}
            <div className="space-y-2.5">
                <Label htmlFor="propertyTitle" className="text-[15px] font-medium text-gray-700">
                    Property title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="propertyTitle"
                    placeholder="Enter your property title"
                    className={cn(
                        "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                        errors.propertyTitle && "border-red-500"
                    )}
                    {...register('propertyTitle')}
                />
                {errors.propertyTitle && <p className="text-sm text-red-500">{errors.propertyTitle.message as string}</p>}
            </div>

            {/* Property Description */}
            <div className="space-y-2.5">
                <Label htmlFor="propertyDescription" className="text-[15px] font-medium text-gray-700 flex items-center gap-2">
                    Property description <span className="text-red-500">*</span>
                    <Sparkles className="w-4 h-4 text-[#00AAFF]" />
                </Label>
                <textarea
                    id="propertyDescription"
                    placeholder="Write your property description"
                    rows={8}
                    className={cn(
                        "w-full bg-white border border-[#EDF1F7] rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] p-4 resize-none",
                        errors.propertyDescription && "border-red-500"
                    )}
                    {...register('propertyDescription')}
                />
                {errors.propertyDescription && <p className="text-sm text-red-500">{errors.propertyDescription.message as string}</p>}
            </div>

            {/* AI Suggestion */}
            <div className="flex items-center gap-2 text-[#00AAFF] text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Use Mateluxy AI for faster results, smarter time-saving SEO performance.</span>
            </div>

            {/* SEO Note */}
            <p className="text-sm text-gray-500">
                Please ensure your property title and description are clear, attractive, and optimized for search engines (SEO). This will help your listing get more visibility.
            </p>
        </div>
    );
}
