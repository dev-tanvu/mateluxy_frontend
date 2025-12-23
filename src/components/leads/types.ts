import { CountryCode } from 'libphonenumber-js';

export interface LeadFormData {
    // Contact Information
    name: string;
    email: string;
    phone: string;
    countryCode: CountryCode;

    // Additional Details
    organizer?: string;
    responsible?: string;
    observers: string[];
    status?: string;
    dealPrice?: string;
    currency: string;
    source?: string;
    closingDate?: string;

    // Client's Wishes
    district?: string;
    propertyType?: string;
    developer?: string;
    bedrooms?: string;
    budgetFrom?: string;
    budgetTo?: string;
    areaFrom?: string;
    areaTo?: string;
    additionalContent?: string;
    isActive?: boolean;
}

