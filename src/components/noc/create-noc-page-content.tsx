'use client';

import React, { useState, useRef } from 'react';
import { Check, Upload, Plus, Download, Printer, Eye, X, FileText, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CountryCodeSelect } from '@/components/ui/country-code-select';
import { toast } from 'sonner';
import { CountryCode } from 'libphonenumber-js';
import { API_URL } from '@/lib/api-config';
import { AddressAutocomplete } from '@/components/off-plan-properties/maps/address-autocomplete';

interface Owner {
    name: string;
    emiratesId: string;
    issueDate: string;
    expiryDate: string;
    countryCode: CountryCode;
    phone: string;
    signature: File | null;
    signatureDate: string;
}

interface NocFormData {
    // Step 1: Owner Details (Unlimited owners)
    owners: Owner[];
    // Step 2: Property Details
    propertyType: string;
    buildingProjectName: string;
    community: string;
    streetName: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    buildUpArea: string;
    plotArea: string;
    bedrooms: string;
    bathrooms: string;
    rentalAmount: string;
    saleAmount: string;
    parking: string;
    propertyNumber: string;
    // Step 3: Terms and Conditions
    agreementType: 'exclusive' | 'non-exclusive';
    periodMonths: number;
    agreementDate: string;
}

// This will be passed to the property form
export interface NocData {
    id: string;
    pdfUrl: string;
    // Owner info for client details
    clientName: string;
    clientPhone: string;
    clientCountryCode: string;
    // Property details for auto-fill
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
    propertyType: string;
    buildingProjectName: string;
    community: string;
    streetName: string;
    buildUpArea: string;
    plotArea: string;
    bedrooms: string;
    bathrooms: string;
    rentalAmount: string;
    saleAmount: string;
    parking: string;
    propertyNumber: string;
}

interface CreateNocPageContentProps {
    onNocCreated: (nocData: NocData) => void;
    onBack: () => void;
}

const PROPERTY_TYPES = [
    'Apartment',
    'Villa',
    'Townhouse',
    'Penthouse',
    'Studio',
    'Duplex',
    'Commercial',
    'Office',
    'Warehouse',
    'Land',
];

const initialFormData: NocFormData = {
    owners: [{ name: '', emiratesId: '', issueDate: '', expiryDate: '', countryCode: 'AE' as CountryCode, phone: '', signature: null, signatureDate: '' }],
    propertyType: '',
    buildingProjectName: '',
    community: '',
    streetName: '',
    location: '',
    latitude: null,
    longitude: null,
    buildUpArea: '',
    plotArea: '',
    bedrooms: '',
    bathrooms: '',
    rentalAmount: '',
    saleAmount: '',
    parking: '',
    propertyNumber: '',
    agreementType: 'exclusive',
    periodMonths: 1,
    agreementDate: '',
};

