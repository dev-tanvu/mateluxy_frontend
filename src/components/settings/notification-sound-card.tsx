'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Volume2, Music, Check, Loader2, Play, Square } from 'lucide-react';
import { updateNotificationSettings, getMySettings } from '@/services/settings.service';
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

    const { data: user, isLoading } = useQuery({
        queryKey: ['my-settings'],
        queryFn: getMySettings
    });

    useEffect(() => {
        if (user && user.notificationSoundUrl) {
            setSelectedSoundUrl(user.notificationSoundUrl);
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: updateNotificationSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-settings'] });
            toast.success('Notification settings updated');
        },
        onError: () => {
            toast.error('Failed to update notification settings');
        }
    });

    const handlePlayPreview = (url: string) => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (audioRef.current?.src.includes(url)) {
                setIsPlaying(false);
                return;
            }
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play().catch(err => console.warn('Play error:', err));
        setIsPlaying(true);

        audio.onended = () => {
            setIsPlaying(false);
        };
    };

    const handleSelect = (url: string) => {
        setSelectedSoundUrl(url);
        handlePlayPreview(url);
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append('notificationSoundUrl', selectedSoundUrl);
        formData.append('useCustomNotificationSound', 'false');

        mutation.mutate(formData);
    };

    const handleSendTestNotification = async () => {
        try {
            await sendTestNotification();
            // Invalidate notifications to trigger the dropdown sound logic (which we will add next)
            await queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Test notification sent');
        } catch (e) {
            toast.error('Failed to send test notification');
        }
    };

    if (isLoading) return <div className="animate-pulse h-[300px] bg-gray-100 rounded-[24px]" />;

    return (
        <Card className="p-8 border border-[#EDF1F7] bg-white rounded-[24px] shadow-none mb-8">
            <div className="flex gap-4 mb-8">
                <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                    <Volume2 className="h-6 w-6 text-indigo-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-[18px] text-[#111827] mb-1">Notification Sound</h3>
                    <p className="text-[14px] text-[#6B7280]">
                        Choose the sound you want to hear when a new notification arrives.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-900 block mb-2">Available Sounds</Label>
                    <div className="grid grid-cols-1 gap-3">
                        {DEFAULT_SOUNDS.map((sound) => {
                            const isSelected = selectedSoundUrl === sound.url;
                            return (
                                <button
                                    key={sound.name}
                                    onClick={() => handleSelect(sound.url)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border text-sm font-medium transition-all
                                        ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                        <Music className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold">{sound.name}</p>
                                        <p className="text-xs text-gray-400">Click to preview</p>
                                    </div>
                                    {isSelected ? <Check className="h-5 w-5" /> : (
                                        <div className="p-2 border border-gray-100 rounded-full hover:bg-white transition-colors">
                                            <Play className="h-3 w-3 fill-gray-400 text-gray-400" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col justify-between bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">Preview & Save</h4>
                        <p className="text-sm text-gray-500 mb-6">
                            The selected sound will play automatically when you receive a lead or system alert.
                        </p>

                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 mb-8">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Volume2 className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Currently Selected</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {DEFAULT_SOUNDS.find(s => s.url === selectedSoundUrl)?.name || 'None'}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl h-9 px-4"
                                onClick={() => handlePlayPreview(selectedSoundUrl)}
                            >
                                {isPlaying && audioRef.current?.src.includes(selectedSoundUrl) ? (
                                    <><Square className="h-3 w-3 mr-2 fill-current" /> Stop</>
                                ) : (
                                    <><Play className="h-3 w-3 mr-2 fill-current" /> Test</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-[#00B7FF] hover:bg-[#0099DD] rounded-2xl h-[60px] font-bold text-lg shadow-lg shadow-blue-100"
                        onClick={handleSave}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...</> : 'Save Selected Sound'}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full mt-4 text-gray-500 hover:text-indigo-600 hover:bg-white"
                        onClick={handleSendTestNotification}
                    >
                        Send Test Notification
                    </Button>
                </div>
            </div>
        </Card>
    );
}
