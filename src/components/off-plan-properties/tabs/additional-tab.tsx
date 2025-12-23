'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Upload, Sparkles, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddFloorPlanModal } from '../modals/add-floor-plan-modal';
import { IconPickerModal } from '../modals/icon-picker-modal';

interface AdditionalTabProps {
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

import { useUpload } from '@/hooks/use-upload';
import { toast } from 'sonner';

interface Amenity {
    name: string;
    icon: string;
}

export function AdditionalTab({ register, setValue, watch }: AdditionalTabProps) {
    const { uploadFile, isUploading } = useUpload();
    const [amenitiesCover, setAmenitiesCover] = useState<string | null>(watch('amenitiesCover') || null);
    const [amenities, setAmenities] = useState<Amenity[]>(watch('amenities') || []);
    const [newAmenity, setNewAmenity] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Grid3x3');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [floorPlans, setFloorPlans] = useState<any[]>(watch('floorPlans') || []);
    const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);
    const [expandedFloorPlan, setExpandedFloorPlan] = useState<number | null>(null);

    // Auto Generate Reference Number
    const handleAutoGenerate = () => {
        const randomRef = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setValue('reference', randomRef);
    };

    // Brochure Upload
    const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setValue('brochure', uploadedUrl);
                toast.success('Brochure uploaded successfully');
            }
        }
    };

    // Amenities Cover Photo
    const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setAmenitiesCover(uploadedUrl);
                setValue('amenitiesCover', uploadedUrl);
                toast.success('Amenities cover uploaded successfully');
            }
        }
    };

    const handleCoverPhotoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setAmenitiesCover(uploadedUrl);
                setValue('amenitiesCover', uploadedUrl);
                toast.success('Amenities cover uploaded successfully');
            }
        }
    };

    // Icon Selection
    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
    };

    // Add Amenity
    const handleAddAmenity = () => {
        if (newAmenity && !amenities.find(a => a.name === newAmenity)) {
            const updated = [...amenities, { name: newAmenity, icon: selectedIcon }];
            setAmenities(updated);
            setValue('amenities', updated);
            setNewAmenity('');
            setSelectedIcon('Grid3x3'); // Reset to default icon
        }
    };

    const handleRemoveAmenity = (name: string) => {
        const updated = amenities.filter(a => a.name !== name);
        setAmenities(updated);
        setValue('amenities', updated);
    };

    // Add Floor Plan
    const handleAddFloorPlan = (floorPlan: any) => {
        const updated = [...floorPlans, floorPlan];
        setFloorPlans(updated);
        setValue('floorPlans', updated);
    };

    const handleRemoveFloorPlan = (index: number) => {
        const updated = floorPlans.filter((_, i) => i !== index);
        setFloorPlans(updated);
        setValue('floorPlans', updated);
    };

    // Get icon component
    const SelectedIconComponent = (Icons as any)[selectedIcon] || Icons.Grid3x3;

    return (
        <>
            <div className="space-y-8 max-w-4xl">
                {/* Reference and Brochure */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Reference */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 mb-2.5">
                            <Label htmlFor="reference" className="text-[15px] font-medium text-gray-700">
                                Reference <span className="text-red-500">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={handleAutoGenerate}
                                className="flex items-center gap-1 text-[13px] text-[#00B7FF] hover:text-[#00A0E3]"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Auto Generate
                            </button>
                        </div>
                        <Input
                            id="reference"
                            type="text"
                            placeholder="Enter property reference"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('reference')}
                        />
                    </div>

                    {/* Brochure */}
                    <div className="space-y-2.5">
                        <Label className="text-[15px] font-medium text-gray-700">Brochure</Label>
                        <label
                            htmlFor="brochure"
                            className="h-[50px] px-4 bg-[#EDF1F7] border border-[#EDF1F7] rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <Upload className="h-5 w-5 text-gray-400" />
                            <span className="text-[15px] text-[#8F9BB3]">Upload the brochure</span>
                            <input
                                id="brochure"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleBrochureUpload}
                            />
                        </label>
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                    <h3 className="text-[18px] font-semibold text-gray-900">Amenities</h3>

                    {/* Container with background */}
                    <div className="p-6 bg-[rgba(247,247,247,0.31)] border border-[#EDF1F7] rounded-lg space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Amenities Cover Photo */}
                            <div className="space-y-2.5">
                                <div
                                    className="relative h-[280px] border-2 border-dashed border-[#EDF1F7] rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
                                    onDrop={handleCoverPhotoDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={() => document.getElementById('amenitiesCover')?.click()}
                                >
                                    {amenitiesCover ? (
                                        <>
                                            <img src={amenitiesCover} alt="Amenities Cover" className="w-full h-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAmenitiesCover(null);
                                                    setValue('amenitiesCover', null);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-md"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-gray-400 mb-2" strokeWidth={1.5} />
                                            <p className="text-[15px] font-medium text-gray-700">Cover Photo</p>
                                            <p className="text-[13px] text-gray-500 mt-1">Pick a nice cover photo for a great first impression 😍</p>
                                        </>
                                    )}
                                    <input
                                        id="amenitiesCover"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleCoverPhotoUpload}
                                    />
                                </div>
                            </div>

                            {/* Section Title and Subtitle */}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label htmlFor="amenitiesTitle" className="text-[15px] font-medium text-gray-700">
                                        Section Title
                                    </Label>
                                    <Input
                                        id="amenitiesTitle"
                                        type="text"
                                        placeholder="e.g. Lifestyle & attractions"
                                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg placeholder:text-[#8F9BB3] text-[15px]"
                                        {...register('amenitiesTitle')}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="amenitiesSubtitle" className="text-[15px] font-medium text-gray-700">
                                        Section Subtitle
                                    </Label>
                                    <textarea
                                        id="amenitiesSubtitle"
                                        placeholder="e.g. Modern conveniences and leisure options nearby:"
                                        className="w-full min-h-[120px] p-4 bg-white border border-[#EDF1F7] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] resize-y"
                                        {...register('amenitiesSubtitle')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Add Amenities */}
                        <div className="space-y-3">
                            <Label className="text-[15px] font-medium text-gray-700">Add Amenities</Label>
                            <div className="flex items-center gap-2 max-w-md">
                                <div className="flex-1 relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 hover:bg-gray-100 p-1 rounded transition-colors"
                                    >
                                        <SelectedIconComponent className="h-5 w-5 text-gray-400" />
                                    </button>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Hospital"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                        className="h-[50px] pl-12 bg-white border-[#EDF1F7] rounded-lg placeholder:text-[#8F9BB3] text-[15px]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddAmenity}
                                    className="h-[50px] w-[50px] bg-gray-100 border border-[#EDF1F7] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <Plus className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Added Amenities */}
                            {amenities.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {amenities.map((amenity) => {
                                        const AmenityIcon = (Icons as any)[amenity.icon] || Icons.Grid3x3;
                                        return (
                                            <div
                                                key={amenity.name}
                                                className="px-4 py-2.5 bg-[#E3F5FF] border border-[#00B7FF] text-[#00B7FF] rounded-lg text-[14px] font-medium flex items-center gap-2"
                                            >
                                                <AmenityIcon className="h-4 w-4" />
                                                {amenity.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAmenity(amenity.name)}
                                                    className="hover:bg-[#00B7FF] hover:text-white rounded-full p-0.5 transition-colors ml-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Floor Plan */}
                <div className="space-y-4">
                    <h3 className="text-[18px] font-semibold text-gray-900">Floor Plan</h3>

                    {/* Container with background */}
                    <div className="p-6 bg-[rgba(247,247,247,0.31)] border border-[#EDF1F7] rounded-lg space-y-3">
                        {/* Floor Plan List */}
                        {floorPlans.map((plan, index) => (
                            <div
                                key={index}
                                className="bg-white border border-[#EDF1F7] rounded-lg hover:border-gray-300 transition-colors overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-4">
                                    <span className="text-[15px] text-gray-900 font-medium">{plan.propertyType}</span>
                                    <span className="text-[15px] text-gray-600">{plan.livingArea} sq.ft.</span>
                                    <span className="text-[15px] text-gray-600">{plan.price}</span>
                                    <div className="flex items-center gap-2">
                                        {plan.floorPlanImage && (
                                            <button
                                                type="button"
                                                onClick={() => setExpandedFloorPlan(expandedFloorPlan === index ? null : index)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                {expandedFloorPlan === index ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFloorPlan(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Plus className="h-4 w-4 rotate-45" />
                                        </button>
                                    </div>
                                </div>
                                {expandedFloorPlan === index && plan.floorPlanImage && (
                                    <div className="px-4 pb-4 border-t border-[#EDF1F7] pt-4 bg-gray-50/50">
                                        <div className="relative aspect-video w-full max-w-md mx-auto bg-white rounded-lg border border-[#EDF1F7] overflow-hidden">
                                            <img
                                                src={plan.floorPlanImage}
                                                alt={`${plan.propertyType} Floor Plan`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Floor Plan Button */}
                        <button
                            type="button"
                            onClick={() => setIsFloorPlanModalOpen(true)}
                            className="px-4 py-2.5 bg-[#E3F5FF] text-[#00B7FF] rounded-lg hover:bg-[#C5EBFF] transition-colors text-[15px] font-medium flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Floor Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Icon Picker Modal */}
            <IconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={handleIconSelect}
            />

            {/* Add Floor Plan Modal */}
            <AddFloorPlanModal
                isOpen={isFloorPlanModalOpen}
                onClose={() => setIsFloorPlanModalOpen(false)}
                onAdd={handleAddFloorPlan}
            />
        </>
    );
}
