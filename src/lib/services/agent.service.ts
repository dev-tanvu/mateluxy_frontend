import api from '../api/axios';

export interface Agent {
    id: string;
    name: string;
    username: string;
    email: string;
    photoUrl?: string;
    position: string;
    department: string;
    phone: string;
    phoneSecondary?: string;
    whatsapp?: string;
    address?: string;
    vcardUrl?: string;
    nationality?: string;
    linkedinAddress?: string;
    languages?: string[];
    about?: string;
    birthdate?: string;
    joinedDate?: string;
    experienceSince?: number;
    visaExpiryDate?: string;
    areasExpertIn?: string[];
    isActive: boolean;
    createdAt: string;
    pfVerificationStatus?: string;
    licenseDocumentUrl?: string;
}

export interface CreateAgentDto {
    name: string;
    username: string;
    email: string;
    password: string;
    position: string;
    department: string;
    phone: string;
    phoneSecondary?: string;
    whatsapp?: string;
    address?: string;
    nationality?: string;
    linkedinAddress?: string;
    experienceSince?: string;
    languages?: string;
    about?: string;
    birthdate?: string;
    joinedDate?: string;
    visaExpiryDate?: string;
    areasExpertIn?: string;
    photo?: File;
    vcard?: File;
    licenseDocument?: File;
    isActive?: boolean;
}

export const agentService = {
    getAll: async (search?: string) => {
        const params = search ? { search } : {};
        const response = await api.get<Agent[]>('/agents', { params });
        return response.data;
    },

    getByArea: async (area: string) => {
        const response = await api.get<Agent[]>('/agents/by-area', { params: { area } });
        return response.data;
    },

    getTopAgents: async (limit: number = 10) => {
        const response = await api.get<{
            id: string;
            name: string;
            position: string;
            photoUrl: string | null;
            soldCount: number;
            rentedCount: number;
            totalDeals: number;
        }[]>('/agents/top', { params: { limit } });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Agent>(`/agents/${id}`);
        return response.data;
    },

    create: async (data: CreateAgentDto) => {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('username', data.username);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('position', data.position);
        formData.append('department', data.department);
        formData.append('phone', data.phone);

        if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
        if (data.phoneSecondary) formData.append('phoneSecondary', data.phoneSecondary);
        if (data.linkedinAddress) formData.append('linkedinAddress', data.linkedinAddress);
        if (data.experienceSince) formData.append('experienceSince', data.experienceSince);
        if (data.address) formData.append('address', data.address);
        if (data.nationality) formData.append('nationality', data.nationality);
        if (data.languages) formData.append('languages', data.languages);
        if (data.about) formData.append('about', data.about);
        if (data.birthdate) formData.append('birthdate', data.birthdate);
        if (data.joinedDate) formData.append('joinedDate', data.joinedDate);
        if (data.visaExpiryDate) formData.append('visaExpiryDate', data.visaExpiryDate);
        if (data.areasExpertIn) formData.append('areasExpertIn', data.areasExpertIn);

        if (data.photo) formData.append('photo', data.photo);
        if (data.vcard) formData.append('vcard', data.vcard);
        if (data.licenseDocument) formData.append('licenseDocument', data.licenseDocument);

        const response = await api.post<Agent>('/agents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id: string, data: Partial<CreateAgentDto>) => {
        const formData = new FormData();

        if (data.name) formData.append('name', data.name);
        if (data.username) formData.append('username', data.username);
        if (data.email) formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.position) formData.append('position', data.position);
        if (data.department) formData.append('department', data.department);
        if (data.phone) formData.append('phone', data.phone);
        if (data.phoneSecondary) formData.append('phoneSecondary', data.phoneSecondary);
        if (data.whatsapp) formData.append('whatsapp', data.whatsapp);
        if (data.linkedinAddress) formData.append('linkedinAddress', data.linkedinAddress);
        if (data.experienceSince) formData.append('experienceSince', data.experienceSince);
        if (data.address) formData.append('address', data.address);
        if (data.nationality) formData.append('nationality', data.nationality);
        if (data.languages) formData.append('languages', data.languages);
        if (data.about) formData.append('about', data.about);
        if (data.birthdate) formData.append('birthdate', data.birthdate);
        if (data.joinedDate) formData.append('joinedDate', data.joinedDate);
        if (data.visaExpiryDate) formData.append('visaExpiryDate', data.visaExpiryDate);
        if (data.areasExpertIn) formData.append('areasExpertIn', data.areasExpertIn);

        if (data.isActive !== undefined) {
            formData.append('isActive', String(data.isActive));
        }

        if (data.photo) formData.append('photo', data.photo);
        if (data.vcard) formData.append('vcard', data.vcard);
        if (data.licenseDocument) formData.append('licenseDocument', data.licenseDocument);

        const response = await api.patch<Agent>(`/agents/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/agents/${id}`);
    },
    activate: async (id: string) => {
        const response = await api.patch<Agent>(`/agents/${id}/activate`);
        return response.data;
    },
    deactivate: async (id: string) => {
        const response = await api.patch<Agent>(`/agents/${id}/deactivate`);
        return response.data;
    },
    syncFromPropertyFinder: async () => {
        const response = await api.post<{ success: boolean; message: string }>('/agents/sync');
        return response.data;
    },
    submitForVerification: async (id: string) => {
        const response = await api.post<Agent>(`/agents/${id}/submit-verification`);
        return response.data;
    },
};
