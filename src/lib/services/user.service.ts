import api from '@/lib/api/axios';

export interface User {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: string;
    createdAt: string;
    avatarUrl?: string;
    permissions?: string[];
    isActive: boolean;
}

export interface CreateUserDto {
    fullName: string;
    username: string;
    email: string;
    role: string;
    password: string;
    avatar?: File;
    permissions?: string[];
    isActive?: boolean;
}

export const userService = {
    getAll: async (search?: string, role?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role && role !== 'All') params.append('role', role);

        const response = await api.get<User[]>(`/users?${params.toString()}`);
        return response.data;
    },

    create: async (data: CreateUserDto) => {
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('username', data.username);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('role', data.role);

        // Add permissions as JSON string
        if (data.permissions && data.permissions.length > 0) {
            formData.append('permissions', JSON.stringify(data.permissions));
        }

        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        const response = await api.post<User>('/users/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id: string, data: Partial<CreateUserDto>) => {
        const formData = new FormData();
        if (data.fullName) formData.append('fullName', data.fullName);
        if (data.username) formData.append('username', data.username);
        if (data.email) formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.role) formData.append('role', data.role);

        if (data.permissions) {
            formData.append('permissions', JSON.stringify(data.permissions));
        }

        if (data.isActive !== undefined) {
            formData.append('isActive', String(data.isActive));
        }

        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        const response = await api.patch<User>(`/users/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
};
