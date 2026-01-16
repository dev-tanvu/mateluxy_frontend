'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ClientDetailsTab } from '@/components/properties/tabs/client-details-tab';
import { SpecificDetailsTab } from '@/components/properties/tabs/specific-details-tab';
import { LocationsTab } from '@/components/properties/tabs/locations-tab';
import { PriceTab } from '@/components/properties/tabs/price-tab';
import { DldTab } from '@/components/properties/tabs/dld-tab';
import { GeneralDetailsTab } from '@/components/properties/tabs/general-details-tab';
import { MediaTab } from '@/components/properties/tabs/media-tab';
import { AdditionalTab } from '@/components/properties/tabs/additional-tab';
import { AgentTab } from '@/components/properties/tabs/agent-tab';
import { SubmissionOverlay } from '@/components/ui/submission-overlay';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateProperty, useUpdateProperty } from '@/hooks/use-properties';
import { CreatePropertyData, saveDraft, deleteDraft } from '@/services/property.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { NocData } from '@/components/noc/create-noc-page-content';
import { API_URL } from '@/lib/api-config';

interface PropertyFormStepProps {
    nocFile: File | null;
    category: string;
    purpose: string;
    initialData?: any;
    onBack: () => void;
    draftId?: string;
    nocData?: NocData | null;
}

// Define a type for form values if not already defined
type PropertyFormValues = CreatePropertyData & {
    clientName: string;
    nationality: string;
    phoneNumber: string;
    phoneCountry: string;
    emirate: string;
    propertyType: string;
    plotArea?: number;
    area?: number;
    bedrooms?: number;
    kitchens?: number;
    bathrooms?: number;
    unitNumber: string;
    ownershipStatus: string;
    parkingSpaces?: number;
    address: string;
    latitude?: number;
    longitude?: number;
    furnishingType: string;
    pfLocationId?: string;
    pfLocationPath?: string;
    price?: number;
    rentalPeriod: string;
    brokerFee?: number;
    numberOfCheques?: number;
    dldPermitNumber: string;
    dldQrCode: string;
    propertyTitle: string;
    propertyDescription: string;
    coverPhoto: File | string | FileList;
    videoUrl: string;
    mediaImages: (File | string)[];
    reference: string;
    availableFrom: string;
    amenities: string[];
    assignedAgentId: string;
    isActive?: boolean;
    pfPublished?: boolean;
};

const TABS = [
    { id: 'client', label: 'Client Details' },
    { id: 'specific', label: 'Specific Details' },
    { id: 'locations', label: 'Locations' },
    { id: 'price', label: 'Price' },
    { id: 'dld', label: 'DLD' },
    { id: 'additional', label: 'Additional' },
    { id: 'media', label: 'Media' },
    { id: 'general', label: 'General Details' },
    { id: 'agent', label: 'Agent' },
];

