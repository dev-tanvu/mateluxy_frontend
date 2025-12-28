'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api/axios';
import { Skeleton } from '@/components/ui/skeleton';
import { API_URL } from '@/lib/api-config';

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

// Optimization: Memoize the item to prevent re-renders of the whole list when one updates
const SortableMediaItem = React.memo(({ id, src, onRemove, index, isUploading }: { id: string; src: string; onRemove: () => void, index: number, isUploading?: boolean }) => {
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

    // Proxy Logic
    const [imgSrc, setImgSrc] = useState<string>(src);
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Only proxy if it's an external URL (http) and not a local blob
        if (src.startsWith('http') && !src.startsWith('blob:') && !hasError) {
            const backendUrl = API_URL;
            // Use 90% compression (q=10) and small width (w=200) for thumbnails
            setImgSrc(`${backendUrl}/upload/optimize?url=${encodeURIComponent(src)}&w=200&q=80`);
        } else {
            setImgSrc(src);
        }
    }, [src, hasError]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative w-[100px] h-[100px] group touch-none"
            {...attributes}
            {...listeners}
        >
            <div className="relative w-full h-full">
                {/* Skeleton Loader - Visible until image is loaded */}
                {!isLoaded && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-xl bg-gray-200" />
                )}

                <img
                    src={imgSrc}
                    alt={`Media ${index + 1}`}
                    loading="lazy"
                    className={cn(
                        "w-full h-full object-cover rounded-xl border border-[#EDF1F7] select-none pointer-events-none transition-opacity duration-300",
                        isLoaded ? "opacity-100" : "opacity-0",
                        isUploading && "opacity-50"
                    )}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        // Fallback to original image if proxy fails
                        if (!hasError) {
                            setHasError(true);
                            // If it was already loaded (e.g. broken image after loading), we might want to ensure we don't end up with opacity-0
                            // But usually onError happens getting the resource.
                            // We keep isLoaded=false until the fallback loads?
                            // Or we force it true to show the broken alt text?
                            // Better to let the fallback load trigger onLoad.
                            setIsLoaded(false);
                        } else {
                            // If fallback also fails, show something
                            setIsLoaded(true);
                        }
                    }}
                />

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl z-20">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                )}
            </div>

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
}, (prev, next) => {
    return prev.id === next.id && prev.src === next.src && prev.index === next.index && prev.isUploading === next.isUploading;
});
SortableMediaItem.displayName = 'SortableMediaItem';

