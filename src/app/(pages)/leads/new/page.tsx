'use client';

import React, { useMemo, useState } from 'react';
import { LeadStepper } from '@/components/leads/lead-stepper';
import { ContactInfoStep } from '@/components/leads/contact-info-step';
import { AdditionalDetailsStep } from '@/components/leads/additional-details-step';
import { ClientsWishesStep } from '@/components/leads/clients-wishes-step';
import { LeadFormData } from '@/components/leads/types';
import { CountryCode } from 'libphonenumber-js';
import { getCountryCallingCode } from 'react-phone-number-input/input';
import { LeadService } from '@/lib/services/lead.service';
import { toast } from 'sonner';

const steps = [
    { title: 'Contact Information', description: "Enter client's contact informations" },
    { title: 'Additional Details', description: "Enter more details about the lead" },
    { title: "Client’s Wishes", description: "Enter client’s wishes" },
];

const initialData: LeadFormData = {
    name: '',
    email: '',
    phone: '',
    countryCode: 'AE' as CountryCode,
    organizer: '',
    responsible: '',
    observers: [],
    status: '',
    dealPrice: '',
    currency: 'AED',
    source: '',
    closingDate: '',
    district: '',
    propertyType: '',
    developer: '',
    bedrooms: '',
    budgetFrom: '',
    budgetTo: '',
    areaFrom: '',
    areaTo: '',
    additionalContent: '',
    isActive: true,
};

export default function AddLeadPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<LeadFormData>(initialData);
    const [submitting, setSubmitting] = useState(false);

    const currentComponent = useMemo(() => {
        if (currentStep === 0) {
            return (
                <ContactInfoStep
                    data={formData}
                    onChange={handleChange}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            );
        }

        if (currentStep === 1) {
            return (
                <AdditionalDetailsStep
                    data={formData}
                    onChange={handleChange}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            );
        }

        return (
            <ClientsWishesStep
                data={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={handleBack}
                submitting={submitting}
            />
        );
    }, [currentStep, formData, submitting]);

    function handleChange(field: keyof LeadFormData, value: string | string[] | CountryCode) {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function handleNext() {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }

    function handleBack() {
        if (currentStep === 0) {
            window.history.back();
            return;
        }
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }

    async function handleSubmit() {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Name, email, and phone are required.');
            return;
        }

        try {
            setSubmitting(true);
            const dialCode = getCountryCallingCode(formData.countryCode || 'AE');
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: `+${dialCode} ${formData.phone}`.trim(),
                organizer: formData.organizer || undefined,
                responsible: formData.responsible || undefined,
                observers: formData.observers?.filter(Boolean),
                status: formData.status || undefined,
                dealPrice: formData.dealPrice ? Number(formData.dealPrice) : undefined,
                currency: formData.currency || undefined,
                source: formData.source || undefined,
                closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : undefined,
                district: formData.district || undefined,
                propertyType: formData.propertyType || undefined,
                developer: formData.developer || undefined,
                bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
                budgetFrom: formData.budgetFrom ? Number(formData.budgetFrom) : undefined,
                budgetTo: formData.budgetTo ? Number(formData.budgetTo) : undefined,
                areaFrom: formData.areaFrom || undefined,
                areaTo: formData.areaTo || undefined,
                additionalContent: formData.additionalContent || undefined,
                isActive: formData.isActive,
            };

            await LeadService.createLead(payload);
            toast.success('Lead added successfully.');
            setFormData(initialData);
            setCurrentStep(0);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to create lead');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f9ff]">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-2 py-10 lg:grid-cols-[360px_1fr] lg:px-4 xl:px-6">
                <div className="w-full lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-4rem)]">
                    <LeadStepper steps={steps} currentStep={currentStep} />
                </div>
                <div className="w-full">
                    <div className="min-h-[78vh] rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(25,70,128,0.06)] sm:p-8">
                        {currentComponent}
                    </div>
                </div>
            </div>
        </div>
    );
}

