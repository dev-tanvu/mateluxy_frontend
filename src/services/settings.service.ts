
import api from '@/lib/api/axios';

export interface NotificationSettings {
    notificationSoundUrl: string | null;
    notificationSoundStart: number;
    notificationSoundEnd: number | null;
    useCustomNotificationSound: boolean;
    isNotificationMuted: boolean;
}

export const updateNotificationSettings = async (formData: FormData) => {
    const response = await api.patch('/users/me/notification-settings', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};


export const getMySettings = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export interface NotificationSound {
    id: string;
    name: string;
    url: string;
    userId: string;
    createdAt: string;
}

export const getNotificationSounds = async (): Promise<NotificationSound[]> => {
    const response = await api.get('/users/me/notification-sounds');
    return response.data;
};

export const deleteNotificationSound = async (id: string): Promise<void> => {
    await api.delete(`/users/me/notification-sounds/${id}`);
};
