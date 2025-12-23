import api from '../api/axios';

import { OffPlanProperty } from './off-plan-property.service';

export interface Developer {
    id: string;
    name: string;
    email: string;
    phone: string;
    logoUrl?: string;
    about?: string;
    salesManagerName: string;
    salesManagerEmail: string;
    salesManagerPhone: string;
    salesManagerPhotoUrl?: string;
    nationality?: string;
    languages?: string[];
    isActive: boolean;
    createdAt: string;
    _count?: {
        properties: number;
    };
    properties?: OffPlanProperty[];
}

export interface CreateDeveloperDto {
    name: string;
    email: string;
    phone: string;
    about?: string;
    logo?: File;
    salesManagerName: string;
    salesManagerEmail: string;
    salesManagerPhone: string;
    salesManagerPhoto?: File;
    nationality?: string;
    languages?: string;
    isActive?: boolean;
}

export const developerService = {
    getAll: async (search?: string) => {
        const params = search ? { search } : {};
        const response = await api.get<Developer[]>('/developers', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Developer>(`/developers/${id}`);
        return response.data;
    },

    create: async (data: CreateDeveloperDto) => {
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);

        if (data.about) {
            formData.append('about', data.about);
        }

        formData.append('salesManagerName', data.salesManagerName);
        formData.append('salesManagerEmail', data.salesManagerEmail);
        formData.append('salesManagerPhone', data.salesManagerPhone);

        if (data.nationality) {
            formData.append('nationality', data.nationality);
        }

        if (data.languages) {
            formData.append('languages', data.languages);
        }

        if (data.logo) {
            formData.append('logo', data.logo);
        }

        if (data.salesManagerPhoto) {
            formData.append('salesManagerPhoto', data.salesManagerPhoto);
        }

        const response = await api.post<Developer>('/developers', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id: string, data: Partial<CreateDeveloperDto>) => {
        const formData = new FormData();

        if (data.name) formData.append('name', data.name);
        if (data.email) formData.append('email', data.email);
        if (data.phone) formData.append('phone', data.phone);
        if (data.about) formData.append('about', data.about);

        if (data.salesManagerName) formData.append('salesManagerName', data.salesManagerName);
        if (data.salesManagerEmail) formData.append('salesManagerEmail', data.salesManagerEmail);
        if (data.salesManagerPhone) formData.append('salesManagerPhone', data.salesManagerPhone);

        if (data.nationality) formData.append('nationality', data.nationality);
        if (data.languages) formData.append('languages', data.languages);

        if (data.isActive !== undefined) {
            formData.append('isActive', String(data.isActive));
        }

        if (data.logo) {
            formData.append('logo', data.logo);
        }

        if (data.salesManagerPhoto) {
            formData.append('salesManagerPhoto', data.salesManagerPhoto);
        }

        const response = await api.patch<Developer>(`/developers/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/developers/${id}`);
    },
};