interface MediaItem {
    id: string;
    preview: string;
    original: File | string;
    isUploading: boolean;
    isPending?: boolean;
}

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
    const createMediaItem = (fileOrUrl: File | string): MediaItem => {
        const preview = getPreview(fileOrUrl) as string;
        // If it's a string, it's likely a URL from server or previous state
        const isUrl = typeof fileOrUrl === 'string';
        return {
            id: isUrl ? fileOrUrl : (preview || Math.random().toString()),
            preview,
            original: fileOrUrl,
            isUploading: !isUrl,
            isPending: !isUrl // If it's a file, it's pending upload initially
        };
    };

    const [items, setItems] = useState<MediaItem[]>(() => {
        if (Array.isArray(defaultMedia)) {
            return defaultMedia.map((m) => {
                const item = createMediaItem(m);
                // If it's already a string, it's not uploading
                if (typeof m === 'string') {
                    item.isUploading = false;
                    item.isPending = false;
                }
                return item;
            });
        }
        return [];
    });

    // Queue Processing State
    const CONCURRENCY_LIMIT = 4;
    // We don't need a separate state for upload count, we can derive it from items
    // const [uploadingCount, setUploadingCount] = useState(0);

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

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.url;
    };

    const deleteFile = async (url: string) => {
        try {
            await api.delete('/upload/delete', {
                data: { url }
            });
        } catch (error) {
            console.error('Failed to delete file from server:', error);
            // We suppress error to UI, but log it.
        }
    };

    // Queue Effect: Monitors items and starts uploads if slots are available
    useEffect(() => {
        const processQueue = async () => {
            // Find pending items
            // IMPORTANT: We need to filter by items that are explicitly pending AND not currently uploading
            // Actually, isPending=true means it is waiting in queue. isPending=false && isUploading=true means it is active.

            const pendingItems = items.filter(i => i.isPending);

            if (pendingItems.length === 0) return;

            // Calculate how many slots available
            // Active uploads are those that are NOT pending but ARE uploading
            const currentUploading = items.filter(i => i.isUploading && !i.isPending).length;
            const slots = CONCURRENCY_LIMIT - currentUploading;

            if (slots <= 0) return;

            // Take next batch
            const toUpload = pendingItems.slice(0, slots);

            // Mark them as "not pending" (active) immediately to avoid double pick in next render (if effect runs again)
            // We do this via functional update to be safe
            setItems(prev => prev.map(item => {
                if (toUpload.find(t => t.id === item.id)) {
                    return { ...item, isPending: false };
                }
                return item;
            }));

            // Process uploads
            toUpload.forEach(async (item) => {
                try {
                    const url = await uploadFile(item.original as File);

                    // Optimization: Revoke object URL to free memory
                    if (item.preview && item.preview.startsWith('blob:')) {
                        URL.revokeObjectURL(item.preview);
                    }

                    setItems(prev => prev.map(p => {
                        if (p.id === item.id) {
                            return {
                                ...p,
                                id: url, // Update ID to URL
                                original: url,
                                preview: url, // Switch to server URL
                                isUploading: false
                            };
                        }
                        return p;
                    }));
                } catch (error) {
                    console.error("Upload failed for file", item.original, error);
                    toast.error("Failed to upload an image");

                    // Remove failed item
                    setItems((prev) => prev.filter(p => p.id !== item.id));
                }
            });
        };

        processQueue();
    }, [items, CONCURRENCY_LIMIT]);


    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);

            // 1. Create temporary items with previews
            const newItems = newFiles.map(file => {
                const preview = URL.createObjectURL(file);
                return {
                    id: preview, // Temp ID
                    preview,
                    original: file,
                    isUploading: true,
                    isPending: true // Added to queue
                };
            });

            // Add to state immediately
            setItems((prev) => [...prev, ...newItems]);
            toast.info(`Added ${newFiles.length} images to upload queue...`);

            // Reset input so same files can be selected again if needed
            if (mediaInputRef.current) mediaInputRef.current.value = '';
        }
    };

    // Sync form whenever items change
    React.useEffect(() => {
        const validItems = items.map(i => i.original);
        // Only update if we have valid items, but we should always update even if empty
        setValue('mediaImages', validItems, { shouldDirty: true });
    }, [items, setValue]);


    const removeMediaImage = async (idToRemove: string) => {
        // Find item to check if it has a URL (is uploaded)
        const itemToRemove = items.find(i => i.id === idToRemove);

        // Optimistic remove
        setItems((prev) => prev.filter(item => item.id !== idToRemove));

        if (itemToRemove && typeof itemToRemove.original === 'string') {
            // It's a URL, delete from server
            toast.promise(deleteFile(itemToRemove.original), {
                loading: 'Deleting...',
                success: 'Image deleted',
                error: 'Failed to delete image from server'
            });
        }
    };

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);
                const newOrder = arrayMove(prev, oldIndex, newIndex);
                return newOrder;
            });
        }
    }, []);

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
                <div className="flex items-center justify-between">
                    <Label className="text-[15px] font-medium text-[#00AAFF]">
                        Choose Media (Drag to Reorder) {items.some(i => i.isUploading) && <span className="text-gray-400 text-xs ml-2">(Uploading in background...)</span>}
                    </Label>
                    <div className="text-xs text-gray-400">
                        Total: {items.length}
                    </div>
                </div>

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
                                    isUploading={item.isUploading}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