export function PropertyFormStep({ nocFile: initialNocFile, category: initialCategory, purpose: initialPurpose, initialData, onBack, draftId, nocData }: PropertyFormStepProps) {
    // Determine initial values
    const category = initialData?.category || initialCategory;
    const purpose = initialData?.purpose || initialPurpose;
    const [activeTab, setActiveTab] = useState('client');
    const [nocFile, setNocFile] = useState<File | string | null>(initialNocFile || initialData?.nocDocument || null);
    // New document states
    const [passportFile, setPassportFile] = useState<File | string | null>(initialData?.passportCopy || null);
    const [emiratesIdFile, setEmiratesIdFile] = useState<File | string | null>(initialData?.emiratesIdScan || null);
    const [titleDeedFile, setTitleDeedFile] = useState<File | string | null>(initialData?.titleDeed || null);

    const createPropertyMutation = useCreateProperty();
    const updatePropertyMutation = useUpdateProperty();
    // Only consider it "Editing" a Live Property if it has an ID. 
    // If it's a draft of a new property, initialData exists but has no ID (or we strip it).
    const isEditing = !!initialData?.id;

    const cancelClickedRef = React.useRef(false);
    const hasUnsavedChangesRef = React.useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('Processing...');
    const router = useRouter();

    const {
        register,
        control,
        formState: { errors },
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset
    } = useForm<PropertyFormValues>({
        defaultValues: {
            // Client Details
            clientName: initialData?.clientName || '',
            nationality: initialData?.nationality || '',
            phoneNumber: initialData?.phoneNumber || '',
            phoneCountry: initialData?.phoneCountry || 'AE',
            // Specific Details
            emirate: initialData?.emirate || '',
            propertyType: initialData?.propertyType || '',
            plotArea: initialData?.plotArea,
            area: initialData?.area,
            bedrooms: initialData?.bedrooms,
            kitchens: initialData?.kitchens,
            bathrooms: initialData?.bathrooms,
            unitNumber: initialData?.unitNumber || '',
            ownershipStatus: initialData?.ownershipStatus || '',
            parkingSpaces: initialData?.parkingSpaces || '',
            // Locations
            address: initialData?.address || '',
            latitude: initialData?.latitude,
            longitude: initialData?.longitude,
            furnishingType: initialData?.furnishingType || '',
            pfLocationId: initialData?.pfLocationId,
            pfLocationPath: initialData?.pfLocationPath,
            // Price
            price: initialData?.price,
            rentalPeriod: initialData?.rentalPeriod || '',
            brokerFee: initialData?.brokerFee,
            numberOfCheques: initialData?.numberOfCheques,
            // DLD
            dldPermitNumber: initialData?.dldPermitNumber || '',
            dldQrCode: initialData?.dldQrCode || '',
            // General Details
            propertyTitle: initialData?.propertyTitle || '',
            propertyDescription: initialData?.propertyDescription || '',
            // Media
            coverPhoto: initialData?.coverPhoto || '',
            videoUrl: initialData?.videoUrl || '',
            mediaImages: initialData?.mediaImages || [],
            // Additional
            reference: initialData?.reference || '',
            availableFrom: initialData?.availableFrom || '',
            amenities: initialData?.amenities || [],
            // Agent
            assignedAgentId: initialData?.assignedAgentId || '',
            // Project Status
            projectStatus: initialData?.projectStatus || '',
            completionDate: initialData?.completionDate || '',
        }
    });

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                // Client Details
                clientName: initialData.clientName || '',
                nationality: initialData.nationality || '',
                phoneNumber: initialData.phoneNumber || '',
                phoneCountry: initialData.phoneCountry || 'AE',
                // Specific Details
                emirate: initialData.emirate || '',
                propertyType: initialData.propertyType || '',
                plotArea: initialData.plotArea,
                area: initialData.area,
                bedrooms: initialData.bedrooms,
                kitchens: initialData.kitchens,
                bathrooms: initialData.bathrooms,
                unitNumber: initialData.unitNumber || '',
                ownershipStatus: initialData.ownershipStatus || '',
                parkingSpaces: initialData.parkingSpaces || '',
                // Locations
                address: initialData.address || '',
                latitude: initialData.latitude,
                longitude: initialData.longitude,
                furnishingType: initialData.furnishingType ? (initialData.furnishingType.charAt(0).toUpperCase() + initialData.furnishingType.slice(1).toLowerCase()) : '',
                pfLocationId: initialData.pfLocationId,
                pfLocationPath: initialData.pfLocationPath,
                // Price
                price: initialData.price,
                rentalPeriod: initialData.rentalPeriod || '',
                brokerFee: initialData.brokerFee,
                numberOfCheques: initialData.numberOfCheques,
                // DLD
                dldPermitNumber: initialData.dldPermitNumber || '',
                dldQrCode: initialData.dldQrCode || '',
                // General Details
                propertyTitle: initialData.propertyTitle || '',
                propertyDescription: initialData.propertyDescription || '',
                // Media
                coverPhoto: initialData.coverPhoto || '',
                videoUrl: initialData.videoUrl || '',
                mediaImages: initialData.mediaImages || [],
                // Additional
                reference: initialData.reference || '',
                availableFrom: initialData.availableFrom || '',
                amenities: initialData.amenities || [],
                // Agent
                assignedAgentId: initialData.assignedAgentId || '',
                // Project Status (For Sale properties)
                projectStatus: initialData.projectStatus || '',
                completionDate: initialData.completionDate || '',
            });

            // Update local file states
            setNocFile(initialData.nocDocument || null);
            setPassportFile(initialData.passportCopy || null);
            setEmiratesIdFile(initialData.emiratesIdScan || null);
            setTitleDeedFile(initialData.titleDeed || null);
        }
    }, [initialData, reset]);

    // Auto-fill form fields from NOC data
    useEffect(() => {
        if (nocData) {
            // Client name from NOC owner
            if (nocData.clientName) {
                setValue('clientName', nocData.clientName);
            }
            // Phone from NOC owner
            if (nocData.clientPhone) {
                setValue('phoneNumber', nocData.clientPhone);
            }
            if (nocData.clientCountryCode) {
                setValue('phoneCountry', nocData.clientCountryCode);
            }
            // Property type
            if (nocData.propertyType) {
                setValue('propertyType', nocData.propertyType);
            }
            // Area from build up area
            if (nocData.buildUpArea) {
                setValue('area', parseFloat(nocData.buildUpArea));
            }
            // Plot area
            if (nocData.plotArea) {
                setValue('plotArea', parseFloat(nocData.plotArea));
            }
            // Bedrooms
            if (nocData.bedrooms) {
                setValue('bedrooms', parseInt(nocData.bedrooms));
            }
            // Bathrooms
            if (nocData.bathrooms) {
                setValue('bathrooms', parseInt(nocData.bathrooms));
            }
            // Location from NOC (Google Map Location)
            if (nocData.location) {
                setValue('address', nocData.location);
                if (nocData.latitude) setValue('latitude', nocData.latitude);
                if (nocData.longitude) setValue('longitude', nocData.longitude);
            } else if (nocData.community) {
                // Fallback: Community to address
                setValue('address', nocData.community + (nocData.streetName ? ', ' + nocData.streetName : ''));
            }
            // Rental amount as price if purpose is rent
            if (nocData.rentalAmount && purpose === 'rent') {
                setValue('price', parseFloat(nocData.rentalAmount));
            }
            // Sale amount as price if purpose is sell
            if (nocData.saleAmount && purpose === 'sell') {
                setValue('price', parseFloat(nocData.saleAmount));
            }
        }
    }, [nocData, setValue, purpose]);

    console.log('PropertyFormStep initialData:', {
        id: initialData?.id,
        pfLocationId: initialData?.pfLocationId,
        pfLocationPath: initialData?.pfLocationPath
    });

    const _submitPropertyData = async (data: PropertyFormValues) => {
        try {
            // Prepare data for submission
            const propertyData: CreatePropertyData = {
                ...data,
                category,
                purpose,
                nocDocument: nocFile || undefined,
                passportCopy: passportFile || undefined,
                emiratesIdScan: emiratesIdFile || undefined,
                titleDeed: titleDeedFile || undefined,
                // Sanitize optional fields that might be empty strings
                availableFrom: data.availableFrom || undefined,
                reference: data.reference || undefined,
                propertyTitle: data.propertyTitle || undefined,
                propertyDescription: data.propertyDescription || undefined,
                videoUrl: data.videoUrl || undefined,

                // Handle file objects from form state if they are stored as File objects
                // The MediaTab likely stores File objects in state or form
                // We need to ensure coverPhoto and mediaImages are File objects here
            };

            // If coverPhoto is a FileList or similar, extract the File
            if (data.coverPhoto && (data.coverPhoto as FileList)[0] instanceof File) {
                propertyData.coverPhoto = (data.coverPhoto as FileList)[0];
            } else if (data.coverPhoto instanceof File) {
                propertyData.coverPhoto = data.coverPhoto;
            }

            // If mediaImages is an array
            if (Array.isArray(data.mediaImages)) {
                // We now accept both Files (new uploads) and strings (existing URLs)
                propertyData.mediaImages = data.mediaImages;
            }

            // Check if action was 'draft'
            if ((window as any)._submitAction === 'draft') {
                // We save as draft. 
                // Pass draftId if we are editing an existing draft to update it.
                // If we are editing a live property (isEditing=true), we pass initialData.id as originalPropertyId.
                propertyData.isActive = false; // Ensure draft is saved as inactive
                const payload = draftId ? { ...propertyData, id: draftId } : propertyData;
                await saveDraft(payload, isEditing ? initialData.id : undefined);
                toast.success('Draft saved successfully!');
                (window as any)._submitAction = null;
                return;
            }

            let savedPropertyId = initialData?.id;

            if (isEditing) {
                await updatePropertyMutation.mutateAsync({ id: initialData.id, data: propertyData });
                toast.success('Property updated successfully!');
            } else {
                const result = await createPropertyMutation.mutateAsync(propertyData);
                savedPropertyId = result.id;
                toast.success('Property created successfully!');
            }

            // If we successfully saved to main table, and we came from a draft (draftId exists), delete the draft.
            if (draftId) {
                try {
                    await deleteDraft(draftId);
                } catch (e) {
                    console.error('Failed to delete draft after publish', e);
                }
            }

            // check if action was 'publish' (Update to PF)
            if ((window as any)._submitAction === 'publish' && savedPropertyId) {
                toast.info('Syncing to Property Finder...');
                const backendUrl = API_URL;

                try {
                    // Trigger Sync
                    await import('axios').then(axios => axios.default.post(`${backendUrl}/properties/${savedPropertyId}/sync-to-pf`));
                    toast.success('Successfully synced to Property Finder!');
                } catch (syncError: any) {
                    console.error('Manual PF Sync Failed', syncError);
                    // Extract the actual error message from PF API response
                    const errorData = syncError?.response?.data;
                    let errorMessage = 'Property Saved, but failed to sync to Property Finder.';
                    if (errorData) {
                        // Try to extract meaningful error message
                        if (typeof errorData === 'string') {
                            errorMessage = errorData;
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (errorData.errors && Array.isArray(errorData.errors)) {
                            errorMessage = errorData.errors.map((e: any) => e.message || e.field || JSON.stringify(e)).join(', ');
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                        } else {
                            errorMessage = JSON.stringify(errorData);
                        }
                    }
                    console.error('PF Error Details:', errorData);
                    toast.error(`PF Sync Failed: ${errorMessage}`);
                }
            }

            // Reset action
            (window as any)._submitAction = null;

        } catch (error) {
            console.error('Failed to create/update property:', error);
            // toast.error('Failed to create property. Please try again.'); // Mutation hook might handle this, or keep it.
            // Duplicate toast if mutation has it. Keeping safe.
            toast.error('Failed to save property.');
            throw error; // Re-throw to be caught by handleFormSubmit
        }
    };

    const handleFormSubmit = async (data: PropertyFormValues) => {
        console.log('✅ Form validation passed! Submitting with data:', data);
        const action = (window as any)._submitAction;
        if (action === 'draft') {
            setSubmitMessage('Saving Draft...');
        } else if (action === 'publish') {
            setSubmitMessage(isEditing ? 'Updating to PF...' : 'Publishing to PF...');
        } else {
            setSubmitMessage('Processing...');
        }
        setIsSubmitting(true);
        try {
            cancelClickedRef.current = true; // Prevent auto-save
            hasUnsavedChangesRef.current = false;
            await _submitPropertyData(data);
        } catch (error) {
            console.error('Submission error:', error);
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        const currentIndex = TABS.findIndex(t => t.id === activeTab);
        if (currentIndex < TABS.length - 1) {
            setActiveTab(TABS[currentIndex + 1].id);
        } else {
            handleSubmit(handleFormSubmit)();
        }
    };

    // Save as Draft - bypasses form validation
    const handleSaveAsDraft = async () => {
        const data = getValues();
        setSubmitMessage('Saving Draft...');
        setIsSubmitting(true);
        try {
            cancelClickedRef.current = true;
            hasUnsavedChangesRef.current = false;

            // Prepare data for submission
            const propertyData: CreatePropertyData = {
                ...data,
                category,
                purpose,
                nocDocument: nocFile || undefined,
                passportCopy: passportFile || undefined,
                emiratesIdScan: emiratesIdFile || undefined,
                titleDeed: titleDeedFile || undefined,
                isActive: false, // Draft is always inactive
            };

            // Handle coverPhoto
            if (data.coverPhoto && (data.coverPhoto as FileList)[0] instanceof File) {
                propertyData.coverPhoto = (data.coverPhoto as FileList)[0];
            } else if (data.coverPhoto instanceof File) {
                propertyData.coverPhoto = data.coverPhoto;
            }

            // Handle mediaImages
            if (Array.isArray(data.mediaImages)) {
                propertyData.mediaImages = data.mediaImages;
            }

            const payload = draftId ? { ...propertyData, id: draftId } : propertyData;
            await saveDraft(payload, isEditing ? initialData.id : undefined);
            toast.success('Draft saved successfully!');
            router.push('/properties/saved-drafts');
        } catch (error) {
            console.error('Draft save error:', error);
            toast.error('Failed to save draft.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col items-center font-[var(--font-outfit)]">
            <div className="w-fit flex flex-col gap-8">
                {/* Tabs Navigation */}
                <div className="bg-[#F7F7F74F] rounded-[15px] border border-[#EDF1F7] p-[7px] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex items-center gap-2 min-w-max">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button" // Important for buttons inside a form that shouldn't submit
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-6 h-[60px] rounded-[10px] font-semibold text-[15px] transition-all whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-[#E9F8FF] text-[#00AAFF]"
                                        : "bg-transparent text-gray-500 hover:text-gray-900"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl w-[90%] mx-auto">
                    {activeTab === 'client' && (
                        <ClientDetailsTab
                            register={register}
                            control={control}
                            errors={errors}
                            nocFile={nocFile}
                            onNocFileChange={setNocFile}
                            passportFile={passportFile}
                            onPassportFileChange={setPassportFile}
                            emiratesIdFile={emiratesIdFile}
                            onEmiratesIdFileChange={setEmiratesIdFile}
                            titleDeedFile={titleDeedFile}
                            onTitleDeedFileChange={setTitleDeedFile}
                            setValue={setValue}
                            watch={watch}
                        />
                    )}
                    {activeTab === 'specific' && (
                        <SpecificDetailsTab
                            register={register}
                            control={control}
                            errors={errors}
                            watch={watch}
                            purpose={purpose}
                        />
                    )}
                    {activeTab === 'locations' && (
                        <LocationsTab
                            register={register}
                            control={control}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            propertyId={initialData?.id}
                        />
                    )}
                    {activeTab === 'price' && (
                        <PriceTab
                            register={register}
                            control={control}
                            errors={errors}
                            watch={watch}
                            purpose={purpose}
                        />
                    )}
                    {activeTab === 'dld' && (
                        <DldTab
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                        />
                    )}
                    {activeTab === 'general' && (
                        <GeneralDetailsTab
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                            purpose={purpose}
                            category={category}
                            control={control}
                        />
                    )}
                    {activeTab === 'media' && (
                        <MediaTab
                            register={register}
                            setValue={setValue}
                            watch={watch}
                        />
                    )}
                    {activeTab === 'additional' && (
                        <AdditionalTab
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                            category={category}
                        />
                    )}
                    {activeTab === 'agent' && (
                        <AgentTab
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 w-[98%] mx-auto">
                    <Button
                        type="button" // Important for buttons inside a form that shouldn't submit
                        variant="ghost"
                        onClick={onBack}
                        className="px-8 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-xl h-auto"
                    >
                        Cancel
                    </Button>
                    <div className="flex gap-3">
                        {activeTab === 'agent' && (
                            <>
                                <Button
                                    type="button"
                                    onClick={handleSaveAsDraft}
                                    disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending || isSubmitting}
                                    variant="outline"
                                    className="px-8 py-3 border border-[#E0F2FE] text-[#0BA5EC] hover:bg-[#E0F2FE] hover:text-[#0BA5EC] rounded-xl font-medium transition-colors h-auto disabled:opacity-50"
                                >
                                    {(createPropertyMutation.isPending || updatePropertyMutation.isPending || isSubmitting) ? 'Saving Draft...' : 'Save as Draft'}
                                </Button>
                                <Button
                                    type="submit"
                                    onClick={() => {
                                        setValue('isActive', true, { shouldDirty: true });
                                        // We set pfPublished to true to indicate intent, but strictly we handle the API call manually now
                                        setValue('pfPublished', true, { shouldDirty: true });
                                        // We'll use a flag or reference to know we need to trigger sync after save
                                        // Since handleFormSubmit is async, we can't easily pass arguments from here to it via handleSubmit
                                        // But we can use a ref.
                                        (window as any)._submitAction = 'publish';
                                    }}
                                    disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending || isSubmitting}
                                    className="px-10 py-3 bg-[#00AAFF] text-white hover:bg-[#0090dd] rounded-xl font-medium transition-colors flex items-center gap-2 h-auto disabled:opacity-50"
                                >
                                    {(createPropertyMutation.isPending || updatePropertyMutation.isPending || isSubmitting) ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update to PF' : 'Publish to PF')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </Button>
                            </>
                        )}
                        {activeTab !== 'agent' && (
                            <Button
                                type="button" // Important for buttons inside a form that shouldn't submit
                                onClick={handleNext}
                                disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending || isSubmitting}
                                className="px-10 py-3 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] rounded-xl font-medium transition-colors flex items-center gap-2 h-auto disabled:opacity-50"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <SubmissionOverlay isOpen={isSubmitting} message={submitMessage} />
        </form>
    );
}
