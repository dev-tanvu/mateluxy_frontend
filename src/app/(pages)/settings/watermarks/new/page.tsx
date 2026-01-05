'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Search, ChevronDown, Image as ImageIcon, Type } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
    Watermark,
    getWatermarks,
    uploadWatermark,
    updateWatermark,
    createTextWatermark,
    activateWatermark,
    deactivateAllWatermarks,
} from '@/services/watermark.service';

const BLEND_MODES = [
    'Normal',
    'Multiply',
    'Screen',
    'Overlay',
    'Darken',
    'Lighten',
    'Color Dodge',
    'Color Burn',
];

const POSITION_OPTIONS = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top', label: 'Top' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'bottom-right', label: 'Bottom Right' },
];

const TEXT_COLORS = [
    { value: '#FFFFFF', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#C9A962', label: 'Gold' },
    { value: '#2563EB', label: 'Blue' },
    { value: '#DC2626', label: 'Red' },
    { value: '#16A34A', label: 'Green' },
    { value: '#9333EA', label: 'Purple' },
    { value: '#EA580C', label: 'Orange' },
];

// Helper function to get position styles
const getPositionStyles = (position: string): React.CSSProperties => {
    switch (position) {
        case 'top-left':
            return { position: 'absolute', top: 24, left: 24 };
        case 'top':
            return { position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)' };
        case 'top-right':
            return { position: 'absolute', top: 24, right: 24 };
        case 'center-left':
            return { position: 'absolute', top: '50%', left: 24, transform: 'translateY(-50%)' };
        case 'center':
            return { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
        case 'center-right':
            return { position: 'absolute', top: '50%', right: 24, transform: 'translateY(-50%)' };
        case 'bottom-left':
            return { position: 'absolute', bottom: 24, left: 24 };
        case 'bottom':
            return { position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)' };
        case 'bottom-right':
            return { position: 'absolute', bottom: 24, right: 24 };
        default:
            return { position: 'absolute', bottom: 24, right: 24 };
    }
};

// Local storage key for text watermark settings
const TEXT_WATERMARK_STORAGE_KEY = 'mateluxy_text_watermark';

interface TextWatermarkSettings {
    text: string;
    color: string;
    opacity: number;
    scale: number;
    rotation: number;
    position: string;
    blendMode: string;
    isActive: boolean;
}

export default function WatermarksSettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Tab state
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Text watermark state
    const [watermarkText, setWatermarkText] = useState('');
    const [textColor, setTextColor] = useState('#FFFFFF');
    const [textWatermarkActive, setTextWatermarkActive] = useState(false);

    // Watermark settings
    const [opacity, setOpacity] = useState(34);
    const [scale, setScale] = useState(73);
    const [rotation, setRotation] = useState(80);
    const [blendMode, setBlendMode] = useState('Normal');
    const [position, setPosition] = useState('bottom-right');
    const [isBlendDropdownOpen, setIsBlendDropdownOpen] = useState(false);
    const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

    // Preview image
    const previewImage = '/WatermarkImage.png';

    const { data: watermarks = [] } = useQuery({
        queryKey: ['watermarks'],
        queryFn: getWatermarks,
    });

    // Get active watermark
    const activeWatermark = watermarks.find(w => w.isActive);

    // Load text watermark settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(TEXT_WATERMARK_STORAGE_KEY);
        if (saved) {
            try {
                const settings: TextWatermarkSettings = JSON.parse(saved);
                setWatermarkText(settings.text || '');
                setTextColor(settings.color || '#FFFFFF');
                setTextWatermarkActive(settings.isActive || false);
                if (settings.isActive) {
                    setOpacity(settings.opacity);
                    setScale(settings.scale);
                    setRotation(settings.rotation);
                    setPosition(settings.position);
                    setBlendMode(settings.blendMode);
                }
            } catch (e) {
                console.error('Failed to load text watermark settings:', e);
            }
        }
    }, []);

    // Load active image watermark settings
    useEffect(() => {
        if (activeWatermark && activeTab === 'image') {
            setOpacity(Math.round(activeWatermark.opacity * 100));
            setScale(Math.round(activeWatermark.scale * 100));
            setPosition(activeWatermark.position);
        }
    }, [activeWatermark, activeTab]);

    const uploadMutation = useMutation({
        mutationFn: ({ name, file }: { name: string; file: File }) => uploadWatermark(name, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Watermark uploaded successfully');
            setSelectedFile(null);
            setPreviewUrl(null);
        },
        onError: () => {
            toast.error('Failed to upload watermark');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateWatermark(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Watermark settings updated');
        },
        onError: () => {
            toast.error('Failed to update watermark');
        },
    });

    const activateMutation = useMutation({
        mutationFn: activateWatermark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            setTextWatermarkActive(false);
            saveTextWatermark(false);
            toast.success('Watermark activated');
        },
        onError: () => {
            toast.error('Failed to activate watermark');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateAllWatermarks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
        },
    });

    const textWatermarkMutation = useMutation({
        mutationFn: createTextWatermark,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watermarks'] });
            toast.success('Text watermark created successfully');
            router.push('/settings/watermarks');
        },
        onError: () => {
            toast.error('Failed to create text watermark');
        },
    });

    // Save text watermark to localStorage
    const saveTextWatermark = (isActive: boolean) => {
        const settings: TextWatermarkSettings = {
            text: watermarkText,
            color: textColor,
            opacity,
            scale,
            rotation,
            position,
            blendMode,
            isActive,
        };
        localStorage.setItem(TEXT_WATERMARK_STORAGE_KEY, JSON.stringify(settings));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleApplyChanges = () => {
        if (activeTab === 'image') {
            if (selectedFile) {
                uploadMutation.mutate({
                    name: selectedFile.name.replace(/\.[^/.]+$/, ''),
                    file: selectedFile
                });
            } else if (activeWatermark && activeWatermark.type === 'image') {
                updateMutation.mutate({
                    id: activeWatermark.id,
                    data: {
                        opacity: opacity / 100,
                        scale: scale / 100,
                        position,
                        rotation,
                        blendMode,
                    }
                });
            } else {
                toast.info('Please upload a watermark image first');
            }
        } else {
            // Text watermark - save to database
            if (watermarkText.trim()) {
                textWatermarkMutation.mutate({
                    name: watermarkText.substring(0, 30),
                    text: watermarkText,
                    textColor,
                    position,
                    opacity: opacity / 100,
                    scale: scale / 100,
                    rotation,
                    blendMode,
                });
            } else {
                toast.error('Please enter watermark text');
            }
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (activeWatermark) {
            setOpacity(Math.round(activeWatermark.opacity * 100));
            setScale(Math.round(activeWatermark.scale * 100));
            setPosition(activeWatermark.position);
        }
    };

    const getColorLabel = () => {
        return TEXT_COLORS.find(c => c.value === textColor)?.label || 'Custom';
    };

    const getPositionLabel = () => {
        return POSITION_OPTIONS.find(p => p.value === position)?.label || 'Bottom Right';
    };

    return (
        <div className="min-h-screen bg-white p-8" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
            <div className="flex gap-8 max-w-[1200px] mx-auto">
                {/* Left Column - Controls */}
                <div className="flex-shrink-0" style={{ width: 420 }}>
                    {/* Tab Bar */}
                    <div
                        className="flex rounded-xl mb-0"
                        style={{
                            backgroundColor: '#F9F9F9',
                            border: '1px solid #ECEEF6',
                        }}
                    >
                        <button
                            onClick={() => setActiveTab('image')}
                            className="flex items-center gap-2 flex-1 justify-center transition-colors"
                            style={{
                                padding: '13px 15px',
                                fontSize: 18,
                                fontWeight: activeTab === 'image' ? 600 : 400,
                                color: activeTab === 'image' ? '#000000' : '#929292',
                                fontFamily: "'Source Sans Pro', sans-serif",
                            }}
                        >
                            <ImageIcon className="w-5 h-5" />
                            Image Watermark
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className="flex items-center gap-2 flex-1 justify-center transition-colors"
                            style={{
                                padding: '13px 15px',
                                fontSize: 18,
                                fontWeight: activeTab === 'text' ? 600 : 400,
                                color: activeTab === 'text' ? '#000000' : '#929292',
                                fontFamily: "'Source Sans Pro', sans-serif",
                            }}
                        >
                            <Type className="w-5 h-5" />
                            Text Watermark
                        </button>
                    </div>

                    {/* Fields Section */}
                    <div
                        className="rounded-xl p-6"
                        style={{
                            marginTop: 20,
                            backgroundColor: '#F9F9F9',
                            border: '1px solid #ECEEF6',
                        }}
                    >
                        {/* Image Upload Area */}
                        {activeTab === 'image' && (
                            <div
                                className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-all cursor-pointer ${isDragging ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                style={{ backgroundColor: '#FFFFFF' }}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="space-y-2">
                                        <div
                                            className="inline-block p-2 rounded-lg mx-auto"
                                            style={{ background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 12px 12px' }}
                                        >
                                            <img src={previewUrl} alt="Preview" className="max-h-16 object-contain" />
                                        </div>
                                        <p className="text-xs text-gray-500">{selectedFile?.name}</p>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" strokeWidth={1.5} />
                                        <p className="text-sm text-gray-600 mb-0.5">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400 font-semibold mb-3">Max. File Size: 30MB</p>
                                        <button
                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-[#1D4ED8] transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            <Search className="w-3.5 h-3.5" />
                                            Browse file
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Text Input Area */}
                        {activeTab === 'text' && (
                            <div className="mb-6">
                                <label className="text-sm font-semibold text-gray-700 block mb-2">Watermark Text</label>
                                <input
                                    type="text"
                                    value={watermarkText}
                                    onChange={(e) => setWatermarkText(e.target.value)}
                                    placeholder="Enter your watermark text..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                />
                            </div>
                        )}

                        {/* Text Color - Only for text tab */}
                        {activeTab === 'text' && (
                            <div className="mb-5">
                                <label className="text-sm font-semibold text-gray-700 block mb-2">Text Color</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors"
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full border border-gray-300"
                                            style={{ backgroundColor: textColor }}
                                        />
                                        <span className="flex-1 text-left">{getColorLabel()}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isColorDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isColorDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                                            {TEXT_COLORS.map((color) => (
                                                <button
                                                    key={color.value}
                                                    onClick={() => {
                                                        setTextColor(color.value);
                                                        setIsColorDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${textColor === color.value ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: color.value }}
                                                    />
                                                    <span className={textColor === color.value ? 'text-[#2563EB]' : 'text-gray-700'}>
                                                        {color.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sliders */}
                        <div className="space-y-5 mb-5">
                            {/* Opacity */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Opacity</label>
                                    <span className="text-sm text-gray-500">{opacity}%</span>
                                </div>
                                <Slider
                                    value={[opacity]}
                                    onValueChange={(value) => setOpacity(value[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="[&_[data-slot=slider-range]]:bg-[#2563EB] [&_[data-slot=slider-thumb]]:border-[#2563EB] [&_[data-slot=slider-track]]:bg-gray-200"
                                />
                            </div>

                            {/* Scale */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Scale</label>
                                    <span className="text-sm text-gray-500">{scale}%</span>
                                </div>
                                <Slider
                                    value={[scale]}
                                    onValueChange={(value) => setScale(value[0])}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="[&_[data-slot=slider-range]]:bg-[#2563EB] [&_[data-slot=slider-thumb]]:border-[#2563EB] [&_[data-slot=slider-track]]:bg-gray-200"
                                />
                            </div>

                            {/* Rotation */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Rotation</label>
                                    <span className="text-sm text-gray-500">{rotation}°</span>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={(value) => setRotation(value[0])}
                                    min={0}
                                    max={360}
                                    step={1}
                                    className="[&_[data-slot=slider-range]]:bg-[#2563EB] [&_[data-slot=slider-thumb]]:border-[#2563EB] [&_[data-slot=slider-track]]:bg-gray-200"
                                />
                            </div>
                        </div>

                        {/* Position Dropdown */}
                        <div className="flex items-center justify-between mb-5">
                            <label className="text-sm font-semibold text-gray-700">Position</label>
                            <div className="relative" style={{ width: 180 }}>
                                <button
                                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors"
                                >
                                    <span>{getPositionLabel()}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPositionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isPositionDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                                        {POSITION_OPTIONS.map((pos) => (
                                            <button
                                                key={pos.value}
                                                onClick={() => {
                                                    setPosition(pos.value);
                                                    setIsPositionDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${position === pos.value ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700'
                                                    }`}
                                            >
                                                {pos.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Blend Mode Dropdown */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-sm font-semibold text-gray-700">Blend Mode</label>
                            <div className="relative" style={{ width: 180 }}>
                                <button
                                    onClick={() => setIsBlendDropdownOpen(!isBlendDropdownOpen)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors"
                                >
                                    <span>{blendMode}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBlendDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isBlendDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 max-h-48 overflow-y-auto">
                                        {BLEND_MODES.map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => {
                                                    setBlendMode(mode);
                                                    setIsBlendDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${blendMode === mode ? 'text-[#2563EB] bg-blue-50' : 'text-gray-700'
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 mt-2">
                            <button
                                onClick={() => router.push('/settings/watermarks')}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors"
                                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyChanges}
                                disabled={uploadMutation.isPending || updateMutation.isPending}
                                className="px-6 py-2.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors disabled:opacity-50"
                                style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Preview Image */}
                <div className="flex-1">
                    <div
                        className="rounded-[20px] overflow-hidden relative"
                        style={{
                            width: 582,
                            height: 589,
                            backgroundColor: '#F5F3EE',
                        }}
                    >
                        {/* Preview Image */}
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-[20px]"
                        />

                        {/* Image Watermark Overlay */}
                        {activeTab === 'image' && (previewUrl || activeWatermark) && (
                            <div
                                style={{
                                    ...getPositionStyles(position),
                                    opacity: opacity / 100,
                                    transform: `${getPositionStyles(position).transform || ''} scale(${scale / 100}) rotate(${rotation}deg)`.trim(),
                                    transformOrigin: 'center center',
                                    mixBlendMode: blendMode.toLowerCase().replace(' ', '-') as any,
                                }}
                            >
                                <img
                                    src={previewUrl || activeWatermark?.imageUrl}
                                    alt="Watermark"
                                    className="max-w-[180px] max-h-[70px] object-contain"
                                />
                            </div>
                        )}

                        {/* Text Watermark Overlay */}
                        {activeTab === 'text' && (watermarkText || textWatermarkActive) && (
                            <div
                                style={{
                                    ...getPositionStyles(position),
                                    opacity: opacity / 100,
                                    transform: `${getPositionStyles(position).transform || ''} scale(${scale / 100}) rotate(${rotation}deg)`.trim(),
                                    transformOrigin: 'center center',
                                    mixBlendMode: blendMode.toLowerCase().replace(' ', '-') as any,
                                }}
                            >
                                <span
                                    className="font-bold text-xl whitespace-nowrap"
                                    style={{
                                        color: textColor,
                                        textShadow: textColor === '#FFFFFF'
                                            ? '1px 1px 3px rgba(0,0,0,0.5)'
                                            : '1px 1px 3px rgba(255,255,255,0.3)',
                                        fontFamily: "'Source Sans Pro', sans-serif",
                                    }}
                                >
                                    {watermarkText || 'Your Text Here'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
