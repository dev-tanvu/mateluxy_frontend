import api from '@/lib/api/axios';

export interface Watermark {
    id: string;
    name: string;
    type: 'image' | 'text';
    imageUrl?: string;
    text?: string;
    textColor?: string;
    position: string;
    opacity: number;
    scale: number;
    rotation: number;
    blendMode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTextWatermarkData {
    name: string;
    text: string;
    textColor?: string;
    position?: string;
    opacity?: number;
    scale?: number;
    rotation?: number;
    blendMode?: string;
}

export const getWatermarks = async (): Promise<Watermark[]> => {
    const response = await api.get<Watermark[]>('/watermarks');
    return response.data;
};

export const getActiveWatermark = async (): Promise<Watermark | null> => {
    const response = await api.get<Watermark | null>('/watermarks/active');
    return response.data;
};

// Upload image watermark
export const uploadWatermark = async (name: string, file: File, options?: {
    position?: string;
    opacity?: number;
    scale?: number;
    rotation?: number;
    blendMode?: string;
}): Promise<Watermark> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', file);
    if (options?.position) formData.append('position', options.position);
    if (options?.opacity !== undefined) formData.append('opacity', options.opacity.toString());
    if (options?.scale !== undefined) formData.append('scale', options.scale.toString());
    if (options?.rotation !== undefined) formData.append('rotation', options.rotation.toString());
    if (options?.blendMode) formData.append('blendMode', options.blendMode);

    const response = await api.post<Watermark>('/watermarks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// Create text watermark
export const createTextWatermark = async (data: CreateTextWatermarkData): Promise<Watermark> => {
    const response = await api.post<Watermark>('/watermarks/text', data);
    return response.data;
};

export const updateWatermark = async (id: string, data: {
    name?: string;
    text?: string;
    textColor?: string;
    position?: string;
    opacity?: number;
    scale?: number;
    rotation?: number;
    blendMode?: string;
}): Promise<Watermark> => {
    const response = await api.patch<Watermark>(`/watermarks/${id}`, data);
    return response.data;
};

export const activateWatermark = async (id: string): Promise<Watermark> => {
    const response = await api.patch<Watermark>(`/watermarks/${id}/activate`);
    return response.data;
};

export const deactivateAllWatermarks = async (): Promise<void> => {
    await api.post('/watermarks/deactivate-all');
};

export const deleteWatermark = async (id: string): Promise<void> => {
    await api.delete(`/watermarks/${id}`);
};
