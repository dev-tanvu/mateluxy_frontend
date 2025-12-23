'use client';

import React, { useRef, useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MediaTabProps {
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

// Sortable Item Component
const SortableMediaItem = ({ id, src, onRemove, index }: { id: string; src: string; onRemove: () => void, index: number }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative w-[100px] h-[100px] group touch-none"
            {...attributes}
            {...listeners}
        >
            <img
                src={src}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover rounded-xl border border-[#EDF1F7] select-none pointer-events-none"
            />
            {/* Remove Button - Need to stop propagation so it doesn't trigger drag */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
};

export function MediaTab({ register, setValue, watch }: MediaTabProps) {
    const defaultCover = watch('coverPhoto');
    const defaultMedia = watch('mediaImages');

    // Helper to get preview URL from File or string
    const getPreview = (fileOrUrl: File | string | null): string | null => {
        if (!fileOrUrl) return null;
        if (typeof fileOrUrl === 'string') return fileOrUrl;
        return URL.createObjectURL(fileOrUrl);
    };

    const [coverPhoto, setCoverPhoto] = useState<string | null>(() => getPreview(defaultCover));

    // We need stable IDs for DnD. We can use URL if string, or create object URL if File.
    // Ideally we map them to an object { id: string, preview: string, file: File | string }
    const createMediaItem = (fileOrUrl: File | string) => {
        const preview = getPreview(fileOrUrl) as string;
        // Use preview URL as ID roughly, or random ID if needed. Dnd kit needs unique ID.
        // If file is same object, preview URL is same.
        // For simplicity, we'll store specific wrapper objects in state.
        return {
            id: typeof fileOrUrl === 'string' ? fileOrUrl : (preview || Math.random().toString()),
            preview,
            original: fileOrUrl
        };
    };

    const [items, setItems] = useState<{ id: string; preview: string; original: File | string }[]>(() => {
        if (Array.isArray(defaultMedia)) {
            return defaultMedia.map(createMediaItem);
        }
        return [];
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const coverPhotoInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Update local preview
            const previewUrl = URL.createObjectURL(file);
            setCoverPhoto(previewUrl);
            // Update form state with actual File
            setValue('coverPhoto', file);
        }
    };

    const removeCoverPhoto = () => {
        setCoverPhoto(null);
        setValue('coverPhoto', '');
        if (coverPhotoInputRef.current) {
            coverPhotoInputRef.current.value = '';
        }
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            const newItems = newFiles.map(createMediaItem);

            setItems((prev) => {
                const updated = [...prev, ...newItems];
                // Sync to form
                setValue('mediaImages', updated.map(i => i.original));
                return updated;
            });
        }
    };

    const removeMediaImage = (idToRemove: string) => {
        setItems((prev) => {
            const updated = prev.filter(item => item.id !== idToRemove);
            setValue('mediaImages', updated.map(i => i.original));
            return updated;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newOrder = arrayMove(items, oldIndex, newIndex);

            // 1. Update Local State
            setItems(newOrder);

            // 2. Sync to Form (Side Effect safe here)
            setValue('mediaImages', newOrder.map(i => i.original), { shouldDirty: true });
        }
    };

    return (
        <div className="space-y-6">
            {/* Row 1: Cover Photo and Video URL */}
            <div className="grid grid-cols-2 gap-8">
                {/* Cover Photo */}
                <div className="space-y-2.5">
                    {!coverPhoto ? (
                        <label
                            htmlFor="coverPhotoUpload"
                            className="flex flex-col items-center justify-center w-full h-[200px] bg-white rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <ImagePlus className="w-8 h-8 text-gray-300 mb-2" />
                            <span className="text-[15px] font-medium text-gray-700">Cover Photo</span>
                            <p className="text-sm text-gray-400 mt-1">Pick a nice cover photo for a great first impression 😊</p>
                            <input
                                id="coverPhotoUpload"
                                ref={coverPhotoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverPhotoUpload}
                            />
                        </label>
                    ) : (
                        <div className="relative w-full h-[200px]">
                            <img
                                src={coverPhoto}
                                alt="Cover Photo"
                                className="w-full h-full object-cover rounded-xl border border-[#EDF1F7]"
                            />
                            <button
                                type="button"
                                onClick={removeCoverPhoto}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Video URL */}
                <div className="space-y-2.5">
                    <Label htmlFor="videoUrl" className="text-[15px] font-medium text-gray-700">
                        Video (Only YouTube )
                    </Label>
                    <Input
                        id="videoUrl"
                        placeholder="https://yourvideourl.com"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('videoUrl')}
                    />
                </div>
            </div>

            {/* Choose Media Grid */}
            <div className="space-y-3">
                <Label className="text-[15px] font-medium text-[#00AAFF]">
                    Choose Media (Drag to Reorder)
                </Label>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(i => i.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="flex flex-wrap gap-3">
                            {/* Add Image Button - Always first or last? Standard is last. */}
                            <label
                                htmlFor="mediaUpload"
                                className="flex items-center justify-center w-[100px] h-[100px] bg-[#F7F9FC] rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <ImagePlus className="w-6 h-6 text-gray-400" />
                                <input
                                    id="mediaUpload"
                                    ref={mediaInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleMediaUpload}
                                />
                            </label>

                            {/* Sortable Items */}
                            {items.map((item, index) => (
                                <SortableMediaItem
                                    key={item.id}
                                    id={item.id}
                                    src={item.preview}
                                    index={index}
                                    onRemove={() => removeMediaImage(item.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
