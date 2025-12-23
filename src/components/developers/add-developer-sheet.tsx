'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Loader2, Save, CloudUpload } from 'lucide-react';
import { useCreateDeveloper, useUpdateDeveloper } from '@/lib/hooks/use-developers';
import { Developer } from '@/lib/services/developer.service';
import { CountryCodeSelect } from '@/components/ui/country-code-select';
import { CountryCode } from 'libphonenumber-js';
import { getCountryCallingCode } from 'react-phone-number-input/input';

interface AddDeveloperSheetProps {
    isOpen: boolean;
    onClose: () => void;
    developer?: Developer | null;
}

export function AddDeveloperSheet({ isOpen, onClose, developer }: AddDeveloperSheetProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [salesManagerPreview, setSalesManagerPreview] = useState<string | null>(null);
    const [phoneCountry, setPhoneCountry] = useState<CountryCode>('AE');
    const [salesPhoneCountry, setSalesPhoneCountry] = useState<CountryCode>('AE');

    const { mutate: createDeveloper, isPending: isCreating } = useCreateDeveloper();
    const { mutate: updateDeveloper, isPending: isUpdating } = useUpdateDeveloper();

    const isPending = isCreating || isUpdating;

    const developerSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(5, 'Phone must be at least 5 characters'),
        about: z.string().optional(),
        salesManagerName: z.string().min(2, 'Name must be at least 2 characters'),
        salesManagerEmail: z.string().email('Invalid email address'),
        salesManagerPhone: z.string().min(5, 'Phone must be at least 5 characters'),
        nationality: z.string().optional(),
        languages: z.string().optional(),
    });

    type DeveloperFormValues = z.infer<typeof developerSchema>;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<DeveloperFormValues>({
        resolver: zodResolver(developerSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (developer) {
                reset({
                    name: developer.name,
                    email: developer.email,
                    phone: developer.phone.replace(/^\+\d+\s*/, ''),
                    about: developer.about || '',
                    salesManagerName: developer.salesManagerName,
                    salesManagerEmail: developer.salesManagerEmail,
                    salesManagerPhone: developer.salesManagerPhone.replace(/^\+\d+\s*/, ''),
                    nationality: developer.nationality || '',
                    languages: developer.languages?.join(', ') || '',
                });

                setLogoPreview(developer.logoUrl || null);
                setSalesManagerPreview(developer.salesManagerPhotoUrl || null);
            } else {
                reset({
                    name: '',
                    email: '',
                    phone: '',
                    about: '',
                    salesManagerName: '',
                    salesManagerEmail: '',
                    salesManagerPhone: '',
                    nationality: '',
                    languages: '',
                });
                setLogoPreview(null);
                setSalesManagerPreview(null);
                setPhoneCountry('AE');
                setSalesPhoneCountry('AE');
            }
        }
    }, [isOpen, developer, reset]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSalesManagerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSalesManagerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: DeveloperFormValues) => {
        const logoInput = document.getElementById('logo-upload') as HTMLInputElement;
        const salesManagerPhotoInput = document.getElementById('sales-manager-photo-upload') as HTMLInputElement;

        const logoFile = logoInput?.files?.[0];
        const salesManagerPhotoFile = salesManagerPhotoInput?.files?.[0];

        const onSuccess = () => {
            reset();
            setLogoPreview(null);
            setSalesManagerPreview(null);
            if (logoInput) logoInput.value = '';
            if (salesManagerPhotoInput) salesManagerPhotoInput.value = '';
            onClose();
        };

        // Combine code and phone
        const phonePrefix = `+${getCountryCallingCode(phoneCountry)}`;
        const salesPhonePrefix = `+${getCountryCallingCode(salesPhoneCountry)}`;

        const finalPhone = `${phonePrefix}${data.phone}`;
        const finalSalesPhone = `${salesPhonePrefix}${data.salesManagerPhone}`;

        const submissionData = {
            ...data,
            phone: finalPhone,
            salesManagerPhone: finalSalesPhone,
        };

        if (developer) {
            updateDeveloper({
                id: developer.id,
                data: {
                    ...submissionData,
                    logo: logoFile,
                    salesManagerPhoto: salesManagerPhotoFile,
                }
            }, { onSuccess });
        } else {
            createDeveloper({
                ...submissionData,
                logo: logoFile,
                salesManagerPhoto: salesManagerPhotoFile,
            }, { onSuccess });
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose} title={developer ? "Edit Developer" : "Developer Information"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Developer Information */}
                <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-500 hidden">Developer Information</h3>

                    <div className="flex gap-4">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Logo</Label>
                            <div className="relative">
                                <label
                                    htmlFor="logo-upload"
                                    className="cursor-pointer block"
                                >
                                    <div className="h-[50px] w-[80px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                                        ) : (
                                            <CloudUpload className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoUpload}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Developer Name */}
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Developer name</Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('name')}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                    </div>

                    {/* Developer Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Developer Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter developer email address"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Developer Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Developer Phone</Label>
                        <div className="flex gap-3">
                            <CountryCodeSelect
                                value={phoneCountry}
                                onChange={setPhoneCountry}
                            />
                            <Input
                                id="phone"
                                placeholder="XXXXXXXXXX"
                                className="h-[50px] bg-white border-gray-200 flex-1"
                                {...register('phone')}
                            />
                        </div>
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                    </div>

                    {/* About Developer */}
                    <div className="space-y-2">
                        <Label htmlFor="about" className="text-sm font-medium text-gray-700">About Developer</Label>
                        <textarea
                            id="about"
                            placeholder="Write about developer"
                            className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                            {...register('about')}
                        />
                        {errors.about && <p className="text-sm text-red-500">{errors.about.message}</p>}
                    </div>
                </div>

                <div className="h-[1px] w-full bg-gray-100" />

                {/* Sales Manager Information */}
                <div className="space-y-6">
                    <h3 className="text-base font-bold text-gray-400">Sales Manager Information</h3>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                                {salesManagerPreview ? (
                                    <img src={salesManagerPreview} alt="Sales Manager" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                        <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="sales-manager-photo-upload"
                                className="absolute bottom-0 right-0 cursor-pointer bg-gray-500 rounded-full p-1.5 border-2 border-white hover:bg-gray-600 transition-colors"
                            >
                                <Camera className="h-3 w-3 text-white" />
                                <input
                                    id="sales-manager-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleSalesManagerPhotoUpload}
                                />
                            </label>
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="salesManagerName" className="text-sm font-medium text-gray-700">Name</Label>
                            <Input
                                id="salesManagerName"
                                placeholder="Enter full name"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('salesManagerName')}
                            />
                            {errors.salesManagerName && <p className="text-sm text-red-500">{errors.salesManagerName.message}</p>}
                        </div>
                    </div>

                    {/* Sales Manager Email */}
                    <div className="space-y-2">
                        <Label htmlFor="salesManagerEmail" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            id="salesManagerEmail"
                            type="email"
                            placeholder="Enter developer email address"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('salesManagerEmail')}
                        />
                        {errors.salesManagerEmail && <p className="text-sm text-red-500">{errors.salesManagerEmail.message}</p>}
                    </div>

                    {/* Sales Manager Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="salesManagerPhone" className="text-sm font-medium text-gray-700">Phone</Label>
                        <div className="flex gap-3">
                            <CountryCodeSelect
                                value={salesPhoneCountry}
                                onChange={setSalesPhoneCountry}
                            />
                            <Input
                                id="salesManagerPhone"
                                placeholder="XXXXXXXXXX"
                                className="h-[50px] bg-white border-gray-200 flex-1"
                                {...register('salesManagerPhone')}
                            />
                        </div>
                        {errors.salesManagerPhone && <p className="text-sm text-red-500">{errors.salesManagerPhone.message}</p>}
                    </div>

                    {/* Nationality and Languages */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</Label>
                            <Input
                                id="nationality"
                                placeholder="e.g. Bangladeshi"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('nationality')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="languages" className="text-sm font-medium text-gray-700">Language</Label>
                            <Input
                                id="languages"
                                placeholder="Separate with comma"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('languages')}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-center">
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] h-12 px-8 text-base font-medium rounded-lg w-auto min-w-[200px]"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-5 w-5" />
                        )}
                        {developer ? 'Update Developer' : 'Create new developer'}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
