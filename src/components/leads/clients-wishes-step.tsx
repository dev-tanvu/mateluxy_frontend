'use client';

import React from 'react';
import { LeadFormData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ClientsWishesStepProps {
    data: LeadFormData;
    onChange: (field: keyof LeadFormData, value: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    submitting?: boolean;
}

const propertyTypes = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'];
const developers = ['Emaar', 'DAMAC', 'Nakheel', 'Meraas'];

export function ClientsWishesStep({ data, onChange, onSubmit, onBack, submitting }: ClientsWishesStepProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-[28px] bg-white px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">District</Label>
                        <Input
                            placeholder="Enter client's desired district"
                            value={data.district || ''}
                            onChange={(e) => onChange('district', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Property Type</Label>
                        <Select value={data.propertyType || ''} onValueChange={(value: string) => onChange('propertyType', value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                                {propertyTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Developer</Label>
                        <Select value={data.developer || 'none'} onValueChange={(value: string) => onChange('developer', value === 'none' ? '' : value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select developer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select developer</SelectItem>
                                {developers.map((dev) => (
                                    <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Bedrooms</Label>
                        <Input
                            placeholder="e.g. 03"
                            value={data.bedrooms || ''}
                            onChange={(e) => onChange('bedrooms', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Budget From</Label>
                        <Input
                            placeholder="e.g. 30,000"
                            value={data.budgetFrom || ''}
                            onChange={(e) => onChange('budgetFrom', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Budget To</Label>
                        <Input
                            placeholder="e.g. 50,000"
                            value={data.budgetTo || ''}
                            onChange={(e) => onChange('budgetTo', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Area From</Label>
                        <Input
                            placeholder="e.g. Burj Khalifa"
                            value={data.areaFrom || ''}
                            onChange={(e) => onChange('areaFrom', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Area To</Label>
                        <Input
                            placeholder="e.g. Jabel Ali"
                            value={data.areaTo || ''}
                            onChange={(e) => onChange('areaTo', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#1b2430]">Additional Content</Label>
                    <Textarea
                        placeholder="Start writing from here"
                        value={data.additionalContent || ''}
                        onChange={(e) => onChange('additionalContent', e.target.value)}
                        className="min-h-[200px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                    />
                </div>
            </div>

            <div className="mt-12 flex items-center justify-between">
                <Button variant="outline" className="h-[50px] w-[120px] rounded-xl border-[#e6ecf5] bg-[#f7f9fc] text-[#7b8ba5]" onClick={onBack}>
                    <span className="mr-2">‹</span> Back
                </Button>
                <Button
                    className="h-[50px] min-w-[140px] rounded-xl bg-[#2aa0ff] text-white shadow-[0_10px_24px_rgba(42,160,255,0.35)] hover:bg-[#1b8de4]"
                    onClick={onSubmit}
                    disabled={submitting}
                >
                    {submitting ? 'Adding...' : 'Add Lead'}
                </Button>
            </div>
        </div>
    );
}

