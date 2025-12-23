import api from "@/lib/api/axios";

export interface ActivityLog {
    id: string;
    action: string;
    ipAddress?: string;
    location?: string;
    createdAt: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
        avatarUrl?: string;
    };
}

export const getActivityLogs = async (params?: { skip?: number; take?: number; search?: string; startDate?: string; endDate?: string }) => {
    const { data } = await api.get<ActivityLog[]>('/activity-logs', { params });
    return data;
};
