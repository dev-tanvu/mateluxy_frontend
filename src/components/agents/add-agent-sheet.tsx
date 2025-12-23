'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { Sheet } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Loader2, Upload, CloudUpload } from 'lucide-react';
import { useCreateAgent, useUpdateAgent } from '@/lib/hooks/use-agents';
import { Agent } from '@/lib/services/agent.service';
import { CountryCodeSelect } from '@/components/ui/country-code-select';
import { CountryCode } from 'libphonenumber-js';
import { getCountryCallingCode } from 'react-phone-number-input/input';

interface AddAgentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    agent?: Agent | null;
}

export function AddAgentSheet({ isOpen, onClose, agent }: AddAgentSheetProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [phoneCountry, setPhoneCountry] = useState<CountryCode>('AE');
    const [whatsappCountry, setWhatsappCountry] = useState<CountryCode>('AE');
    const countryOptions = countryList().getData();

    const { mutate: createAgent, isPending: isCreating } = useCreateAgent();
    const { mutate: updateAgent, isPending: isUpdating } = useUpdateAgent();

    const isPending = isCreating || isUpdating;

    const agentSchema = z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email address'),
        password: agent ? z.string().optional() : z.string().min(6, 'Password must be at least 6 characters'),
        position: z.string().min(2, 'Position is required'),
        department: z.string().min(2, 'Department is required'),
        phone: z.string().min(5, 'Phone must be at least 5 characters'),
        phoneSecondary: z.string().optional(),
        whatsapp: z.string().optional(),
        address: z.string().optional(),
        nationality: z.string().optional(),
        linkedinAddress: z.string().optional(),
        experienceSince: z.string().optional(),
        languages: z.string().optional(),
        about: z.string().optional(),
        birthdate: z.string().optional(),
        joinedDate: z.string().optional(),
        visaExpiryDate: z.string().optional(),
        areasExpertIn: z.string().optional(),
    });

    type AgentFormValues = z.infer<typeof agentSchema>;

    // Language options for multi-select
    const languageOptions = [
        { value: 'English', label: 'English' },
        { value: 'Arabic', label: 'Arabic' },
        { value: 'French', label: 'French' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'German', label: 'German' },
        { value: 'Italian', label: 'Italian' },
        { value: 'Portuguese', label: 'Portuguese' },
        { value: 'Russian', label: 'Russian' },
        { value: 'Chinese', label: 'Chinese' },
        { value: 'Japanese', label: 'Japanese' },
        { value: 'Korean', label: 'Korean' },
        { value: 'Hindi', label: 'Hindi' },
        { value: 'Urdu', label: 'Urdu' },
        { value: 'Dutch', label: 'Dutch' },
    ];

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<AgentFormValues>({
        resolver: zodResolver(agentSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (agent) {
                // Extract country codes and strip them from phone numbers
                const extractCountryAndNumber = (phoneNumber: string): { country: CountryCode; number: string } => {
                    if (!phoneNumber) return { country: 'AE', number: '' };

                    // Map of country codes to their dial codes
                    const countryMap: Record<string, { code: CountryCode; dialCode: string }> = {
                        '+971': { code: 'AE', dialCode: '+971' },
                        '+1': { code: 'US', dialCode: '+1' },
                        '+44': { code: 'GB', dialCode: '+44' },
                        '+91': { code: 'IN', dialCode: '+91' },
                        '+880': { code: 'BD', dialCode: '+880' },
                        '+92': { code: 'PK', dialCode: '+92' },
                    };

                    // Find matching country code
                    for (const [dialCode, info] of Object.entries(countryMap)) {
                        if (phoneNumber.startsWith(dialCode)) {
                            // Remove the dial code and any following spaces
                            const number = phoneNumber.slice(dialCode.length).trim();
                            return { country: info.code, number };
                        }
                    }

                    // Default to AE if no match
                    return { country: 'AE', number: phoneNumber };
                };

                const phoneData = extractCountryAndNumber(agent.phone);
                const whatsappData = extractCountryAndNumber(agent.whatsapp || agent.phone);

                // Set country codes
                setPhoneCountry(phoneData.country);
                setWhatsappCountry(whatsappData.country);

                reset({
                    name: agent.name,
                    username: agent.username,
                    email: agent.email,
                    password: '',
                    position: agent.position,
                    department: agent.department,
                    phone: phoneData.number,
                    phoneSecondary: agent.phoneSecondary ? extractCountryAndNumber(agent.phoneSecondary).number : '',
                    whatsapp: whatsappData.number,
                    address: agent.address || '',
                    nationality: agent.nationality || '',
                    linkedinAddress: agent.linkedinAddress || '',
                    experienceSince: agent.experienceSince?.toString() || '',
                    languages: agent.languages?.join(', ') || '',
                    about: agent.about || '',
                    birthdate: agent.birthdate ? new Date(agent.birthdate).toISOString().split('T')[0] : '',
                    joinedDate: agent.joinedDate ? new Date(agent.joinedDate).toISOString().split('T')[0] : '',
                    visaExpiryDate: agent.visaExpiryDate ? new Date(agent.visaExpiryDate).toISOString().split('T')[0] : '',
                    areasExpertIn: agent.areasExpertIn?.join(', ') || '',
                });
                setPhotoPreview(agent.photoUrl || null);
            } else {
                reset({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    position: '',
                    department: '',
                    phone: '',
                    phoneSecondary: '',
                    whatsapp: '',
                    address: '',
                    nationality: '',
                    linkedinAddress: '',
                    experienceSince: '',
                    languages: '',
                    about: '',
                    birthdate: '',
                    joinedDate: '',
                    visaExpiryDate: '',
                    areasExpertIn: '',
                });
                setPhotoPreview(null);
                setPhoneCountry('AE');
                setWhatsappCountry('AE');
            }
        }
    }, [isOpen, agent, reset]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (data: AgentFormValues) => {
        const photoInput = document.getElementById('photo-upload') as HTMLInputElement;
        const vcardInput = document.getElementById('vcard-upload') as HTMLInputElement;

        const photoFile = photoInput?.files?.[0];
        const vcardFile = vcardInput?.files?.[0];
        const licenseInput = document.getElementById('license-upload') as HTMLInputElement;
        const licenseFile = licenseInput?.files?.[0];

        const onSuccess = () => {
            reset();
            setPhotoPreview(null);
            if (photoInput) photoInput.value = '';
            if (vcardInput) vcardInput.value = '';
            if (licenseInput) licenseInput.value = '';
            onClose();
        };

        // Combine code and phone
        const phonePrefix = `+${getCountryCallingCode(phoneCountry)}`;
        const whatsappPrefix = data.whatsapp ? `+${getCountryCallingCode(whatsappCountry)}` : '';

        const finalPhone = `${phonePrefix}${data.phone}`;
        const finalWhatsapp = data.whatsapp ? `${whatsappPrefix}${data.whatsapp}` : undefined;

        const submissionData = {
            ...data,
            phone: finalPhone,
            whatsapp: finalWhatsapp,
        };

        if (agent) {
            updateAgent({
                id: agent.id,
                data: {
                    ...submissionData,
                    photo: photoFile,
                    vcard: vcardFile,
                    licenseDocument: licenseFile,
                }
            }, { onSuccess });
        } else {
            createAgent({
                ...submissionData,
                photo: photoFile,
                vcard: vcardFile,
                licenseDocument: licenseFile,
            } as any, { onSuccess });
        }
    };

    return (
        <Sheet isOpen={isOpen} onClose={onClose} title={agent ? "Edit Agent" : "Account Information"}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                        <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-0 right-0 cursor-pointer bg-gray-500 rounded-full p-1.5 border-2 border-white hover:bg-gray-600 transition-colors"
                            >
                                <Camera className="h-3 w-3 text-white" />
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </label>
                        </div>

                        {/* Name Field */}
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter full name"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('name')}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter agent's username"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('username')}
                        />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>

                    {/* Agent Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Agent Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter agent's email address"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder={agent ? "Leave blank to keep current password" : "Password must be 6 character or longer"}
                            className="h-[50px] bg-white border-gray-200"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                </div>

                {/* About Agent */}
                <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-500">About Agent</h3>

                    {/* Position and Department */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position</Label>
                            <Input
                                id="position"
                                placeholder="e.g. Managing Director"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('position')}
                            />
                            {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                            <Input
                                id="department"
                                placeholder="e.g. Sales"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('department')}
                            />
                            {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
                        </div>
                    </div>

                    {/* Contact Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Contact Number</Label>
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

                    {/* Secondary Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneSecondary" className="text-sm font-medium text-gray-700">Secondary Contact Number</Label>
                        <Input
                            id="phoneSecondary"
                            placeholder="Enter secondary contact number"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('phoneSecondary')}
                        />
                    </div>

                    {/* Nationality and Language */}
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
                            <Label htmlFor="languages" className="text-sm font-medium text-gray-700">Languages</Label>
                            <Controller
                                name="languages"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        instanceId="languages-select"
                                        isMulti
                                        options={languageOptions}
                                        value={languageOptions.filter(option =>
                                            field.value?.split(',').map(l => l.trim()).includes(option.value)
                                        )}
                                        onChange={(selected) => {
                                            field.onChange(selected.map(s => s.value).join(', '));
                                        }}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select languages..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '50px',
                                                borderColor: '#e5e7eb',
                                                '&:hover': {
                                                    borderColor: '#d1d5db',
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                        </div>

                        {/* Nationality */}
                        <div className="space-y-2">
                            <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</Label>
                            <Controller
                                name="nationality"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={countryOptions}
                                        value={countryOptions.find(option => option.label === field.value)}
                                        onChange={(selected) => {
                                            field.onChange(selected?.label);
                                        }}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select nationality..."
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '50px',
                                                borderColor: '#e5e7eb',
                                                '&:hover': {
                                                    borderColor: '#d1d5db',
                                                },
                                            }),
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">WhatsApp</Label>
                        <div className="flex gap-3">
                            <CountryCodeSelect
                                value={whatsappCountry}
                                onChange={setWhatsappCountry}
                            />
                            <Input
                                id="whatsapp"
                                placeholder="XXXXXXXXXX"
                                className="h-[50px] bg-white border-gray-200 flex-1"
                                {...register('whatsapp')}
                            />
                        </div>
                    </div>

                    {/* Vcard and Address */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vcard" className="text-sm font-medium text-gray-700">Vcard</Label>
                            <label
                                htmlFor="vcard-upload"
                                className="flex items-center justify-center h-[50px] border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <CloudUpload className="h-5 w-5 text-gray-400" />
                                <input
                                    id="vcard-upload"
                                    type="file"
                                    accept=".vcf"
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                            <Input
                                id="address"
                                placeholder="Enter address"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('address')}
                            />
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-2">
                        <Label htmlFor="about" className="text-sm font-medium text-gray-700">About</Label>
                        <textarea
                            id="about"
                            placeholder="Write about agent"
                            className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                            {...register('about')}
                        />
                    </div>

                    {/* LinkedIn and Experience Since */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="linkedinAddress" className="text-sm font-medium text-gray-700">LinkedIn URL</Label>
                            <Input
                                id="linkedinAddress"
                                placeholder="https://linkedin.com/in/username"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('linkedinAddress')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experienceSince" className="text-sm font-medium text-gray-700">Experience Since (Year)</Label>
                            <Input
                                id="experienceSince"
                                type="number"
                                placeholder="e.g. 2015"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('experienceSince')}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="joinedDate" className="text-sm font-medium text-gray-700">Joined Date</Label>
                            <Input
                                id="joinedDate"
                                type="date"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('joinedDate')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="visaExpiryDate" className="text-sm font-medium text-gray-700">Visa Expires Date</Label>
                            <Input
                                id="visaExpiryDate"
                                type="date"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('visaExpiryDate')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthdate" className="text-sm font-medium text-gray-700">Birthdate</Label>
                            <Input
                                id="birthdate"
                                type="date"
                                className="h-[50px] bg-white border-gray-200"
                                {...register('birthdate')}
                            />
                        </div>
                    </div>

                    {/* Areas Expert In */}
                    <div className="space-y-2">
                        <Label htmlFor="areasExpertIn" className="text-sm font-medium text-gray-700">Areas Expert In</Label>
                        <Input
                            id="areasExpertIn"
                            placeholder="Separate with comma"
                            className="h-[50px] bg-white border-gray-200"
                            {...register('areasExpertIn')}
                        />
                    </div>

                    {/* License Document Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="license-upload" className="text-sm font-medium text-gray-700">License Document</Label>
                        <div className="flex items-center gap-4">
                            <label htmlFor="license-upload" className="flex items-center gap-2 px-4 h-[50px] bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <CloudUpload className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">Upload License Document</span>
                                <input
                                    id="license-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                />
                            </label>
                            <span className="text-xs text-gray-500">Required for Property Finder verification</span>
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
                        {agent ? 'Update Agent' : 'Create new agent'}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
