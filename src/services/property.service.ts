import api from '@/lib/api/axios';
import { Agent } from '@/lib/services/agent.service';

export interface Property {
    id: string;
    category: string;
    purpose: string;
    clientName: string;
    nationality?: string;
    phoneNumber: string;
    emirate?: string;
    propertyType?: string;
    plotArea?: number;
    area?: number;
    bedrooms?: number;
    kitchens?: number;
    bathrooms?: number;
    unitNumber?: string;
    ownershipStatus?: string;
    parkingSpaces?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    furnishingType?: string;
    price?: number;
    rentalPeriod?: string;
    brokerFee?: string;
    numberOfCheques?: string;
    dldPermitNumber?: string;
    dldQrCode?: string;
    propertyTitle?: string;
    propertyDescription?: string;
    coverPhoto?: string;
    videoUrl?: string;
    mediaImages: string[];
    reference?: string;
    availableFrom?: string;
    amenities: string[];
    nocDocument?: string;
    passportCopy?: string;
    emiratesIdScan?: string;
    titleDeed?: string;
    assignedAgentId?: string;
    assignedAgent?: Agent;
    isActive: boolean;
    status: 'AVAILABLE' | 'SOLD' | 'RENTED';
    // Property Finder Integration
    pfListingId?: string;
    pfPublished?: boolean;
    pfVerificationStatus?: string;
    pfQualityScore?: number;
    pfSyncedAt?: string;
    createdAt: string;
    updatedAt: string;
    pfLocationId?: number;
    pfLocationPath?: string;
    leadsCount?: number;
}

export interface CreatePropertyData {
    category: string;
    purpose: string;
    clientName: string;
    nationality?: string;
    phoneNumber: string;
    emirate?: string;
    propertyType?: string;
    plotArea?: number;
    area?: number;
    bedrooms?: number;
    kitchens?: number;
    bathrooms?: number;
    unitNumber?: string;
    ownershipStatus?: string;
    parkingSpaces?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    furnishingType?: string;
    price?: number;
    rentalPeriod?: string;
    brokerFee?: string;
    numberOfCheques?: string;
    dldPermitNumber?: string;
    dldQrCode?: string;
    propertyTitle?: string;
    propertyDescription?: string;
    videoUrl?: string;
    reference?: string;
    availableFrom?: string;
    amenities?: string[];
    assignedAgentId?: string;
    phoneCountry?: string;
    isActive?: boolean;
    pfLocationId?: number;
    pfLocationPath?: string;

    // Files
    coverPhoto?: File | string;
    mediaImages?: (File | string)[];
    nocDocument?: File | string;
    passportCopy?: File | string;
    emiratesIdScan?: File | string;
    titleDeed?: File | string;
}

// Get all properties
// Paginated Response Interface
export interface PaginatedProperties {
    data: Property[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Get all properties
export const getProperties = async (params?: {
    search?: string;
    status?: string;
    agentIds?: string[];
    category?: string;
    purpose?: string;
    location?: string;
    reference?: string;
    propertyTypes?: string[];
    permitNumber?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    sortBy?: 'date' | 'price' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}): Promise<PaginatedProperties> => {
    // Map propertyTypes to propertyType for backend consistency if needed
    // But backend expects propertyType as string[] maybe.
    // Let's ensure keys match what backend expects.
    // Backend controller expects: agentIds, category, purpose, location, reference, propertyType, permitNumber, minPrice, maxPrice, ...

    // Convert propertyTypes to propertyType for backend
    const apiParams: any = { ...params };
    // No mapping needed as backend now accepts propertyTypes

    const response = await api.get<PaginatedProperties>('/properties', { params: apiParams });
    return response.data;
};

// Get aggregates for filters
export const getPropertyAggregates = async (): Promise<{
    minPrice: number;
    maxPrice: number;
    minArea: number;
    maxArea: number;
    propertyTypes: string[];
}> => {
    const response = await api.get('/properties/aggregates');
    return response.data;
};

// Get dashboard stats
export const getDashboardStats = async (): Promise<{
    active: { count: number; trend: number };
    offPlan: { count: number; trend: number };
    sold: { count: number; trend: number };
    rent: { count: number; trend: number };
    buy: { count: number; trend: number };
    residential: { count: number; trend: number };
    commercial: { count: number; trend: number };
}> => {
    const response = await api.get('/properties/stats');
    return response.data;
};

// Get single property
export const getProperty = async (id: string): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
};

// Update property status
export const updatePropertyStatus = async (id: string, status: 'AVAILABLE' | 'SOLD' | 'RENTED'): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${id}/status`, { status });
    return response.data;
};

// Toggle property active state (Draft/Published)
export const togglePropertyActive = async (id: string, isActive: boolean): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${id}/toggle-active`, { isActive });
    return response.data;
};

