'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Volume2, Music, Check, Loader2, Play, Upload, VolumeX, Trash2 } from 'lucide-react';
import { updateNotificationSettings, getMySettings, getNotificationSounds, deleteNotificationSound } from '@/services/settings.service';
import { sendTestNotification } from '@/services/integration.service';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const DEFAULT_SOUNDS = [
    { name: 'Classic Bell', url: '/sounds/bell.mp3' },
    { name: 'Crystal Clear', url: '/sounds/crystal.mp3' },
    { name: 'Elegant Chime', url: '/sounds/chime.mp3' },
    { name: 'Soft Pulse', url: '/sounds/pulse.mp3' },
];

export function NotificationSoundCard() {
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedSoundUrl, setSelectedSoundUrl] = useState(DEFAULT_SOUNDS[0].url);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [customFile, setCustomFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['my-settings'],
        queryFn: getMySettings
    });

    const { data: customSounds, isLoading: isSoundsLoading } = useQuery({
        queryKey: ['notification-sounds'],
        queryFn: getNotificationSounds
    });

    useEffect(() => {
        if (user) {
            if (user.notificationSoundUrl) {
                setSelectedSoundUrl(user.notificationSoundUrl);
                setIsSoundEnabled(true);
            } else {
                if (user.notificationSoundUrl === '' || user.notificationSoundUrl === null) {
                    setIsSoundEnabled(false);
                } else {
                    setIsSoundEnabled(true);
                }
            }
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: updateNotificationSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-settings'] });
            queryClient.invalidateQueries({ queryKey: ['notification-sounds'] }); // Refresh list to show new upload
            toast.success('Notification settings updated');
            setCustomFile(null);
        },
        onError: () => {
            toast.error('Failed to update notification settings');
        }
    });

    const deleteSoundMutation = useMutation({
        mutationFn: deleteNotificationSound,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-sounds'] });
            toast.success('Sound removed');
            // If deleted sound was selected, revert to default
            if (customSounds?.find(s => s.url === selectedSoundUrl)) {
                setSelectedSoundUrl(DEFAULT_SOUNDS[0].url);
                // Automatically update settings? Probably safer to let user save manually or just warn.
                // For smooth UX, let's keep it simple.
            }
        },
        onError: () => {
            toast.error('Failed to delete sound');
        }
    });

    const handlePlayPreview = (url: string | File) => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setIsPlaying(false);
            return;
        }

        let src = '';
        if (typeof url === 'string') {
            src = url;
        } else {
            src = URL.createObjectURL(url);
        }

        const audio = new Audio(src);
        audioRef.current = audio;
        audio.play().catch(err => console.warn('Play error:', err));
        setIsPlaying(true);

        audio.onended = () => {
            setIsPlaying(false);
            if (typeof url !== 'string') {
                URL.revokeObjectURL(src);
            }
        };
    };

    const handleSelect = (url: string) => {
        if (!isSoundEnabled) return;
        setSelectedSoundUrl(url);
        setCustomFile(null);
        handlePlayPreview(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('audio/')) {
                toast.error('Please upload an audio file');
                return;
            }
            setCustomFile(file);
            setSelectedSoundUrl(''); // Clear selected default
            handlePlayPreview(file);
        }
    };

    const handleDeleteCustomSound = (e: React.MouseEvent, id: string, url: string) => {
        e.stopPropagation();
        if (url === selectedSoundUrl && isSoundEnabled) {
            toast.error('Cannot delete the currently selected sound');
            return;
        }
        if (confirm('Are you sure you want to delete this sound?')) {
            deleteSoundMutation.mutate(id);
        }
    };

    const handleSave = () => {
        const formData = new FormData();

        if (!isSoundEnabled) {
            formData.append('notificationSoundUrl', '');
            formData.append('useCustomNotificationSound', 'false');
        } else {
            if (customFile) {
                formData.append('notificationSound', customFile);
                formData.append('useCustomNotificationSound', 'true');
            } else {
                formData.append('notificationSoundUrl', selectedSoundUrl);
                formData.append('useCustomNotificationSound', 'false');
            }
        }

        mutation.mutate(formData);
    };

    const handleSendTestNotification = async () => {
        try {
            await sendTestNotification();
            toast.success('Test notification sent');
        } catch (e) {
            toast.error('Failed to send test notification');
        }
    };

    if (isUserLoading || isSoundsLoading) return <div className="animate-pulse h-[300px] bg-gray-100 rounded-[24px]" />;

    return (
        <Card className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] shadow-none mb-8">
            <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                        {isSoundEnabled ? <Volume2 className="h-6 w-6 text-indigo-500" /> : <VolumeX className="h-6 w-6 text-gray-400" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-[18px] text-[#111827] mb-1">Notification Sound</h3>
                        <p className="text-[14px] text-[#6B7280]">
                            Configure audio alerts for new notifications.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Label htmlFor="sound-toggle" className="font-medium text-gray-700">
                        {isSoundEnabled ? 'On' : 'Off'}
                    </Label>
                    <Switch
                        id="sound-toggle"
                        checked={isSoundEnabled}
                        onCheckedChange={setIsSoundEnabled}
                    />
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity ${!isSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="space-y-6">
                    <div>
                        <Label className="text-sm font-semibold text-gray-900 block mb-3">Available Sounds</Label>
                        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {/* Default Sounds */}
                            {DEFAULT_SOUNDS.map((sound) => {
                                const isSelected = !customFile && selectedSoundUrl === sound.url;
                                return (
                                    <button
                                        key={sound.name}
                                        onClick={() => handleSelect(sound.url)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border text-sm font-medium transition-all w-full
                                            ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                            <Music className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold">{sound.name}</p>
                                            <p className="text-xs text-gray-400">Default</p>
                                        </div>
                                        {isSelected && <Check className="h-5 w-5" />}
                                    </button>
                                );
                            })}

                            {/* Custom Sounds */}
                            {customSounds?.map((sound) => {
                                const isSelected = !customFile && selectedSoundUrl === sound.url;
                                return (
                                    <button
                                        key={sound.id}
                                        onClick={() => handleSelect(sound.url)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border text-sm font-medium transition-all w-full group
                                            ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                            <Music className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold truncate max-w-[150px]">{sound.name}</p>
                                            <p className="text-xs text-gray-400">Custom</p>
                                        </div>
                                        {isSelected ? <Check className="h-5 w-5" /> : (
                                            <div
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={(e) => handleDeleteCustomSound(e, sound.id, sound.url)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold text-gray-900 block mb-3">Upload New</Label>
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex items-center gap-4 p-4 rounded-2xl border text-sm font-medium transition-all w-full
                                ${customFile ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-dashed border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                        >
                            <div className={`p-2 rounded-xl ${customFile ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                <Upload className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-bold">
                                    {customFile ? customFile.name : 'Upload custom sound'}
                                </p>
                                <p className="text-xs text-gray-400">Supported formats: MP3, WAV</p>
                            </div>
                            {customFile && <Check className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col justify-between bg-gray-50 rounded-[32px] p-8 border border-gray-100 h-full">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Preview & Save</h4>
                        <p className="text-sm text-gray-500 mb-6">
                            Test your selected sound before saving. {customFile && 'Don\'t forget to save your new file to add it to your library.'}
                        </p>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 mb-8">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Volume2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Active Choice</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {customFile ? customFile.name :
                                        [...DEFAULT_SOUNDS, ...(customSounds || [])].find(s => s.url === selectedSoundUrl)?.name ||
                                        'None'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 px-4 shrink-0"
                                onClick={() => {
                                    if (customFile) handlePlayPreview(customFile);
                                    else if (selectedSoundUrl) handlePlayPreview(selectedSoundUrl);
                                }}
                            >
                                <Play className="h-3 w-3 mr-2 fill-current" /> Test
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button
                            className="w-full bg-[#00B7FF] hover:bg-[#0099DD] rounded-2xl h-[60px] font-bold text-lg shadow-lg shadow-blue-100"
                            onClick={handleSave}
                            disabled={mutation.isPending || (!isSoundEnabled && !user?.notificationSoundUrl)}
                        >
                            {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...</> : 'Save Settings'}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-indigo-600 hover:bg-white"
                            onClick={handleSendTestNotification}
                            disabled={!isSoundEnabled}
                        >
                            Send Test Notification
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
