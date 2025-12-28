'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Trash2, Plus, Loader2, Settings2, BookOpen, Save, AlignLeft, Type } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { API_URL } from '@/lib/api-config';

interface AiSettings {
    id: string;
    minCharacters: number;
    maxCharacters: number;
    minTitleCharacters: number;
    maxTitleCharacters: number;
    isEnabled: boolean;
    modelName: string;
}

interface TrainingExample {
    id: string;
    type: string;
    title: string | null;
    description: string;
    isActive: boolean;
    createdAt: string;
}

const backendUrl = API_URL;

// API functions
const getAiSettings = async (): Promise<AiSettings> => {
    const response = await fetch(`${backendUrl}/ai/settings`);
    if (!response.ok) throw new Error('Failed to fetch AI settings');
    return response.json();
};

const updateAiSettings = async (data: Partial<AiSettings>): Promise<AiSettings> => {
    const response = await fetch(`${backendUrl}/ai/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update AI settings');
    return response.json();
};

const getTrainingExamples = async (type: string): Promise<TrainingExample[]> => {
    const response = await fetch(`${backendUrl}/ai/training-examples?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch training examples');
    return response.json();
};

const createTrainingExample = async (data: { type: string; title?: string; description: string }): Promise<TrainingExample> => {
    const response = await fetch(`${backendUrl}/ai/training-examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create training example');
    return response.json();
};

const deleteTrainingExample = async (id: string): Promise<void> => {
    const response = await fetch(`${backendUrl}/ai/training-examples/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete training example');
};

const updateTrainingExample = async (id: string, data: { title?: string; description?: string }): Promise<TrainingExample> => {
    const response = await fetch(`${backendUrl}/ai/training-examples/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update training example');
    return response.json();
};

export function AiTrainingSection() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'description' | 'title'>('description');
    const [newExample, setNewExample] = useState({ title: '', description: '' });
    const [isAddingExample, setIsAddingExample] = useState(false);
    const [editingExample, setEditingExample] = useState<TrainingExample | null>(null);

    // Local state for character limits
    const [localMin, setLocalMin] = useState<number>(750);
    const [localMax, setLocalMax] = useState<number>(2000);
    const [localMinTitle, setLocalMinTitle] = useState<number>(30);
    const [localMaxTitle, setLocalMaxTitle] = useState<number>(100);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch settings
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['ai-settings'],
        queryFn: getAiSettings,
    });

    // Sync local state with fetched settings
    useEffect(() => {
        if (settings) {
            setLocalMin(settings.minCharacters);
            setLocalMax(settings.maxCharacters);
            setLocalMinTitle(settings.minTitleCharacters ?? 30);
            setLocalMaxTitle(settings.maxTitleCharacters ?? 100);
            setHasChanges(false);
        }
    }, [settings]);

    // Fetch training examples based on active tab
    const { data: examples, isLoading: examplesLoading } = useQuery({
        queryKey: ['ai-training-examples', activeTab],
        queryFn: () => getTrainingExamples(activeTab),
    });

    // Update settings mutation
    const updateSettingsMutation = useMutation({
        mutationFn: updateAiSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
            setHasChanges(false);
            toast.success('Settings updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update settings');
        },
    });

    // Create example mutation
    const createExampleMutation = useMutation({
        mutationFn: createTrainingExample,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-training-examples', activeTab] });
            setNewExample({ title: '', description: '' });
            setIsAddingExample(false);
            toast.success('Training example added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add training example');
        },
    });

    // Update example mutation
    const updateExampleMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { title?: string; description?: string } }) =>
            updateTrainingExample(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-training-examples', activeTab] });
            setEditingExample(null);
            toast.success('Training example updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update training example');
        },
    });

    // Delete example mutation
    const deleteExampleMutation = useMutation({
        mutationFn: deleteTrainingExample,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-training-examples', activeTab] });
            toast.success('Training example deleted');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete training example');
        },
    });

    const handleSaveSettings = () => {
        if (activeTab === 'description') {
            if (localMin < 100) return toast.error('Minimum characters must be at least 100');
            if (localMax < 500) return toast.error('Maximum characters must be at least 500');
            if (localMin >= localMax) return toast.error('Minimum must be less than maximum');
        } else {
            if (localMinTitle < 10) return toast.error('Minimum characters must be at least 10');
            if (localMaxTitle > 200) return toast.error('Maximum characters cannot exceed 200');
            if (localMinTitle >= localMaxTitle) return toast.error('Minimum must be less than maximum');
        }

        updateSettingsMutation.mutate({
            minCharacters: localMin,
            maxCharacters: localMax,
            minTitleCharacters: localMinTitle,
            maxTitleCharacters: localMaxTitle,
        });
    };

    const handleAddExample = () => {
        if (!newExample.description.trim()) {
            toast.error('Please enter content');
            return;
        }
        createExampleMutation.mutate({
            type: activeTab,
            title: newExample.title || undefined,
            description: newExample.description,
        });
    };

    const handleUpdateExample = () => {
        if (!editingExample || !editingExample.description.trim()) {
            toast.error('Please enter content');
            return;
        }
        updateExampleMutation.mutate({
            id: editingExample.id,
            data: {
                title: editingExample.title || undefined,
                description: editingExample.description,
            },
        });
    };

    const handleDeleteExample = (id: string) => {
        if (confirm('Are you sure you want to delete this training example?')) {
            deleteExampleMutation.mutate(id);
        }
    };

    // Render Tab Selector
    const renderTabs = () => (
        <div className="flex gap-2 mb-8 bg-gray-100/50 p-1 rounded-lg w-fit">
            <button
                onClick={() => { setActiveTab('description'); setIsAddingExample(false); setEditingExample(null); }}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === 'description'
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
            >
                <AlignLeft className="w-4 h-4" />
                Description Generator
            </button>
            <button
                onClick={() => { setActiveTab('title'); setIsAddingExample(false); setEditingExample(null); }}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    activeTab === 'title'
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
            >
                <Type className="w-4 h-4" />
                Title Generator
            </button>
        </div>
    );

    if (settingsLoading) {
        return (
            <Card className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] shadow-none mb-8 animate-pulse">
                {/* Loading Skeleton */}
                <div className="flex gap-4">
                    <div className="p-3 bg-gray-100 rounded-xl w-12 h-12"></div>
                    <div className="flex-1">
                        <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-full max-w-md bg-gray-100 rounded"></div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] shadow-none mb-8">
            <div className="flex gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl h-fit">
                    <Sparkles className="h-6 w-6 text-[#00AAFF]" />
                </div>
                <div>
                    <h3 className="font-bold text-[18px] text-[#111827] mb-1">AI Content Settings</h3>
                    <p className="text-[14px] text-[#6B7280]">
                        Configure AI settings and train the model with your own writing examples.
                    </p>
                </div>
            </div>

            {renderTabs()}

            {/* Settings Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-gray-500" />
                        <h4 className="font-semibold text-[15px] text-[#111827]">
                            {activeTab === 'description' ? 'Description Length' : 'Title Length'} Settings
                        </h4>
                    </div>
                    {hasChanges && (
                        <Button
                            size="sm"
                            onClick={handleSaveSettings}
                            disabled={updateSettingsMutation.isPending}
                            className="gap-1 bg-[#00B7FF] hover:bg-[#0099DD]"
                        >
                            {updateSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save</>}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Min Characters</Label>
                        <Input
                            type="number"
                            value={activeTab === 'description' ? localMin : localMinTitle}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                activeTab === 'description' ? setLocalMin(val) : setLocalMinTitle(val);
                                setHasChanges(true);
                            }}
                            className="h-11"
                        />
                    </div>
                    <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Max Characters</Label>
                        <Input
                            type="number"
                            value={activeTab === 'description' ? localMax : localMaxTitle}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                activeTab === 'description' ? setLocalMax(val) : setLocalMaxTitle(val);
                                setHasChanges(true);
                            }}
                            className="h-11"
                        />
                    </div>
                </div>
            </div>

            {/* Examples Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <h4 className="font-semibold text-[15px] text-[#111827]">
                            {activeTab === 'description' ? 'Description Examples' : 'Title Examples'}
                        </h4>
                        <span className="text-xs text-gray-400 ml-2">({examples?.length || 0}/10 max)</span>
                    </div>
                    {!isAddingExample && (examples?.length || 0) < 10 && (
                        <Button variant="outline" size="sm" onClick={() => setIsAddingExample(true)} className="gap-1">
                            <Plus className="h-4 w-4" /> Add Example
                        </Button>
                    )}
                </div>

                {isAddingExample && (
                    <div className="p-4 border border-dashed border-gray-200 rounded-xl mb-4 bg-white">
                        <Label className="text-sm text-gray-600 mb-2 block">
                            {activeTab === 'description' ? 'Example Description' : 'Example Title'} *
                        </Label>
                        <textarea
                            placeholder={activeTab === 'description'
                                ? "Paste an example property description..."
                                : "Paste an example property title..."}
                            value={newExample.description}
                            onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
                            className={cn(
                                "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
                                activeTab === 'title' ? "h-20" : "h-32"
                            )}
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingExample(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleAddExample} className="bg-[#00B7FF]">Save Example</Button>
                        </div>
                    </div>
                )}

                {/* Editing Form */}
                {editingExample && (
                    <div className="p-4 border border-blue-200 rounded-xl mb-4 bg-blue-50/50">
                        <Label className="text-sm text-gray-600 mb-2 block">
                            Edit {activeTab === 'description' ? 'Description' : 'Title'}
                        </Label>
                        <textarea
                            value={editingExample.description}
                            onChange={(e) => setEditingExample({ ...editingExample, description: e.target.value })}
                            className={cn(
                                "w-full px-3 py-2 border border-blue-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
                                activeTab === 'title' ? "h-20" : "h-32"
                            )}
                        />
                        <div className="flex justify-end gap-2 mt-3">
                            <Button variant="ghost" size="sm" onClick={() => setEditingExample(null)}>Cancel</Button>
                            <Button size="sm" onClick={handleUpdateExample} className="bg-[#00B7FF]">Save Changes</Button>
                        </div>
                    </div>
                )}


                <div className="space-y-3">
                    {examples?.length === 0 && !isAddingExample && (
                        <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">No {activeTab} examples yet</p>
                        </div>
                    )}
                    {examples?.map((example) => (
                        <div key={example.id} className="p-4 border rounded-xl border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{example.description}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingExample(example)} className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExample(example.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
