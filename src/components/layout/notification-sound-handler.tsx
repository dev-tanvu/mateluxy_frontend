
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/services/integration.service';
import { getMySettings } from '@/services/settings.service';

export function NotificationSoundHandler() {
    const lastNotificationIdRef = useRef<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000,
    });

    const { data: user } = useQuery({
        queryKey: ['my-settings'],
        queryFn: getMySettings
    });

    useEffect(() => {
        if (notifications.length > 0) {
            const latestNotification = notifications[0];

            // If we haven't tracked a last notification yet, set it to the current latest and don't play
            if (lastNotificationIdRef.current === null) {
                lastNotificationIdRef.current = latestNotification.id;
                return;
            }

            // If the latest notification is different from the last tracked one, play sound
            if (latestNotification.id !== lastNotificationIdRef.current) {
                lastNotificationIdRef.current = latestNotification.id;

                // Only play if it's unread (safety check)
                if (!latestNotification.isRead) {
                    playSound();
                }
            }
        }
    }, [notifications]);

    const playSound = () => {
        // If explicitly muted via flag, do not play.
        if (user?.isNotificationMuted) return;
        // If sound URL is explicitly empty string, sound is DISABLED.
        if (user?.notificationSoundUrl === '') return;

        const soundUrl = user?.notificationSoundUrl || '/sounds/bell.mp3';
        const audio = new Audio(soundUrl);

        audio.play().catch(err => {
            console.warn('Browser blocked auto-play sound:', err);
        });
    };

    return null; // This component doesn't render anything
}
