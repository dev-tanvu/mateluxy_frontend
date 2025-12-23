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
        <div className="space-y-[10px] max-w-3xl">
            {/* Project Title */}
            <div className="space-y-2.5">
                <Label htmlFor="projectTitle" className="text-[15px] font-medium text-gray-700">
                    Project title <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="projectTitle"
                    type="text"
                    placeholder="Enter your property title"
                    className={cn(
                        "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                        errors.projectTitle && "border-red-500"
                    )}
                    {...register('projectTitle')}
                />
                {errors.projectTitle && <p className="text-sm text-red-500">{errors.projectTitle.message as string}</p>}
            </div>

            {/* Short Description */}
            <div className="space-y-2.5">
                <Label htmlFor="shortDescription" className="text-[15px] font-medium text-gray-700">
                    Short Description <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="shortDescription"
                    type="text"
                    placeholder="Enter your property short description"
                    className={cn(
                        "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                        errors.shortDescription && "border-red-500"
                    )}
                    {...register('shortDescription')}
                />
                {errors.shortDescription && <p className="text-sm text-red-500">{errors.shortDescription.message as string}</p>}
            </div>

            {/* Project Description */}
            <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                    <Label htmlFor="projectDescription" className="text-[15px] font-medium text-gray-700">
                        Project description <span className="text-red-500">*</span>
                    </Label>
                    <Sparkles className="h-4 w-4 text-[#00AAFF]" />
                </div>
                <textarea
                    id="projectDescription"
                    placeholder="Write your property description"
                    className={cn(
                        "w-full min-h-[200px] p-4 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] resize-y",
                        errors.projectDescription ? "border-red-500" : "border-[#EDF1F7]"
                    )}
                    {...register('projectDescription')}
                />
                {errors.projectDescription && <p className="text-sm text-red-500">{errors.projectDescription.message as string}</p>}
            </div>

            {/* AI Helper Text */}
            <div className="flex items-start gap-2.5 p-3 bg-white rounded-lg">
                <Sparkles className="h-3.5 w-3.5 text-[#00AAFF] mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                    <p className="text-[13px] text-[#00AAFF] font-normal leading-tight">
                        Use Mateluxy AI for faster results, smarter time-saving SEO performance.
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Please ensure your property title and description are clear, attractive, and optimized for search engines (SEO). This will help your listing get more visibility.
                    </p>
                </div>
            </div>
        </div>
    );
}
