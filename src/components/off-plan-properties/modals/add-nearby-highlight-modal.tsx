'use client';

import React, { useState } from 'react';
import { X, ImageIcon, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddNearbyHighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (highlight: {
        title: string;
        subtitle: string;
        highlights: Array<{ name: string; image?: string }>;
    }) => void;
}

interface HighlightItem {
    name: string;
    image?: string;
}

export function AddNearbyHighlightModal({ isOpen, onClose, onAdd }: AddNearbyHighlightModalProps) {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [highlights, setHighlights] = useState<HighlightItem[]>([]);
    const [showAddInput, setShowAddInput] = useState(false);
    const [currentHighlight, setCurrentHighlight] = useState({
        name: '',
        image: ''
    });

    if (!isOpen) return null;

    const handleAddHighlightItem = () => {
        if (currentHighlight.name) {
            setHighlights([...highlights, {
                name: currentHighlight.name,
                image: currentHighlight.image || undefined
            }]);
            setCurrentHighlight({ name: '', image: '' });
            setShowAddInput(false);
        }
    };

    const handleRemoveHighlightItem = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentHighlight({
                    ...currentHighlight,
                    image: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (title && subtitle && highlights.length > 0) {
            onAdd({ title, subtitle, highlights });
            // Reset form
            setTitle('');
            setSubtitle('');
            setHighlights([]);
            setCurrentHighlight({ name: '', image: '' });
            setShowAddInput(false);
        }
    };

    const handleCancel = () => {
        setTitle('');
        setSubtitle('');
        setHighlights([]);
        setCurrentHighlight({ name: '', image: '' });
        setShowAddInput(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-gray-900">Add Nearby Highlights</h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="highlightTitle" className="text-[15px] font-medium text-gray-700">
                            Title
                        </Label>
                        <Input
                            id="highlightTitle"
                            type="text"
                            placeholder="e.g. Lifestyle & attractions"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-2">
                        <Label htmlFor="highlightSubtitle" className="text-[15px] font-medium text-gray-700">
                            Subtitle
                        </Label>
                        <Input
                            id="highlightSubtitle"
                            type="text"
                            placeholder="e.g. Modern conveniences and leisure options nearby:"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        />
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                        <Label className="text-[15px] font-medium text-gray-700">
                            Highlights
                        </Label>

                        {/* Add Highlight Button or Input */}
                        {!showAddInput ? (
                            <button
                                type="button"
                                onClick={() => setShowAddInput(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors text-[15px] border border-dashed border-gray-300"
                            >
                                <ImageIcon className="h-5 w-5" />
                                <span>Add nearby highlights</span>
                                <Plus className="h-5 w-5 ml-auto bg-gray-200 rounded-full p-1" />
                            </button>
                        ) : (
                            <div className="border border-[#EDF1F7] rounded-lg p-4 space-y-3 bg-gray-50">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="e.g. Dubai Mall - 10 min drive"
                                        value={currentHighlight.name}
                                        onChange={(e) => setCurrentHighlight({ ...currentHighlight, name: e.target.value })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && currentHighlight.name) {
                                                handleAddHighlightItem();
                                            }
                                        }}
                                        className="h-[40px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[14px] pl-10"
                                        autoFocus
                                    />
                                    <label htmlFor="highlightImage" className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer">
                                        <ImageIcon className="h-4 w-4 text-gray-400 hover:text-[#00AAFF] transition-colors" />
                                    </label>
                                    <input
                                        id="highlightImage"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    {currentHighlight.image && (
                                        <div className="relative inline-block">
                                            <img
                                                src={currentHighlight.image}
                                                alt="Preview"
                                                className="h-12 w-12 object-cover rounded-lg border border-[#EDF1F7]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCurrentHighlight({ ...currentHighlight, image: '' })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="ml-auto flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddInput(false);
                                                setCurrentHighlight({ name: '', image: '' });
                                            }}
                                            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 transition-colors text-[14px]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddHighlightItem}
                                            disabled={!currentHighlight.name}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00AAFF] text-white rounded-lg hover:bg-[#0099DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px] font-medium"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Highlights List */}
                        {highlights.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {highlights.map((highlight, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-[#EDF1F7] hover:border-gray-300 transition-colors"
                                    >
                                        {highlight.image && (
                                            <img
                                                src={highlight.image}
                                                alt={highlight.name}
                                                className="h-10 w-10 object-cover rounded flex-shrink-0"
                                            />
                                        )}
                                        <p className="text-[14px] text-gray-900 flex-1">
                                            {highlight.name}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveHighlightItem(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg text-[15px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!title || !subtitle || highlights.length === 0}
                        className="px-6 py-2.5 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

