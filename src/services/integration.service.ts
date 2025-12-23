
import api from '@/lib/api/axios';

export interface IntegrationConfig {
    id: string;
    provider: string; // 'property_finder', 'meta', etc.
    isEnabled: boolean;
    credentials?: any; // usually we don't send credentials BACK to frontend for security unless needed, or redacted
    updatedAt: string;
}

// Get all integrations
export const getIntegrations = async (): Promise<IntegrationConfig[]> => {
    const response = await api.get<IntegrationConfig[]>('/integrations');
    return response.data;
};

// Update or Connect Integration
export const updateIntegration = async (provider: string, data: { isEnabled?: boolean; credentials?: any }): Promise<IntegrationConfig> => {
    const response = await api.post<IntegrationConfig>(`/integrations/${provider}`, data);
    return response.data;
};

// Disconnect Integration
export const disconnectIntegration = async (provider: string): Promise<IntegrationConfig> => {
    const response = await api.delete<IntegrationConfig>(`/integrations/${provider}`);
    return response.data;
};
export interface Notification {
    id: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// Get Notifications
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/integrations/notifications');
    return response.data;
};

// Mark Notifications as Read
export const markNotificationsRead = async (): Promise<void> => {
    await api.post('/integrations/notifications/read');
};

// Helper for System Settings
export const updateSystemSettings = async (timeZone: string) => {
    return updateIntegration('system_settings', { isEnabled: true, credentials: { timeZone } });
};
