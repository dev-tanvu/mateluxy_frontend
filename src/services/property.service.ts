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
    projectStatus?: string;
    completionDate?: string;
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
    projectStatus?: string;
    completionDate?: string;

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

    // Explicitly append projectStatus and completionDate if they exist in data (handled by loop, but ensuring no exclusion)
    // The loop above excludes only file keys and amenities, so projectStatus and completionDate strings will be included automatically.

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
        data.mediaImages.forEach(item => {
            if (item instanceof File) {
                formData.append('mediaImages', item);
            } else if (typeof item === 'string') {
                // Append as string. Backend DTO now accepts mediaImages as string[] or []
                // BUT FormData is flat. If we append 'mediaImages' multiple times with strings, NestJS @Body() will see it as array of strings?
                // NestJS with FileFieldsInterceptor:
                // The interceptor separates files into @UploadedFiles().
                // The rest of the body fields go to @Body().
                // If we append 'mediaImages' as 'http://...', it goes to body.
                // If we append 'mediaImages' as File, it goes to files.
                // We need to make sure the key name 'mediaImages' doesn't conflict or overwrite.
                // Actually standard FormData behavior: same key -> array.
                // But NestJS might treat 'mediaImages' in body separate from 'mediaImages' in files depending on Interceptor config.
                // However, we added mediaImages: string[] to DTO.
                formData.append('mediaImages', item);
            }
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
        data.mediaImages.forEach(item => {
            if (item instanceof File) {
                formData.append('mediaImages', item);
            } else if (typeof item === 'string') {
                formData.append('mediaImages', item);
            }
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

// ============ DRAFTS ============

export interface PropertyDraft {
    id: string;
    data: CreatePropertyData;
    originalPropertyId?: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export const saveDraft = async (data: CreatePropertyData, originalPropertyId?: string): Promise<PropertyDraft> => {
    // We send data as JSON body, simplified compared to FormData since files are tougher with drafts unless uploaded separately.
    // For now, assuming files are already uploaded or we handle them differently (users might need to re-upload files if not persisted).
    // Or, we can use FormData if backend handles it.
    // Backend `drafts.controller.ts` expects body directly.
    // If complex file handling needed, we might need a different approach for drafts (e.g. upload files first, get URLs, save URLs in draft).
    // Given the previous architecture, files were uploaded via FormData.
    // For Drafts, we might simplify: We save the *text* data. Files might be lost if not committed.
    // OR we assume files are just standard File objects which cannot be JSON serialized easily.
    // User requirement: "all in drafts tab".
    // Let's serialize what we can. File objects will be empty objects in JSON.
    // Ideally, "Save as Draft" should upload files to temp storage or we just save metadata.
    // Let's send the form data but as JSON, excluding File objects or converting them if they are URLs (strings).

    // Filter out File objects for now or handle them?
    // If we want to persist files, we should upload them.
    // But `saveDraft` endpoint in generic controller `createOrUpdate` expects JSON body.

    // Strategy: Serialize data. If files are URL strings (already uploaded), keep them. If File objects, we can't save them in JSON DB easily without uploading.
    // For now, let's just save the JSON data.

    const draftPayload = {
        ...data,
        originalPropertyId,
        // Remove File objects to avoid serialization issues or circular refs
        // We'll rely on the user to re-upload files or if they are already strings (URLs) they are kept.
        coverPhoto: typeof data.coverPhoto === 'string' ? data.coverPhoto : undefined,
        mediaImages: Array.isArray(data.mediaImages)
            ? data.mediaImages.filter(img => typeof img === 'string')
            : [],
        nocDocument: typeof data.nocDocument === 'string' ? data.nocDocument : undefined,
        passportCopy: typeof data.passportCopy === 'string' ? data.passportCopy : undefined,
        emiratesIdScan: typeof data.emiratesIdScan === 'string' ? data.emiratesIdScan : undefined,
        titleDeed: typeof data.titleDeed === 'string' ? data.titleDeed : undefined,
    };

    const response = await api.post<PropertyDraft>('/properties/drafts', draftPayload);
    return response.data;
};

export const getDrafts = async (): Promise<PropertyDraft[]> => {
    const response = await api.get<PropertyDraft[]>('/properties/drafts');
    return response.data;
};

export const getDraft = async (id: string): Promise<PropertyDraft> => {
    const response = await api.get<PropertyDraft>(`/properties/drafts/${id}`);
    return response.data;
};

export const deleteDraft = async (id: string): Promise<void> => {
    await api.delete(`/properties/drafts/${id}`);
};
