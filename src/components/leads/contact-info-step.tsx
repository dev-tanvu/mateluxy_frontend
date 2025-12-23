'use client';

import React from 'react';
import { LeadFormData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CountryCode } from 'libphonenumber-js';
import { CountryCodeSelect } from '@/components/ui/country-code-select';

interface ContactInfoStepProps {
    data: LeadFormData;
    onChange: (field: keyof LeadFormData, value: string | string[] | CountryCode) => void;
    onNext: () => void;
    onBack: () => void;
}

export function ContactInfoStep({ data, onChange, onNext, onBack }: ContactInfoStepProps) {
    return (
        <div className="flex h-full flex-col justify-between rounded-[28px] bg-white px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Name</Label>
                        <Input
                            placeholder="Enter Full Name"
                            value={data.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Email Address</Label>
                        <Input
                            type="email"
                            placeholder="e.g. example@mail.com"
                            value={data.email}
                            onChange={(e) => onChange('email', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#1b2430]">Phone Number</Label>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <CountryCodeSelect
                            value={data.countryCode}
                            onChange={(code) => onChange('countryCode', code)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white"
                        />
                        <Input
                            placeholder="837-XXXXXXXX"
                            value={data.phone}
                            onChange={(e) => onChange('phone', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12 flex items-center justify-between">
                <Button variant="outline" className="h-[50px] w-[120px] rounded-xl border-[#e6ecf5] bg-[#f7f9fc] text-[#7b8ba5]" onClick={onBack}>
                    <span className="mr-2">‹</span> Back
                </Button>
                <Button className="h-[50px] w-[120px] rounded-xl bg-[#2aa0ff] text-white shadow-[0_10px_24px_rgba(42,160,255,0.35)] hover:bg-[#1b8de4]" onClick={onNext}>
                    Next <span className="ml-2">›</span>
                </Button>
            </div>
        </div>
    );
}

