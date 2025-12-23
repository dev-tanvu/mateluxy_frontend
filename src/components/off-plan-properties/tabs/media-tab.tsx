'use client';

import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/use-upload';
import { toast } from 'sonner';

interface MediaTabProps {
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

export function MediaTab({ register, setValue, watch }: MediaTabProps) {
    const { uploadFile, isUploading } = useUpload();
    const [coverPhoto, setCoverPhoto] = useState<string | null>(watch('coverPhoto') || null);
    const [exteriorMedia, setExteriorMedia] = useState<string[]>(watch('exteriorMedia') || []);
    const [interiorMedia, setInteriorMedia] = useState<string[]>(watch('interiorMedia') || []);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [draggedSection, setDraggedSection] = useState<'exterior' | 'interior' | null>(null);

    // Cover photo upload
    const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setCoverPhoto(uploadedUrl);
                setValue('coverPhoto', uploadedUrl);
                toast.success('Cover photo uploaded successfully');
            }
        }
    };

    const handleCoverPhotoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setCoverPhoto(uploadedUrl);
                setValue('coverPhoto', uploadedUrl);
                toast.success('Cover photo uploaded successfully');
            }
        }
    };

    // Exterior media
    const handleExteriorMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setExteriorMedia(prev => {
                    const updated = [...prev, uploadedUrl];
                    setValue('exteriorMedia', updated);
                    return updated;
                });
            }
        }

        if (files.length > 0) {
            toast.success('Exterior media uploaded successfully');
        }
    };

    // Interior media
    const handleInteriorMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setInteriorMedia(prev => {
                    const updated = [...prev, uploadedUrl];
                    setValue('interiorMedia', updated);
                    return updated;
                });
            }
        }

        if (files.length > 0) {
            toast.success('Interior media uploaded successfully');
        }
    };

    // Drag and drop for reordering
    const handleDragStart = (index: number, section: 'exterior' | 'interior') => {
        setDraggedIndex(index);
        setDraggedSection(section);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropExterior = (targetIndex: number) => {
        if (draggedIndex === null || draggedSection !== 'exterior') return;
        const items = [...exteriorMedia];
        const [removed] = items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, removed);
        setExteriorMedia(items);
        setValue('exteriorMedia', items);
        setDraggedIndex(null);
        setDraggedSection(null);
    };

    const handleDropInterior = (targetIndex: number) => {
        if (draggedIndex === null || draggedSection !== 'interior') return;
        const items = [...interiorMedia];
        const [removed] = items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, removed);
        setInteriorMedia(items);
        setValue('interiorMedia', items);
        setDraggedIndex(null);
        setDraggedSection(null);
    };

    const removeExteriorMedia = (index: number) => {
        const updated = exteriorMedia.filter((_, i) => i !== index);
        setExteriorMedia(updated);
        setValue('exteriorMedia', updated);
    };

    const removeInteriorMedia = (index: number) => {
        const updated = interiorMedia.filter((_, i) => i !== index);
        setInteriorMedia(updated);
        setValue('interiorMedia', updated);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
                {/* Left: Cover Photo */}
                <div className="space-y-2.5">
                    <div
                        className="relative h-[280px] border-2 border-dashed border-[#EDF1F7] rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
                        onDrop={handleCoverPhotoDrop}
                        onDragOver={handleDragOver}
                        onClick={() => document.getElementById('coverPhoto')?.click()}
                    >
                        {coverPhoto ? (
                            <>
                                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCoverPhoto(null);
                                        setValue('coverPhoto', null);
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
                            id="coverPhoto"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverPhotoUpload}
                        />
                    </div>
                </div>

                {/* Right: Video URLs */}
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <Label htmlFor="videoUrl" className="text-[15px] font-medium text-gray-700">
                            Video (Only YouTube )
                        </Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            placeholder="https://yourvideourl.com"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('videoUrl')}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="agentVideoUrl" className="text-[15px] font-medium text-gray-700">
                            Agent Video (Youtube Only)
                        </Label>
                        <Input
                            id="agentVideoUrl"
                            type="url"
                            placeholder="https://yourvideourl.com"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('agentVideoUrl')}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="virtualTourUrl" className="text-[15px] font-medium text-gray-700">
                            Virtual tour (Embeded Link)
                        </Label>
                        <Input
                            id="virtualTourUrl"
                            type="url"
                            placeholder="https://yourvideourl.com"
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('virtualTourUrl')}
                        />
                    </div>
                </div>
            </div>

            {/* Exterior and Interior Media */}
            <div className="grid grid-cols-2 gap-8">
                {/* Exterior Media */}
                <div className="space-y-3">
                    <h3 className="text-[16px] font-semibold text-gray-900">Exterior Media</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {/* Add Button - Always First */}
                        <div
                            className="relative aspect-square border-2 border-dashed border-[#EDF1F7] rounded-lg bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => document.getElementById('exteriorMedia')?.click()}
                        >
                            <ImageIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
                        </div>

                        {/* Only Uploaded Images */}
                        {exteriorMedia.map((image, index) => (
                            <div
                                key={`exterior-${index}`}
                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-move group"
                                draggable
                                onDragStart={() => handleDragStart(index, 'exterior')}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDropExterior(index)}
                            >
                                <img src={image} alt={`Exterior ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeExteriorMedia(index);
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="absolute top-1.5 left-1.5 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <Plus className="h-3.5 w-3.5 text-gray-600 rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <input
                        id="exteriorMedia"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleExteriorMediaUpload}
                    />
                </div>

                {/* Interior Media */}
                <div className="space-y-3">
                    <h3 className="text-[16px] font-semibold text-gray-900">Interior Media</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {/* Add Button - Always First */}
                        <div
                            className="relative aspect-square border-2 border-dashed border-[#EDF1F7] rounded-lg bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => document.getElementById('interiorMedia')?.click()}
                        >
                            <ImageIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
                        </div>

                        {/* Only Uploaded Images */}
                        {interiorMedia.map((image, index) => (
                            <div
                                key={`interior-${index}`}
                                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-move group"
                                draggable
                                onDragStart={() => handleDragStart(index, 'interior')}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDropInterior(index)}
                            >
                                <img src={image} alt={`Interior ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeInteriorMedia(index);
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="absolute top-1.5 left-1.5 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <Plus className="h-3.5 w-3.5 text-gray-600 rotate-45" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <input
                        id="interiorMedia"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleInteriorMediaUpload}
                    />
                </div>
            </div>
        </div>
    );
}