// Create property
export const createProperty = async (data: CreatePropertyData): Promise<Property> => {
    const formData = new FormData();

    // Append all text fields
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null &&
            key !== 'coverPhoto' &&
            key !== 'mediaImages' &&
            key !== 'nocDocument' &&
            key !== 'passportCopy' &&
            key !== 'emiratesIdScan' &&
            key !== 'titleDeed' &&
            key !== 'amenities') {
            formData.append(key, String(value));
        }
    });

    // Append amenities array
    if (data.amenities && data.amenities.length > 0) {
        data.amenities.forEach(amenity => {
            formData.append('amenities[]', amenity);
        });
    }

    // Append files
    if (data.coverPhoto) {
        formData.append('coverPhoto', data.coverPhoto);
    }

    if (data.mediaImages && data.mediaImages.length > 0) {
        data.mediaImages.forEach(file => {
            formData.append('mediaImages', file);
        });
    }

    if (data.nocDocument instanceof File) {
        formData.append('nocDocument', data.nocDocument);
    }

    if (data.passportCopy instanceof File) {
        formData.append('passportCopy', data.passportCopy);
    }

    if (data.emiratesIdScan instanceof File) {
        formData.append('emiratesIdScan', data.emiratesIdScan);
    }

    if (data.titleDeed instanceof File) {
        formData.append('titleDeed', data.titleDeed);
    }

    const response = await api.post<Property>('/properties', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Update property
export const updateProperty = async (id: string, data: Partial<CreatePropertyData>): Promise<Property> => {
    const formData = new FormData();

    // Append all text fields
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'coverPhoto' && key !== 'mediaImages' && key !== 'nocDocument' && key !== 'amenities' && key !== 'passportCopy' && key !== 'emiratesIdScan' && key !== 'titleDeed') {
            formData.append(key, String(value));
        }
    });

    // Append amenities array
    if (data.amenities && data.amenities.length > 0) {
        data.amenities.forEach(amenity => {
            formData.append('amenities[]', amenity);
        });
    }

    // Append files
    if (data.coverPhoto) {
        formData.append('coverPhoto', data.coverPhoto);
    }

    if (data.mediaImages && data.mediaImages.length > 0) {
        data.mediaImages.forEach(file => {
            formData.append('mediaImages', file);
        });
    }

    if (data.nocDocument instanceof File) {
        formData.append('nocDocument', data.nocDocument);
    }

    if (data.passportCopy instanceof File) {
        formData.append('passportCopy', data.passportCopy);
    }

    if (data.emiratesIdScan instanceof File) {
        formData.append('emiratesIdScan', data.emiratesIdScan);
    }

    if (data.titleDeed instanceof File) {
        formData.append('titleDeed', data.titleDeed);
    }

    const response = await api.patch<Property>(`/properties/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Delete property
export const deleteProperty = async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}`);
};

// ============ PROPERTY FINDER SYNC ============

// Sync all properties to Property Finder
export const syncAllToPropertyFinder = async (): Promise<{
    success: boolean;
    total: number;
    synced: number;
    failed: number;
    errors?: { propertyId: string; error: string }[];
}> => {
    const response = await api.post('/properties/sync-to-pf');
    return response.data;
};

// Sync single property to Property Finder
export const syncPropertyToPropertyFinder = async (id: string): Promise<{
    success: boolean;
    propertyId: string;
    pfListingId: string;
}> => {
    const response = await api.post(`/properties/${id}/sync-to-pf`);
    return response.data;
};

// Publish property on Property Finder
export const publishToPropertyFinder = async (id: string): Promise<void> => {
    await api.post(`/properties/${id}/publish-to-pf`);
};

// Unpublish property from Property Finder
export const unpublishFromPropertyFinder = async (id: string): Promise<void> => {
    await api.post(`/properties/${id}/unpublish-from-pf`);
};

// Sync property details FROM Property Finder (Backfill)
export const syncPropertyDetailsFromPf = async (id: string): Promise<Property> => {
    const response = await api.post(`/properties/${id}/sync-from-pf-listing`);
    return response.data;
};

// Get Property Finder listing details
export const getPropertyFinderListing = async (id: string): Promise<any> => {
    const response = await api.get(`/properties/${id}/pf-listing`);
    return response.data;
};

// Get Property Finder statistics
export const getPropertyFinderStats = async (id: string): Promise<{
    impressions: number;
    listingClicks: number;
    interests: number;
    leads: number;
    trends: {
        impressions: { value: number; isPositive: boolean; change: number; period: string };
        clicks: { value: number; isPositive: boolean; change: number; period: string };
        interests: { value: number; isPositive: boolean; change: number; period: string };
        leads: { value: number; isPositive: boolean; change: number; period: string };
    };
}> => {
    const response = await api.get(`/properties/${id}/pf-stats`);
    return response.data;
};

// Fetch missing location paths - for properties with pfLocationId but no pfLocationPath
export const fetchMissingLocationPaths = async (): Promise<{
    success: boolean;
    total: number;
    updated: number;
    failed: number;
    errors?: { propertyId: string; error: string }[];
}> => {
    const response = await api.post('/properties/fetch-missing-location-paths');
    return response.data;
};
