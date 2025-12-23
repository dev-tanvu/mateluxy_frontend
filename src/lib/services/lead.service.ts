import api from '../api/axios';

export interface CreateLeadPayload {
    name: string;
    email: string;
    phone: string;
    organizer?: string;
    responsible?: string;
    observers?: string[];
    status?: string;
    dealPrice?: number;
    currency?: string;
    source?: string;
    closingDate?: string;
    district?: string;
    propertyType?: string;
    developer?: string;
    bedrooms?: number;
    budgetFrom?: number;
    budgetTo?: number;
    areaFrom?: string;
    areaTo?: string;
    additionalContent?: string;
    isActive?: boolean;
}

export const LeadService = {
    createLead: async (payload: CreateLeadPayload) => {
        const response = await api.post('/leads', payload);
        return response.data;
    },
    listLeads: async () => {
        const response = await api.get('/leads');
        return response.data;
    },
    getLead: async (id: string) => {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },
    transferLead: async (leadId: string, agentId: string) => {
        const response = await api.patch(`/leads/${leadId}/responsible`, { agentId });
        return response.data;
    },
    getStats: async (source?: string) => {
        const params = source ? `?source=${encodeURIComponent(source)}` : '';
        const response = await api.get(`/leads/stats${params}`);
        return response.data;
    },
    getLeadSourceStats: async () => {
        const response = await api.get<{
            facebook: number;
            instagram: number;
            tiktok: number;
            mateluxy: number;
            total: number;
        }>('/leads/source-stats');
        return response.data;
    },
};

