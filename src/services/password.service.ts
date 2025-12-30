
import api from '@/lib/api/axios';

export interface PasswordListItem {
    id: string;
    title: string;
    note: string | null;
    createdAt: string;
    hasAccess: boolean;
}

export interface PasswordDetails extends PasswordListItem {
    username: string; // decrypted
    password: string; // decrypted
    accessIds: string[];
}

export const getPasswords = async (): Promise<PasswordListItem[]> => {
    const response = await api.get<PasswordListItem[]>('/passwords');
    return response.data;
};

export const getPasswordDetails = async (id: string): Promise<PasswordDetails> => {
    const response = await api.get<PasswordDetails>(`/passwords/${id}`);
    return response.data;
};

export const createPassword = async (data: any): Promise<PasswordDetails> => {
    const response = await api.post<PasswordDetails>('/passwords', data);
    return response.data;
};

export const updatePassword = async (id: string, data: any): Promise<PasswordDetails> => {
    const response = await api.patch<PasswordDetails>(`/passwords/${id}`, data);
    return response.data;
};

export const deletePassword = async (id: string): Promise<void> => {
    await api.delete(`/passwords/${id}`);
};