export function CreateNocPageContent({ onNocCreated, onBack }: CreateNocPageContentProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<NocFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdNoc, setCreatedNoc] = useState<{ id: string; pdfUrl: string } | null>(null);

    // Helper for ordinals
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const steps = [
        { number: 1, title: 'Landlord / Owner Details', subtitle: 'Enter the landlord and owner details' },
        { number: 2, title: 'Property Details', subtitle: 'Tell us who you are to get started.' },
        { number: 3, title: 'Terms and Conditions', subtitle: 'Enter the terms and conditions' },
    ];

    const handleOwnerChange = (index: number, field: keyof Owner, value: string) => {
        const newOwners = [...formData.owners];
        newOwners[index] = { ...newOwners[index], [field]: value };
        setFormData({ ...formData, owners: newOwners });
    };

    const addOwner = () => {
        setFormData({
            ...formData,
            owners: [...formData.owners, { name: '', emiratesId: '', issueDate: '', expiryDate: '', countryCode: 'AE' as CountryCode, phone: '', signature: null, signatureDate: '' }],
        });
    };

    const removeOwner = (index: number) => {
        if (formData.owners.length > 1) {
            const newOwners = formData.owners.filter((_, i) => i !== index);
            setFormData({ ...formData, owners: newOwners });
        }
    };

    const handleInputChange = (field: keyof NocFormData, value: any) => {
        setFormData({ ...formData, [field]: value });
    };


    const handleSignatureDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const newOwners = [...formData.owners];
            newOwners[index] = { ...newOwners[index], signature: e.dataTransfer.files[0] };
            setFormData({ ...formData, owners: newOwners });
        }
    };

    const handleSignatureSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const newOwners = [...formData.owners];
            newOwners[index] = { ...newOwners[index], signature: e.target.files[0] };
            setFormData({ ...formData, owners: newOwners });
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (createdNoc) {
            // If on success page, go back to terms step
            setCreatedNoc(null);
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            onBack();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const backendUrl = API_URL;

            const formDataToSend = new FormData();

            // Prepare owners array for JSON string (exclude File objects)
            const ownersForJson = formData.owners.map(owner => ({
                name: owner.name,
                emiratesId: owner.emiratesId,
                issueDate: owner.issueDate,
                expiryDate: owner.expiryDate,
                countryCode: owner.countryCode,
                phone: owner.phone,
                signatureDate: owner.signatureDate,
                // Do not include signature file here
            }));

            formDataToSend.append('owners', JSON.stringify(ownersForJson));

            // Append Signature Files separately
            formData.owners.forEach((owner, index) => {
                if (owner.signature) {
                    formDataToSend.append(`signatures_${index}`, owner.signature);
                }
            });

            // Property Details
            formDataToSend.append('propertyType', formData.propertyType);
            formDataToSend.append('buildingProjectName', formData.buildingProjectName);
            formDataToSend.append('community', formData.community);
            formDataToSend.append('streetName', formData.streetName);
            formDataToSend.append('propertyNumber', formData.propertyNumber);
            if (formData.location) formDataToSend.append('location', formData.location);
            if (formData.latitude) formDataToSend.append('latitude', formData.latitude.toString());
            if (formData.longitude) formDataToSend.append('longitude', formData.longitude.toString());

            // Client Phone (Required unique) checks
            const clientPhone = formData.owners[0]?.phone;
            // The backend checks for uniqueness on create.
            // We pass it in the DTO as 'clientPhone' for the top level check if we want, 
            // OR the backend extracts it from owners. 
            // Looking at NocService edit, I added `clientPhone` to CreateNocDto top level.
            // So we must append it.
            if (clientPhone) {
                formDataToSend.append('clientPhone', clientPhone);
            }

            if (formData.buildUpArea) formDataToSend.append('buildUpArea', formData.buildUpArea);
            if (formData.plotArea) formDataToSend.append('plotArea', formData.plotArea);
            if (formData.bedrooms) formDataToSend.append('bedrooms', formData.bedrooms);
            if (formData.bathrooms) formDataToSend.append('bathrooms', formData.bathrooms);
            if (formData.rentalAmount) formDataToSend.append('rentalAmount', formData.rentalAmount);
            if (formData.saleAmount) formDataToSend.append('saleAmount', formData.saleAmount);
            if (formData.parking) formDataToSend.append('parking', formData.parking);

            // Terms
            formDataToSend.append('agreementType', formData.agreementType);
            formDataToSend.append('periodMonths', formData.periodMonths.toString());
            if (formData.agreementDate) formDataToSend.append('agreementDate', formData.agreementDate);

            const response = await fetch(`${backendUrl}/noc`, {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || (await response.text()) || 'Unknown error occurred';
                console.error('NOC Creation Failed Backend Response:', errorMessage);
                throw new Error(errorMessage);
            }

            const result = await response.json();
            toast.success('NOC created successfully!');
            setCreatedNoc({ id: result.id, pdfUrl: result.pdfUrl });
        } catch (error: any) {
            console.error('Error creating NOC:', error);
            toast.error(error.message || 'Failed to create NOC');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = () => {
        if (createdNoc?.pdfUrl) {
            window.open(createdNoc.pdfUrl, '_blank');
        }
    };

    const handlePrint = () => {
        if (createdNoc?.pdfUrl) {
            const printWindow = window.open(createdNoc.pdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        }
    };

    const handlePreview = () => {
        if (createdNoc?.pdfUrl) {
            window.open(createdNoc.pdfUrl, '_blank');
        }
    };

    const handleProceedToPropertyForm = () => {
        if (createdNoc) {
            const nocData: NocData = {
                id: createdNoc.id,
                pdfUrl: createdNoc.pdfUrl,
                clientName: formData.owners[0]?.name || '',
                clientPhone: formData.owners[0]?.phone || '',
                clientCountryCode: formData.owners[0]?.countryCode || 'AE',
                location: formData.location,
                latitude: formData.latitude,
                longitude: formData.longitude,
                propertyType: formData.propertyType,
                buildingProjectName: formData.buildingProjectName,
                community: formData.community,
                streetName: formData.streetName,
                propertyNumber: formData.propertyNumber,
                buildUpArea: formData.buildUpArea,
                plotArea: formData.plotArea,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                rentalAmount: formData.rentalAmount,
                saleAmount: formData.saleAmount,
                parking: formData.parking,
            };
            onNocCreated(nocData);
        }
    };

    // Success Page after NOC creation
    if (createdNoc) {
        return (
            <div className="flex h-full bg-[#F7F9FC]">
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-white rounded-3xl shadow-lg p-12 max-w-lg w-full text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">NOC Created Successfully!</h1>
                        <p className="text-gray-500 mb-8">Your NOC has been generated and saved. You can now download, print, or preview it.</p>

                        {/* PDF Preview Card */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900">NOC Document</p>
                                <p className="text-xs text-gray-500">PDF • Ready to download</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 mb-8">
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                            >
                                <Download className="w-5 h-5" />
                                Download
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors font-medium"
                            >
                                <Printer className="w-5 h-5" />
                                Print
                            </button>
                            <button
                                onClick={handlePreview}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                            >
                                <Eye className="w-5 h-5" />
                                View
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="px-6 h-11 rounded-lg"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={handleProceedToPropertyForm}
                                className="px-8 h-11 bg-[#00B7FF] hover:bg-[#0090dd] text-white rounded-lg"
                            >
                                Continue to Property Form →
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-[#F7F9FC]">
            {/* Left Panel - Stepper */}
            <div className="w-[320px] p-8 flex flex-col border-r border-gray-200 bg-white shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Create NOC</h1>

                <div className="flex flex-col gap-2">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                                        currentStep === step.number
                                            ? "bg-[#00B7FF] text-white"
                                            : currentStep > step.number
                                                ? "bg-green-500 text-white"
                                                : "bg-gray-100 text-gray-400"
                                    )}
                                >
                                    {currentStep > step.number ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-0.5 h-16 mt-2",
                                            currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                                        )}
                                    />
                                )}
                            </div>
                            <div className="pt-1">
                                <h3
                                    className={cn(
                                        "text-sm font-semibold",
                                        currentStep === step.number ? "text-gray-900" : "text-gray-500"
                                    )}
                                >
                                    {step.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Form Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* NOC Header - Only visible in Step 1 */}
                {currentStep === 1 && (
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Mateluxy Real Estate Broker L.L.C</h2>
                                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                                    <p>Tel: +971 4 572 5420</p>
                                    <p>Add: 601 Bay Square 13, Business Bay, Dubai, UAE.</p>
                                    <p>P.O. Box: 453467</p>
                                    <p>Email: info@mateluxy.com</p>
                                    <p>Website: www.mateluxy.com</p>
                                </div>
                            </div>
                            {/* Company Logo */}
                            <div className="w-32 aspect-video overflow-hidden flex items-center justify-center"><img src="/Logo.png" alt="Mateluxy Logo" className="w-full h-full object-contain" /></div>

                        </div>
                        <p className="text-sm font-semibold text-gray-700 mt-4">
                            NOC / LISTING AGREEMENT/ AGREEMENT BETWEEN OWNER & BROKER
                        </p>
                    </div>
                )}

                {/* Form Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Owner Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6 max-w-2xl">
                            {formData.owners.map((owner, index) => (
                                <div key={index} className="space-y-4 relative">
                                    {index > 0 && <hr className="my-4" />}

                                    {/* Remove button for 2nd and 3rd owners */}
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOwner(index)}
                                            className="absolute -top-2 right-0 flex items-center gap-1 text-red-500 text-sm font-medium hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove
                                        </button>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">
                                                {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'} Owner Name
                                            </Label>
                                            <Input
                                                placeholder="Enter owner name"
                                                value={owner.name}
                                                onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
                                                className="h-12 border-gray-200 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Emirates Id/Passport No.</Label>
                                            <Input
                                                placeholder="Enter ID/Passport"
                                                value={owner.emiratesId}
                                                onChange={(e) => handleOwnerChange(index, 'emiratesId', e.target.value)}
                                                className="h-12 border-gray-200 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Issue date</Label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={owner.issueDate}
                                                    onChange={(e) => handleOwnerChange(index, 'issueDate', e.target.value)}
                                                    className="h-12 border-gray-200 rounded-lg pr-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600">Expiry date</Label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={owner.expiryDate}
                                                    onChange={(e) => handleOwnerChange(index, 'expiryDate', e.target.value)}
                                                    className="h-12 border-gray-200 rounded-lg pr-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm text-gray-600">Phone Number</Label>
                                        <div className="flex gap-2">
                                            <CountryCodeSelect
                                                value={owner.countryCode}
                                                onChange={(value) => handleOwnerChange(index, 'countryCode', value)}
                                            />
                                            <Input
                                                placeholder="Phone Number"
                                                value={owner.phone}
                                                onChange={(e) => handleOwnerChange(index, 'phone', e.target.value)}
                                                className="flex-1 h-12 border-gray-200 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addOwner}
                                className="flex items-center gap-2 text-[#00B7FF] text-sm font-medium hover:underline"
                            >
                                <Plus className="w-4 h-4" />
                                Add another owner
                            </button>
                        </div>
                    )}

                    {/* Step 2: Property Details */}
                    {currentStep === 2 && (
                        <div className="space-y-4 max-w-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Property Type</Label>
                                    <select
                                        value={formData.propertyType}
                                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                        className="w-full h-12 px-3 border border-gray-200 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select property type</option>
                                        {PROPERTY_TYPES.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Building/Project Name</Label>
                                    <Input
                                        placeholder="e.g. Kashem Mallik"
                                        value={formData.buildingProjectName}
                                        onChange={(e) => handleInputChange('buildingProjectName', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Community</Label>
                                    <Input
                                        placeholder="e.g. Burj Khalifa"
                                        value={formData.community}
                                        onChange={(e) => handleInputChange('community', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Property Number</Label>
                                    <Input
                                        placeholder="e.g. 101"
                                        value={formData.propertyNumber}
                                        onChange={(e) => handleInputChange('propertyNumber', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Street Name</Label>
                                    <Input
                                        placeholder="e.g. Sheikh Zayed Road"
                                        value={formData.streetName}
                                        onChange={(e) => handleInputChange('streetName', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Google Map Location</Label>
                                    <AddressAutocomplete
                                        value={formData.location || ''}
                                        onChange={(address, lat, lng) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                location: address,
                                                latitude: lat,
                                                longitude: lng
                                            }));
                                        }}
                                    />
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Build Up Area (sq.ft)</Label>
                                    <Input
                                        placeholder="e.g. 1240"
                                        value={formData.buildUpArea}
                                        onChange={(e) => handleInputChange('buildUpArea', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Plot (sq.ft)</Label>
                                    <Input
                                        placeholder="e.g. 1245"
                                        value={formData.plotArea}
                                        onChange={(e) => handleInputChange('plotArea', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Bedrooms</Label>
                                    <Input
                                        placeholder="e.g. 03"
                                        value={formData.bedrooms}
                                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Bathrooms</Label>
                                    <Input
                                        placeholder="e.g. 3"
                                        value={formData.bathrooms}
                                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Rental Amount</Label>
                                    <Input
                                        placeholder="e.g. 30,000"
                                        value={formData.rentalAmount}
                                        onChange={(e) => handleInputChange('rentalAmount', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600">Sale Amount</Label>
                                    <Input
                                        placeholder="e.g. 12,000,000"
                                        value={formData.saleAmount}
                                        onChange={(e) => handleInputChange('saleAmount', e.target.value)}
                                        className="h-12 border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600">Parking</Label>
                                <Input
                                    placeholder="e.g. 234 sq.ft area available for parking"
                                    value={formData.parking}
                                    onChange={(e) => handleInputChange('parking', e.target.value)}
                                    className="h-12 border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Terms and Conditions */}
                    {currentStep === 3 && (
                        <div className="grid grid-cols-2 gap-8 max-w-4xl">
                            {/* Left Column - Terms */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Terms and Conditions</h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        The landlord/legal representative has agreed to appoint
                                    </p>

                                    {/* Agreement Type */}
                                    <div className="flex gap-6 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="agreementType"
                                                checked={formData.agreementType === 'exclusive'}
                                                onChange={() => handleInputChange('agreementType', 'exclusive')}
                                                className="w-4 h-4 text-red-500 accent-red-500"
                                            />
                                            <span className="text-sm text-gray-700">Exclusive</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="agreementType"
                                                checked={formData.agreementType === 'non-exclusive'}
                                                onChange={() => handleInputChange('agreementType', 'non-exclusive')}
                                                className="w-4 h-4 text-gray-400"
                                            />
                                            <span className="text-sm text-gray-700">Non-Exclusive</span>
                                        </label>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-4">
                                        Broker to list and advertise the above property for a period till
                                    </p>

                                    {/* Period Selection */}
                                    <div className="flex gap-4 mb-4">
                                        {[1, 2, 3, 6].map((month) => (
                                            <label key={month} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="period"
                                                    checked={formData.periodMonths === month}
                                                    onChange={() => handleInputChange('periodMonths', month)}
                                                    className="w-4 h-4 text-red-500 accent-red-500"
                                                />
                                                <span className="text-sm text-gray-700">{month} Month</span>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Agreement Date */}
                                    <div className="space-y-2 mb-4">
                                        <Input
                                            type="date"
                                            value={formData.agreementDate}
                                            onChange={(e) => handleInputChange('agreementDate', e.target.value)}
                                            className="h-10 border-gray-200 rounded-lg w-48"
                                        />
                                    </div>

                                    {/* Terms Text */}
                                    <div className="text-xs text-gray-500 space-y-3">
                                        <p>
                                            I, the undersigned confirm that I am the owner of the above
                                            property and / or have the legal authority to sign on behalf of
                                            the named owner(s).
                                        </p>
                                        <p>
                                            Should this property be subject to an offer I/we will notify the
                                            brokerage of this This
                                        </p>
                                        <p>
                                            Agreement may be terminated by either party at any time upon
                                            seven (7) days written notice to the other party
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Signatures */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-semibold text-gray-700">Signatures</h3>

                                {formData.owners.map((owner, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-gray-500">
                                                {index + 1}{getOrdinal(index + 1)} Owner Signature ({owner.name || 'Owner'})
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-gray-500">Date :</Label>
                                                <Input
                                                    type="date"
                                                    value={owner.signatureDate}
                                                    onChange={(e) => {
                                                        const newOwners = [...formData.owners];
                                                        newOwners[index].signatureDate = e.target.value;
                                                        setFormData({ ...formData, owners: newOwners });
                                                    }}
                                                    className="h-8 w-32 text-xs border-gray-200 rounded"
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors",
                                                owner.signature
                                                    ? "border-blue-300 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-400"
                                            )}
                                            onClick={() => document.getElementById(`signature-input-${index}`)?.click()}
                                            onDrop={(e) => handleSignatureDrop(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <input
                                                id={`signature-input-${index}`}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleSignatureSelect(e, index)}
                                            />
                                            {owner.signature ? (
                                                <div className="flex items-center gap-2 text-blue-600">
                                                    <Check className="w-5 h-5" />
                                                    <span className="text-sm font-medium truncate max-w-[200px]">{owner.signature.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newOwners = [...formData.owners];
                                                            newOwners[index].signature = null;
                                                            setFormData({ ...formData, owners: newOwners });
                                                        }}
                                                        className="ml-2 text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                                    <Upload className="w-6 h-6 mb-1" />
                                                    <span className="text-xs">Driver License / Passport / ID</span>
                                                    <span className="text-[10px] text-gray-300">Drag & drop or click to upload</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="px-6 h-11 rounded-lg border-gray-200"
                    >
                        ← Back
                    </Button>

                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="px-8 h-11 bg-[#00B7FF] hover:bg-[#0090dd] text-white rounded-lg"
                    >
                        {isSubmitting ? 'Creating...' : currentStep === 3 ? 'Create NOC' : 'Next →'}
                    </Button>
                </div>
            </div>
        </div >
    );
}
