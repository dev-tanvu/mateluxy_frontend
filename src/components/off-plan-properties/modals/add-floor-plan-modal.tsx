'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/use-upload';
import { toast } from 'sonner';

interface AddFloorPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (floorPlan: { propertyType: string; livingArea: string; price: string; floorPlanImage?: string }) => void;
}

export function AddFloorPlanModal({ isOpen, onClose, onAdd }: AddFloorPlanModalProps) {
    const { uploadFile, isUploading } = useUpload();
    const [propertyType, setPropertyType] = useState('');
    const [livingArea, setLivingArea] = useState('');
    const [price, setPrice] = useState('');
    const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setFloorPlanImage(uploadedUrl);
                toast.success('Floor plan image uploaded successfully');
            }
        }
    };

    const handleImageDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const uploadedUrl = await uploadFile(file);
            if (uploadedUrl) {
                setFloorPlanImage(uploadedUrl);
                toast.success('Floor plan image uploaded successfully');
            }
        }
    };

    const handleSubmit = () => {
        if (propertyType && livingArea && price) {
            onAdd({
                propertyType,
                livingArea,
                price,
                floorPlanImage: floorPlanImage || undefined,
            });
            // Reset form
            setPropertyType('');
            setLivingArea('');
            setPrice('');
            setFloorPlanImage(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add Floor Plan</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Property Type */}
                        <div className="space-y-2">
                            <Label className="text-[15px] font-medium text-gray-700">Property Type</Label>
                            <Select value={propertyType} onValueChange={setPropertyType}>
                                <SelectTrigger className="h-[50px] bg-white border-[#EDF1F7] rounded-lg text-[15px]">
                                    <SelectValue placeholder="e.g. Lifestyle & attractions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Studio Apartment">Studio Apartment</SelectItem>
                                    <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                                    <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                                    <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                                    <SelectItem value="4 Bedroom">4 Bedroom</SelectItem>
                                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                                    <SelectItem value="Villa">Villa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Living Area */}
                        <div className="space-y-2">
                            <Label className="text-[15px] font-medium text-gray-700">Living Area</Label>
                            <Input
                                type="text"
                                placeholder="e.g. 445"
                                value={livingArea}
                                onChange={(e) => setLivingArea(e.target.value)}
                                className="h-[50px] bg-white border-[#EDF1F7] rounded-lg placeholder:text-[#8F9BB3] text-[15px]"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label className="text-[15px] font-medium text-gray-700">Price</Label>
                            <Select value={price} onValueChange={setPrice}>
                                <SelectTrigger className="h-[50px] bg-white border-[#EDF1F7] rounded-lg text-[15px]">
                                    <SelectValue placeholder="e.g. Ask for price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ask for Price">Ask for Price</SelectItem>
                                    <SelectItem value="On Request">On Request</SelectItem>
                                    <SelectItem value="Contact Agent">Contact Agent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Floor Plan Upload */}
                    <div className="space-y-2">
                        <div
                            className="relative h-[220px] border-2 border-dashed border-[#EDF1F7] rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center"
                            onDrop={handleImageDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => document.getElementById('floorPlanImage')?.click()}
                        >
                            {floorPlanImage ? (
                                <>
                                    <img src={floorPlanImage} alt="Floor Plan" className="w-full h-full object-contain rounded-lg p-2" />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFloorPlanImage(null);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 shadow-md"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" strokeWidth={1.5} />
                                    <p className="text-[15px] font-medium text-gray-700">Floor Plan</p>
                                    <p className="text-[13px] text-gray-500 mt-1">Upload the floor plan</p>
                                </>
                            )}
                            <input
                                id="floorPlanImage"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-[15px] font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!propertyType || !livingArea || !price}
                            className="px-6 py-2.5 bg-[#00B7FF] text-white rounded-lg hover:bg-[#00A0E3] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-[15px] font-medium"
                        >
                            Add Floor Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
