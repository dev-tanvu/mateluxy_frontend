import api from '../api/axios';
import qs from 'qs';

export interface OffPlanProperty {
    id: string;
    developerId: string;
    developer?: {
        id: string;
        name: string;
        logoUrl?: string;
        salesManagerPhone?: string;
    };

    // Specific Details
    emirate: string;
    launchType: string;
    projectHighlight: string;
    propertyType: string[];
    plotArea?: number;
    area: number;
    bedrooms: number;
    kitchens?: number;
    bathrooms: number;

    // Locations
    address?: string;
    latitude?: number;
    longitude?: number;
    style?: string;
    focalPoint?: string;
    focalPointImage?: string;
    nearbyHighlights?: any;

    // Price Tab
    startingPrice?: number;
    serviceCharges?: number;
    brokerFee?: string;
    roiPotential?: number;
    paymentPlan?: any;

    // DLD & Status
    dldPermitNumber?: string;
    dldQrCode?: string;
    projectStage?: string;
    constructionProgress?: number;
    handoverDate?: string;

    // General Details
    projectTitle?: string;
    shortDescription?: string;
    projectDescription?: string;

    // Media
    coverPhoto?: string;
    videoUrl?: string;
    agentVideoUrl?: string;
    virtualTourUrl?: string;
    exteriorMedia?: string[];
    interiorMedia?: string[];

    // Additional
    reference?: string;
    brochure?: string;
    amenitiesCover?: string;
    amenitiesTitle?: string;
    amenitiesSubtitle?: string;
    amenities?: Array<{
        name: string;
        icon: string;
    }>;
    floorPlans?: Array<{
        propertyType: string;
        livingArea: string;
        price: string;
        floorPlanImage?: string;
    }>;

    // Agent
    areaExperts?: Record<string, string[]>; // { [location: string]: agentId[] }
    projectExperts?: string[]; // agentId[]

    // Hydrated agents (optional, if we decide to include them in response)
    // For now, the backend doesn't include full agent objects, so we might need to fetch them or update backend to include them

    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    leadsCount?: number;
}

export interface CreateOffPlanPropertyDto {
    developerId: string;

    // Specific Details
    emirate?: string | null;
    launchType?: string | null;
    projectHighlight?: string | null;
    propertyType?: string[] | null;
    plotArea?: number | null;
    area?: number | null;
    bedrooms?: number | null;
    kitchens?: number | null;
    bathrooms?: number | null;

    // Locations
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    style?: string | null;
    focalPoint?: string | null;
    focalPointImage?: string | null;
    nearbyHighlights?: Array<{
        title?: string | null;
        subtitle?: string | null;
        highlights?: Array<{
            name?: string | null;
            image?: string | null;
        }> | null;
    }> | null;

    // Price Tab
    startingPrice?: number | null;
    serviceCharges?: number | null;
    brokerFee?: string | null;
    roiPotential?: number | null;
    paymentPlan?: {
        title?: string | null;
        subtitle?: string | null;
        milestones?: Array<{
            label?: string | null;
            percentage?: string | null;
            subtitle?: string | null;
        }> | null;
    } | null;

    // DLD & Status
    dldPermitNumber?: string | null;
    dldQrCode?: string | null;
    projectStage?: string | null;
    constructionProgress?: number | null;
    handoverDate?: string | null;

    // General Details
    projectTitle?: string | null;
    shortDescription?: string | null;
    projectDescription?: string | null;

    // Media
    coverPhoto?: string | null;
    videoUrl?: string | null;
    agentVideoUrl?: string | null;
    virtualTourUrl?: string | null;
    exteriorMedia?: string[] | null;
    interiorMedia?: string[] | null;

    // Additional
    reference?: string | null;
    brochure?: string | null;
    amenitiesCover?: string | null;
    amenitiesTitle?: string | null;
    amenitiesSubtitle?: string | null;
    amenities?: Array<{
        name?: string | null;
        icon?: string | null;
    }> | null;
    floorPlans?: Array<{
        propertyType?: string | null;
        livingArea?: string | null;
        price?: string | null;
        floorPlanImage?: string | null;
    }> | null;

    areaExperts?: Record<string, string[]> | null;
    projectExperts?: string[] | null;
    assignedAgentId?: string | null;
}

export const offPlanPropertyService = {
    getAll: async (filters?: {
        search?: string;
        developerId?: string;
        areaExpertIds?: string[];
        projectExpertIds?: string[];
        propertyTypes?: string[];
        minPrice?: number;
        maxPrice?: number;
        minArea?: number;
        maxArea?: number;
        status?: string;
        reference?: string;
        location?: string;
        permitNumber?: string;
        sortBy?: 'date' | 'price' | 'name';
        sortOrder?: 'asc' | 'desc';
    }) => {
        const params: any = {};
        if (filters) {
            if (filters.search) params.search = filters.search;
            if (filters.developerId) params.developerId = filters.developerId;
            if (filters.areaExpertIds && filters.areaExpertIds.length > 0) params.areaExpertIds = filters.areaExpertIds;
            if (filters.projectExpertIds && filters.projectExpertIds.length > 0) params.projectExpertIds = filters.projectExpertIds;
            if (filters.propertyTypes && filters.propertyTypes.length > 0) params.propertyType = filters.propertyTypes;
            if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
            if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
            if (filters.minArea !== undefined) params.minArea = filters.minArea;
            if (filters.maxArea !== undefined) params.maxArea = filters.maxArea;
            if (filters.status) params.status = filters.status;
            if (filters.reference) params.reference = filters.reference;
            if (filters.location) params.location = filters.location;
            if (filters.permitNumber) params.permitNumber = filters.permitNumber;
            if (filters.sortBy) params.sortBy = filters.sortBy;
            if (filters.sortOrder) params.sortOrder = filters.sortOrder;
        }

        const response = await api.get<OffPlanProperty[]>('/off-plan-properties', {
            params,
            paramsSerializer: (params) => {
                return qs.stringify(params, { arrayFormat: 'repeat' });
            }
        });
        return response.data;
    },

    getAggregates: async () => {
        const response = await api.get<{
            minPrice: number;
            maxPrice: number;
            minArea: number;
            maxArea: number;
        }>('/off-plan-properties/aggregates');
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<OffPlanProperty>(`/off-plan-properties/${id}`);
        return response.data;
    },

    create: async (data: CreateOffPlanPropertyDto) => {
        const response = await api.post<OffPlanProperty>('/off-plan-properties', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateOffPlanPropertyDto>) => {
        const response = await api.patch<OffPlanProperty>(`/off-plan-properties/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/off-plan-properties/${id}`);
    },
};
