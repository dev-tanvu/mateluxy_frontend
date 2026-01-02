'use client';

import React, { useState } from 'react';
import { Property } from '@/services/property.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Loader2, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTenancyContract, CreateTenancyContractData } from '@/services/tenancy.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CountryCodeSelect } from '@/components/ui/country-code-select';
import { CountryCode } from 'libphonenumber-js';

const STEPS = [
    { id: 1, title: 'Owner / Lessor Details', description: 'Enter the lessor and owner details' },
    { id: 2, title: 'Tenant Details', description: 'Enter the required property details' },
    { id: 3, title: 'Property Details', description: 'Enter the terms and conditions' },
    { id: 4, title: 'Contract Details', description: 'Enter the terms and conditions' },
    { id: 5, title: 'Additional Terms', description: 'Enter the terms and conditions' },
];

import { OffPlanProperty } from '@/lib/services/off-plan-property.service';

interface TenancyWizardProps {
    property: Property | OffPlanProperty;
    onBack: () => void;
}

// Helper to check if property is OffPlan (naive check or use discriminant if available)
function isOffPlan(p: any): p is OffPlanProperty {
    return 'projectTitle' in p;
}

export function TenancyWizard({ property, onBack }: TenancyWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Phone country codes state
    const [landlordPhoneCountry, setLandlordPhoneCountry] = useState<CountryCode>('AE');
    const [tenantPhoneCountry, setTenantPhoneCountry] = useState<CountryCode>('AE');

    // Derive property usage from purpose field
    const getPropertyUsage = () => {
        if (isOffPlan(property)) {
            return 'For sale'; // Off-plan properties are typically for sale
        }
        const purpose = (property as Property).purpose?.toLowerCase();
        console.log('Property purpose:', purpose);
        if (purpose === 'rent') return 'For rent';
        if (purpose === 'sell' || purpose === 'buy') return 'For sale';
        return purpose || ''; // Return the purpose as-is if not matching
    };

    // Debug log to see what property data we have
    console.log('TenancyWizard - Property data:', {
        id: property.id,
        isOffPlan: isOffPlan(property),
        purpose: !isOffPlan(property) ? (property as Property).purpose : 'N/A (off-plan)',
        propertyTitle: !isOffPlan(property) ? (property as Property).propertyTitle : (property as OffPlanProperty).projectTitle,
        address: property.address,
        area: property.area,
        plotArea: (property as any).plotArea,
        propertyType: !isOffPlan(property) ? (property as Property).propertyType : (property as OffPlanProperty).propertyType,
        unitNumber: !isOffPlan(property) ? (property as Property).unitNumber : 'N/A',
        price: !isOffPlan(property) ? (property as Property).price : (property as OffPlanProperty).startingPrice,
        clientName: !isOffPlan(property) ? (property as Property).clientName : 'N/A',
    });

    const [formData, setFormData] = useState<Partial<CreateTenancyContractData>>({
        propertyId: property.id,
        // Prefill Owner/Landlord details from property
        ownerName: isOffPlan(property) ? property.developer?.name : (property as Property).clientName,
        ownerPhone: isOffPlan(property) ? property.developer?.salesManagerPhone : (property as Property).phoneNumber,
        ownerEmail: undefined, // Add if available in future
        landlordName: isOffPlan(property) ? property.developer?.name : (property as Property).clientName,
        landlordPhone: isOffPlan(property) ? property.developer?.salesManagerPhone : (property as Property).phoneNumber,
        landlordEmail: undefined,

        // Prefill Property Details from selected property
        propertyUsage: getPropertyUsage(),
        buildingName: isOffPlan(property) ? (property as OffPlanProperty).projectTitle : (property as Property).propertyTitle,
        location: property.address,
        propertySize: property.area,
        propertyType: isOffPlan(property)
            ? ((property as OffPlanProperty).propertyType?.[0] || '')
            : ((property as Property).propertyType || ''),
        propertyNumber: undefined, // Left empty for user to fill
        plotNumber: isOffPlan(property) ? undefined : (property as Property).unitNumber, // Unit number goes to plot no.
        premisesNumber: undefined, // User needs to fill this

        // Contract details can be prefilled with price if available
        annualRent: isOffPlan(property)
            ? (property as OffPlanProperty).startingPrice
            : (property as Property).price,

        additionalTerms: ['', ''],
    });

    const handleNext = () => {
        if (step < 5) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createTenancyContract(formData as CreateTenancyContractData);
            toast.success('Tenancy Contract created successfully!');
            router.push('/file-manager'); // Go to file manager or dashboard
        } catch (error) {
            console.error(error);
            toast.error('Failed to create contract');
        } finally {
            setLoading(false);
        }
    };

    const updateForm = (key: keyof CreateTenancyContractData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        {/* Custom Header from design */}
                        <div className="text-center space-y-2 mb-6">
                            <h3 className="text-[20px] font-bold text-[#1A1A1A]">Tenancy Contract</h3>
                            <p className="text-[14px] text-[#8F9BB3] max-w-[500px] mx-auto leading-relaxed">
                                To ensure accuracy in the rental contract, use only official documents to fill in the required information.
                            </p>
                        </div>

                        {/* Date and Contract Number Row */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <DatePicker
                                    date={formData.contractDate ? new Date(formData.contractDate) : undefined}
                                    setDate={(date) => updateForm('contractDate', date?.toISOString())}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Input
                                    value={formData.contractNo || ''}
                                    onChange={(e) => updateForm('contractNo', e.target.value)}
                                    placeholder="No."
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Owner and Landlord Name Row */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Owner Name</Label>
                                <Input
                                    value={formData.ownerName || ''}
                                    onChange={(e) => updateForm('ownerName', e.target.value)}
                                    placeholder="e.g. Abdullah Mahi"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Landlord Name</Label>
                                <Input
                                    value={formData.landlordName || ''}
                                    onChange={(e) => updateForm('landlordName', e.target.value)}
                                    placeholder="e.g. Abdullah Mahi"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Landlord Email and Phone Row */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Landlord Email</Label>
                                <Input
                                    value={formData.landlordEmail || ''}
                                    onChange={(e) => updateForm('landlordEmail', e.target.value)}
                                    placeholder="e.g. example@email.com"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Landlord Phone</Label>
                                <div className="flex gap-3">
                                    <CountryCodeSelect
                                        value={landlordPhoneCountry}
                                        onChange={setLandlordPhoneCountry}
                                    />
                                    <Input
                                        value={formData.landlordPhone || ''}
                                        onChange={(e) => updateForm('landlordPhone', e.target.value)}
                                        placeholder="XXXXXXXXX"
                                        className="flex-1 h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        {/* Tenant Name - Full Width */}
                        <div className="space-y-2.5">
                            <Label className="text-[15px] font-medium text-gray-700">Tenant Name</Label>
                            <Input
                                value={formData.tenantName || ''}
                                onChange={(e) => updateForm('tenantName', e.target.value)}
                                placeholder="e.g. Abdullah Mahi"
                                className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            />
                        </div>

                        {/* Tenant Email and Phone Row */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Tenant Email</Label>
                                <Input
                                    value={formData.tenantEmail || ''}
                                    onChange={(e) => updateForm('tenantEmail', e.target.value)}
                                    placeholder="e.g. example@email.com"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Tenant Phone</Label>
                                <div className="flex gap-3">
                                    <CountryCodeSelect
                                        value={tenantPhoneCountry}
                                        onChange={setTenantPhoneCountry}
                                    />
                                    <Input
                                        value={formData.tenantPhone || ''}
                                        onChange={(e) => updateForm('tenantPhone', e.target.value)}
                                        placeholder="XXXXXXXXX"
                                        className="flex-1 h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        {/* Row 1: Property Usage and Building Name */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Property usage</Label>
                                <Input
                                    value={formData.propertyUsage || ''}
                                    onChange={(e) => updateForm('propertyUsage', e.target.value)}
                                    placeholder="e.g. For rent"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Building name</Label>
                                <Input
                                    value={formData.buildingName || ''}
                                    onChange={(e) => updateForm('buildingName', e.target.value)}
                                    placeholder="e.g. Kashem Mallik"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Row 2: Location and Property Size */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF3D71]" />
                                    <Input
                                        value={formData.location || ''}
                                        onChange={(e) => updateForm('location', e.target.value)}
                                        placeholder="e.g. Dhaka, Bangladesh"
                                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg pl-12 focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Property size (Square Feet)</Label>
                                <Input
                                    type="number"
                                    value={formData.propertySize || ''}
                                    onChange={(e) => updateForm('propertySize', parseFloat(e.target.value))}
                                    placeholder="e.g. 1240"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Row 3: Property Type and Property No */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Property type</Label>
                                <div className="relative">
                                    <select
                                        value={formData.propertyType || ''}
                                        onChange={(e) => updateForm('propertyType', e.target.value)}
                                        className={cn(
                                            "flex h-[50px] w-full appearance-none rounded-lg border bg-white px-4 py-2 text-[15px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 border-[#EDF1F7]",
                                            !formData.propertyType && "text-[#8F9BB3]"
                                        )}
                                    >
                                        <option value="">Select property type</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Townhouse">Townhouse</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Office">Office</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Warehouse">Warehouse</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Property no.</Label>
                                <Input
                                    value={formData.propertyNumber || ''}
                                    onChange={(e) => updateForm('propertyNumber', e.target.value)}
                                    placeholder=""
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Row 4: Plot No and Premises No */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Plot no.</Label>
                                <Input
                                    value={formData.plotNumber || ''}
                                    onChange={(e) => updateForm('plotNumber', e.target.value)}
                                    placeholder="e.g. 2D"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Permises no.</Label>
                                <Input
                                    value={formData.premisesNumber || ''}
                                    onChange={(e) => updateForm('premisesNumber', e.target.value)}
                                    placeholder="Enter 9-digit permise number"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        {/* Row 1: Contract Period From and To */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Contract period from</Label>
                                <DatePicker
                                    date={formData.contractStartDate ? new Date(formData.contractStartDate) : undefined}
                                    setDate={(date) => updateForm('contractStartDate', date?.toISOString())}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Contract period to</Label>
                                <DatePicker
                                    date={formData.contractEndDate ? new Date(formData.contractEndDate) : undefined}
                                    setDate={(date) => updateForm('contractEndDate', date?.toISOString())}
                                />
                            </div>
                        </div>

                        {/* Row 2: Annual Rent and Contract Value */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Annual rent (AED)</Label>
                                <Input
                                    type="number"
                                    value={formData.annualRent || ''}
                                    onChange={(e) => updateForm('annualRent', parseFloat(e.target.value))}
                                    placeholder="e.g. 50,000"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Contract value (AED)</Label>
                                <Input
                                    type="number"
                                    value={formData.contractValue || ''}
                                    onChange={(e) => updateForm('contractValue', parseFloat(e.target.value))}
                                    placeholder="e.g. 50,000"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>

                        {/* Row 3: Security Deposit and Mode of Payment */}
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Security deposit amount (AED)</Label>
                                <Input
                                    type="number"
                                    value={formData.securityDeposit || ''}
                                    onChange={(e) => updateForm('securityDeposit', parseFloat(e.target.value))}
                                    placeholder="e.g. 10,000"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[15px] font-medium text-gray-700">Mode of payment</Label>
                                <Input
                                    value={formData.modeOfPayment || ''}
                                    onChange={(e) => updateForm('modeOfPayment', e.target.value)}
                                    placeholder="e.g. Cheques"
                                    className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-[15px] font-medium text-gray-700">Additional Terms</Label>
                            <Button
                                variant="ghost"
                                className="text-[#00AAFF] hover:text-[#0088CC] hover:bg-transparent font-medium text-[14px] flex items-center gap-1 p-0"
                                onClick={() => updateForm('additionalTerms', [...(formData.additionalTerms || []), ''])}
                            >
                                <Plus className="h-4 w-4 stroke-[2px]" /> Add another
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {(formData.additionalTerms && formData.additionalTerms.length > 0 ? formData.additionalTerms : ['', '']).map((term, index) => (
                                <div key={index} className="relative">
                                    <div className="h-[50px] bg-white border border-[#EDF1F7] rounded-lg flex items-center px-4 w-full">
                                        <span className="text-[#8F9BB3] font-medium text-[15px] mr-3">{index + 1}.</span>
                                        <Input
                                            value={term}
                                            onChange={(e) => {
                                                const newTerms = [...(formData.additionalTerms || [])];
                                                newTerms[index] = e.target.value;
                                                updateForm('additionalTerms', newTerms);
                                            }}
                                            placeholder={index === 0 ? "Enter any additional terms" : ""}
                                            className="border-0 shadow-none focus-visible:ring-0 p-0 h-full text-[15px] placeholder:text-[#8F9BB3]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar Stepper */}
            <div className="w-[360px] bg-white border-r border-gray-100 p-10 flex flex-col hidden lg:flex">
                <h2 className="text-[24px] font-bold mb-12 text-[#1A1A1A] tracking-tight">
                    Create Tenancy Contract
                </h2>

                <div className="space-y-0 relative">
                    {STEPS.map((s, i) => {
                        const isCompleted = step > s.id;
                        const isCurrent = step === s.id;
                        const isLast = i === STEPS.length - 1;

                        return (
                            <div key={s.id} className="relative flex flex-col">
                                <div className={cn("flex items-start gap-4 z-10", !isLast && "pb-10")}>
                                    <div className={cn(
                                        "w-[40px] h-[40px] rounded-xl flex items-center justify-center text-[15px] font-bold transition-all duration-300",
                                        isCompleted ? "bg-[#22C55E] text-white" :
                                            isCurrent ? "bg-[#00AAFF] text-white shadow-lg shadow-[#00AAFF]/25" :
                                                "bg-[#F7F9FC] text-[#8F9BB3]"
                                    )}>
                                        {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : s.id}
                                    </div>
                                    <div className="flex flex-col pt-1">
                                        <span className={cn(
                                            "text-[16px] font-bold transition-colors duration-300",
                                            isCurrent ? "text-[#1A1A1A]" : "text-[#8F9BB3]"
                                        )}>
                                            {s.title}
                                        </span>
                                        <span className={cn(
                                            "text-[13px] mt-1 transition-colors duration-300",
                                            isCurrent ? "text-[#8F9BB3]" : "text-[#C5CEE0]"
                                        )}>
                                            {s.description}
                                        </span>
                                    </div>
                                </div>
                                {!isLast && (
                                    <div
                                        className={cn(
                                            "absolute left-[19px] top-[40px] w-[2px] h-[40px] -z-0",
                                            isCompleted ? "bg-[#00AAFF]" : "bg-[#F1F5F9]"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#F7F9FC] p-12 lg:p-16 flex justify-center overflow-y-auto">
                <div className="w-full max-w-[700px] flex flex-col">
                    {step === 1 && property && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                            <span>Selected:</span>
                            <span className="font-medium text-gray-900">
                                {isOffPlan(property) ? property.projectTitle : property.propertyTitle}
                            </span>
                            <Button variant="link" size="sm" onClick={onBack} className="h-auto p-0 text-blue-500">Change</Button>
                        </div>
                    )}

                    <Card className="p-8 border-0 shadow-[0_8px_32px_rgba(226,232,240,0.6)] rounded-[24px] bg-white">
                        {renderStepContent()}
                    </Card>

                    <div className="flex items-center justify-between mt-8 px-2">
                        <Button
                            onClick={step === 1 ? onBack : () => setStep(step - 1)}
                            className="bg-white border border-[#EDF1F7] hover:bg-[#F7F9FC] text-[#8F9BB3] px-8 h-[50px] rounded-xl gap-2 font-medium text-[15px] transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={loading}
                            className="bg-[#E0F7FA] hover:bg-[#00AAFF] text-[#00AAFF] hover:text-white px-8 h-[50px] rounded-xl font-medium text-[15px] transition-all duration-300 gap-2 min-w-[120px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {step === 5 ? 'Create Contract' : 'Next'} <ChevronRight className="w-4 h-4 stroke-[2px]" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DatePicker({ date, setDate }: { date?: Date; setDate: (date?: Date) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-between text-left font-normal bg-white border-[#EDF1F7] h-[50px] rounded-lg text-[15px] px-4",
                        !date && "text-[#8F9BB3]"
                    )}
                >
                    {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
                    <CalendarIcon className="h-5 w-5 text-[#8F9BB3]" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
