'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SimpleRichTextEditor } from '@/components/ui/simple-rich-text-editor';
import { API_URL } from '@/lib/api-config';

interface GeneralDetailsTabProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    purpose?: string;
    category?: string;
    control?: any; // Add control to props for Controller
}

export function GeneralDetailsTab({ register, errors, setValue, watch, purpose, category, control }: GeneralDetailsTabProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);


    const handleGenerateTitle = async () => {
        setIsGeneratingTitle(true);
        try {
            const backendUrl = API_URL;

            // Collect property details from form
            const propertyDetails = {
                propertyType: watch('propertyType'),
                bedrooms: watch('bedrooms'),
                bathrooms: watch('bathrooms'),
                area: watch('area'),
                plotArea: watch('plotArea'),
                address: watch('address'),
                emirate: watch('emirate'),
                furnishingType: watch('furnishingType'),
                amenities: watch('amenities'),
                price: watch('price'),
                purpose: purpose,
                category: category,
            };

            // Check if we have minimum required data
            if (!propertyDetails.propertyType && !propertyDetails.bedrooms && !propertyDetails.address) {
                toast.error('Please fill in some property details first (property type, bedrooms, or location)');
                setIsGeneratingTitle(false);
                return;
            }

            const response = await fetch(`${backendUrl}/ai/generate-title`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyDetails),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate title');
            }

            const result = await response.json();

            if (result.title) {
                setValue('propertyTitle', result.title);
                toast.success('AI title generated successfully!');
            }
        } catch (error: any) {
            console.error('Error generating title:', error);
            toast.error(error.message || 'Failed to generate title. Please try again.');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        try {
            const backendUrl = API_URL;

            // Collect property details from form
            const propertyDetails = {
                propertyType: watch('propertyType'),
                bedrooms: watch('bedrooms'),
                bathrooms: watch('bathrooms'),
                area: watch('area'),
                plotArea: watch('plotArea'),
                address: watch('address'), // Google Maps location
                emirate: watch('emirate'),
                furnishingType: watch('furnishingType'),
                amenities: watch('amenities'),
                price: watch('price'),
                purpose: purpose,
                category: category,
            };

            // Check if we have minimum required data
            if (!propertyDetails.propertyType && !propertyDetails.bedrooms && !propertyDetails.address) {
                toast.error('Please fill in some property details first (property type, bedrooms, or location)');
                setIsGenerating(false);
                return;
            }

            const response = await fetch(`${backendUrl}/ai/generate-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(propertyDetails),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate description');
            }

            const result = await response.json();

            if (result.description) {
                setValue('propertyDescription', result.description);
                toast.success('AI description generated successfully!');
            }
        } catch (error: any) {
            console.error('Error generating description:', error);
            toast.error(error.message || 'Failed to generate description. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Property Title */}
            <div className="space-y-2.5">
                <Label htmlFor="propertyTitle" className="text-[15px] font-medium text-gray-700 flex items-center gap-2">
                    Property title <span className="text-red-500">*</span>
                    <button
                        type="button"
                        onClick={handleGenerateTitle}
                        disabled={isGeneratingTitle}
                        className={cn(
                            "p-1 rounded-md transition-colors",
                            isGeneratingTitle
                                ? "cursor-not-allowed opacity-50"
                                : "hover:bg-blue-50 cursor-pointer"
                        )}
                        title="Generate AI title"
                    >
                        {isGeneratingTitle ? (
                            <Loader2 className="w-4 h-4 text-[#00AAFF] animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-[#00AAFF]" />
                        )}
                    </button>
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
                    <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className={cn(
                            "p-1 rounded-md transition-colors",
                            isGenerating
                                ? "cursor-not-allowed opacity-50"
                                : "hover:bg-blue-50 cursor-pointer"
                        )}
                        title="Generate AI description"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 text-[#00AAFF] animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-[#00AAFF]" />
                        )}
                    </button>
                </Label>
                {control ? (
                    <Controller
                        name="propertyDescription"
                        control={control}
                        render={({ field }) => (
                            <SimpleRichTextEditor
                                value={field.value}
                                onChange={(val) => {
                                    field.onChange(val);
                                    // Trigger dirty state if needed
                                }}
                                placeholder="Write your property description..."
                                className={cn(errors.propertyDescription && "border-red-500 ring-1 ring-red-500")}
                            />
                        )}
                    />
                ) : (
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
                )}
                {errors.propertyDescription && <p className="text-sm text-red-500">{errors.propertyDescription.message as string}</p>}
            </div>

            {/* AI Suggestion */}
            <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className={cn(
                    "flex items-center gap-2 text-[#00AAFF] text-sm transition-colors",
                    isGenerating ? "opacity-50 cursor-not-allowed" : "hover:text-[#0088cc] cursor-pointer"
                )}
            >
                {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Use Mateluxy AI for faster results, smarter time-saving SEO performance.'}</span>
            </button>

            {/* SEO Note */}
            <p className="text-sm text-gray-500">
                Please ensure your property title and description are clear, attractive, and optimized for search engines (SEO). This will help your listing get more visibility.
            </p>
        </div>
    );
}
