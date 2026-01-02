import api from '@/lib/api/axios';

export interface CreateTenancyContractData {
    propertyId?: string;

    // Owner Details
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;

    // Design specific fields
    contractDate?: string;
    contractNo?: string;
    landlordName?: string;
    landlordEmail?: string;
    landlordPhone?: string;

    // Tenant Details
    tenantName?: string;
    tenantPhone?: string;
    tenantEmail?: string;

    // Property Details
    propertyUsage?: string;
    buildingName?: string;
    location?: string;
    propertySize?: number;
    propertyType?: string;
    propertyNumber?: string;
    plotNumber?: string;
    premisesNumber?: string;

    // Contract Details
    contractStartDate?: string;
    contractEndDate?: string;
    annualRent?: number;
    contractValue?: number;
    securityDeposit?: number;
    modeOfPayment?: string;

    // Additional Terms
    additionalTerms?: string[];
}

export const createTenancyContract = async (data: CreateTenancyContractData) => {
    const response = await api.post('/tenancy-contracts', data);
    return response.data;
};
