'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Volume2, Music, Check, Loader2, Play, Square, Upload, VolumeX, Trash2 } from 'lucide-react';
import { updateNotificationSettings, getMySettings, getNotificationSounds, deleteNotificationSound } from '@/services/settings.service';
import { sendTestNotification } from '@/services/integration.service';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/lib/api-config';

export function NotificationSoundCard() {
    const queryClient = useQueryClient();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedSoundUrl, setSelectedSoundUrl] = useState('');
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
            // Logic: Muted is stored as TRUE, so Enabled is FALSE if muted.
            setIsSoundEnabled(!user.isNotificationMuted);

            // Always set the URL if it exists, regardless of mute state
            if (user.notificationSoundUrl) {
                setSelectedSoundUrl(user.notificationSoundUrl);
            }
        }
    }, [user]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const mutation = useMutation({
        mutationFn: updateNotificationSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-settings'] });
            queryClient.invalidateQueries({ queryKey: ['notification-sounds'] });
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
            if (customSounds?.find(s => s.url === selectedSoundUrl)) {
                setSelectedSoundUrl('');
            }
        },
        onError: () => {
            toast.error('Failed to delete sound');
        }
    });

    const handlePlayPreview = () => {
        // Stop if already playing
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
            setIsPlaying(false);
            return;
        }

        let src = '';
        if (customFile) {
            src = URL.createObjectURL(customFile);
        } else if (selectedSoundUrl) {
            // Use proxy for S3 URLs to bypass CORS
            if (selectedSoundUrl.includes('s3.') || selectedSoundUrl.includes('amazonaws.com')) {
                src = `${API_URL}/upload/audio?url=${encodeURIComponent(selectedSoundUrl)}`;
            } else {
                src = selectedSoundUrl;
            }
        } else {
            toast.error('Select or upload a sound first');
            return;
        }

        const audio = new Audio();
        audioRef.current = audio;

        // Set up event handlers before setting src
        audio.oncanplaythrough = () => {
            audio.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(err => {
                    console.error('Play error:', err);
                    toast.error('Failed to play sound');
                    setIsPlaying(false);
                });
        };

        audio.onerror = () => {
            console.error('Audio load error, URL:', src);
            toast.error('Failed to load sound. The file may not be accessible.');
            setIsPlaying(false);
            audioRef.current = null;
        };

        audio.onended = () => {
            setIsPlaying(false);
            if (customFile) {
                URL.revokeObjectURL(src);
            }
            audioRef.current = null;
        };

        // Set the source to trigger loading
        audio.src = src;
        audio.load();
    };

    const handleSelect = (url: string) => {
        if (!isSoundEnabled) return;
        setSelectedSoundUrl(url);
        setCustomFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('audio/')) {
                toast.error('Please upload an audio file');
                return;
            }
            setCustomFile(file);
            setSelectedSoundUrl('');
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

    const handleToggle = (checked: boolean) => {
        setIsSoundEnabled(checked);
        const formData = new FormData();
        formData.append('isNotificationMuted', String(!checked));
        // We only send the mute status for the toggle action
        mutation.mutate(formData);
    };

    const handleSave = () => {
        const formData = new FormData();

        // Mute status is inverse of Enabled switch
        formData.append('isNotificationMuted', String(!isSoundEnabled));

        if (customFile) {
            formData.append('notificationSound', customFile);
            formData.append('useCustomNotificationSound', 'true');
        } else if (selectedSoundUrl) {
            formData.append('notificationSoundUrl', selectedSoundUrl);
            formData.append('useCustomNotificationSound', 'false');
        }

        // This ensures existing sound is preserved even if off
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

    const activeSoundName = customFile
        ? customFile.name
        : customSounds?.find(s => s.url === selectedSoundUrl)?.name || 'None selected';

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
                        onCheckedChange={handleToggle}
                        disabled={mutation.isPending}
                    />
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity ${!isSoundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="space-y-6">
                    <div>
                        <Label className="text-sm font-semibold text-gray-900 block mb-3">Your Sounds</Label>
                        <div className="grid grid-cols-1 gap-3 max-h-[280px] overflow-y-auto pr-2">
                            {(!customSounds || customSounds.length === 0) && !customFile && (
                                <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                                    <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No sounds uploaded yet</p>
                                    <p className="text-xs">Upload your first notification sound below</p>
                                </div>
                            )}

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
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="font-bold truncate">{sound.name}</p>
                                        </div>
                                        {isSelected ? <Check className="h-5 w-5 shrink-0" /> : (
                                            <div
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 shrink-0"
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
                                    {customFile ? customFile.name : 'Upload sound file'}
                                </p>
                                <p className="text-xs text-gray-400">MP3, WAV, OGG supported</p>
                            </div>
                            {customFile && <Check className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="flex flex-col justify-between bg-gray-50 rounded-[32px] p-8 border border-gray-100 h-full">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Preview & Save</h4>
                        <p className="text-sm text-gray-500 mb-6">
                            Test your selected sound before saving.
                        </p>

                        {/* Active Sound Display */}
                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 mb-6">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Volume2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Selected</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{activeSoundName}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 px-4 shrink-0"
                                onClick={handlePlayPreview}
                                disabled={!customFile && !selectedSoundUrl}
                            >
                                {isPlaying ? (
                                    <><Square className="h-3 w-3 mr-2 fill-current" /> Stop</>
                                ) : (
                                    <><Play className="h-3 w-3 mr-2 fill-current" /> Play</>
                                )}
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
                            disabled={!isSoundEnabled || !selectedSoundUrl}
                        >
                            Send Test Notification
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
