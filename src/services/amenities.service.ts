import api from '@/lib/api/axios';

export interface Amenity {
    id: string;
    name: string;
    icon?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAmenityData {
    name: string;
    icon?: string;
}

// Get all amenities
export const getAmenities = async (): Promise<Amenity[]> => {
    const response = await api.get<Amenity[]>('/amenities');
    return response.data;
};

// Create a new amenity
export const createAmenity = async (data: CreateAmenityData): Promise<Amenity> => {
    const response = await api.post<Amenity>('/amenities', data);
    return response.data;
};

// Delete an amenity
export const deleteAmenity = async (id: string): Promise<void> => {
    await api.delete(`/amenities/${id}`);
};
