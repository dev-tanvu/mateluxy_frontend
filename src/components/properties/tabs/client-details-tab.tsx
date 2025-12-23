'use client';

import React from 'react';
import { UseFormRegister, Control, FieldErrors, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentUploadBox } from '../document-upload-box';
import { CountryCodeSelect } from '@/components/ui/country-code-select';
import { FileText, CreditCard, UserSquare2, FileBadge } from 'lucide-react';
import { CountryCode } from 'libphonenumber-js';
import Select from 'react-select';
import countryList from 'react-select-country-list';

interface ClientDetailsTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    nocFile: File | string | null;
    onNocFileChange: (file: File | null) => void;

    // New document props
    passportFile: File | string | null;
    onPassportFileChange: (file: File | null) => void;
    emiratesIdFile: File | string | null;
    onEmiratesIdFileChange: (file: File | null) => void;
    titleDeedFile: File | string | null;
    onTitleDeedFileChange: (file: File | null) => void;
}

export function ClientDetailsTab({
    register,
    control,
    errors,
    setValue,
    watch,
    nocFile,
    onNocFileChange,
    passportFile,
    onPassportFileChange,
    emiratesIdFile,
    onEmiratesIdFileChange,
    titleDeedFile,
    onTitleDeedFileChange
}: ClientDetailsTabProps) {
    return (
        <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Form Fields */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
                {/* Client Name */}
                <div className="space-y-2.5">
                    <Label htmlFor="clientName" className="text-[15px] font-medium text-gray-700">
                        Client Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="clientName"
                        placeholder="Enter full name"
                        className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                        {...register('clientName', { required: 'Client name is required' })}
                    />
                    {errors.clientName && <p className="text-sm text-red-500">{errors.clientName.message as string}</p>}
                </div>

                {/* Nationality */}
                <div className="space-y-2.5">
                    <Label htmlFor="nationality" className="text-[15px] font-medium text-gray-700">
                        Nationality <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="nationality"
                        control={control}
                        rules={{ required: 'Nationality is required' }}
                        render={({ field }) => {
                            const options = countryList().getData();
                            return (
                                <Select
                                    instanceId="nationality-select"
                                    options={options}
                                    value={options.find(option => option.label === field.value)}
                                    onChange={(selected) => field.onChange(selected?.label)}
                                    placeholder="Select nationality..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            height: '50px',
                                            backgroundColor: 'white',
                                            borderColor: '#EDF1F7',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                borderColor: '#EDF1F7',
                                            },
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#8F9BB3',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '8px',
                                            zIndex: 50,
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected ? '#E9F8FF' : state.isFocused ? '#F7F7F74F' : 'white',
                                            color: state.isSelected ? '#00AAFF' : '#1A1A1A',
                                            '&:active': {
                                                backgroundColor: '#E9F8FF',
                                            },
                                        }),
                                    }}
                                />
                            );
                        }}
                    />
                    {errors.nationality && <p className="text-sm text-red-500">{errors.nationality.message as string}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-2.5">
                    <Label htmlFor="phoneNumber" className="text-[15px] font-medium text-gray-700">
                        Phone Number
                    </Label>
                    <div className="flex gap-3">
                        <Controller
                            name="phoneCountry"
                            control={control}
                            render={({ field }) => (
                                <CountryCodeSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <Input
                            id="phoneNumber"
                            placeholder="XXXXXXXXX"
                            className="flex-1 h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]"
                            {...register('phoneNumber')}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column - Document Uploads */}
            <div className="col-span-12 lg:col-span-7">
                <div className="bg-white rounded-2xl border border-[#EDF1F7] p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <FileBadge className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Upload Necessary Documents</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DocumentUploadBox
                            label="Passport Copy"
                            icon={<UserSquare2 className="w-6 h-6" />}
                            file={passportFile}
                            onFileSelect={onPassportFileChange}
                            onRemove={() => onPassportFileChange(null)}
                        />
                        <DocumentUploadBox
                            label="Emirates ID"
                            icon={<CreditCard className="w-6 h-6" />}
                            file={emiratesIdFile}
                            onFileSelect={onEmiratesIdFileChange}
                            onRemove={() => onEmiratesIdFileChange(null)}
                        />
                        <DocumentUploadBox
                            label="Title Deed"
                            icon={<FileText className="w-6 h-6" />}
                            file={titleDeedFile}
                            onFileSelect={onTitleDeedFileChange}
                            onRemove={() => onTitleDeedFileChange(null)}
                        />
                        <DocumentUploadBox
                            label="Mateluxy NOC"
                            icon={<FileText className="w-6 h-6" />}
                            file={nocFile}
                            onFileSelect={onNocFileChange}
                            onRemove={() => onNocFileChange(null)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
