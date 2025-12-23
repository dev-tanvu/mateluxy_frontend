import api from '../api/axios';

export interface PropertyFinderLead {
    id: string;
    pfId: string;
    name: string;
    email: string;
    phone: string;
    channel: string;
    status: string;
    comments?: string;
    listingId?: string;
    listingReference?: string;
    assignedToIdentifier?: string;
    agentName?: string;
    agentImageUrl?: string;
    dealPrice?: number;
    createdAt: string;
    fetchedAt: string;
    updatedAt: string;
}

export const PropertyFinderLeadService = {
    listLeads: async (listingReference?: string) => {
        const params = listingReference ? { listingReference } : {};
        const response = await api.get('/property-finder-leads', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/property-finder-leads/stats');
        return response.data;
    },

    syncLeads: async () => {
        const response = await api.post('/property-finder/sync-leads');
        return response.data;
    },
};
