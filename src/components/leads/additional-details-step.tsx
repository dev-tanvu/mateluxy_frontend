'use client';

import React, { useMemo, useState } from 'react';
import { LeadFormData } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAgents } from '@/lib/hooks/use-agents';
import Image from 'next/image';

interface AdditionalDetailsStepProps {
    data: LeadFormData;
    onChange: (field: keyof LeadFormData, value: string | string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const statusOptions = ['New', 'Pending', 'Contacting', 'Completed', 'Lost'];
const currencyOptions = ['AED', 'USD', 'EUR'];
const sourceOptions = ['Facebook', 'Instagram', 'Whatsapp', 'Tiktok', 'Adsense', 'Walk in'];

export function AdditionalDetailsStep({ data, onChange, onNext, onBack }: AdditionalDetailsStepProps) {
    const { data: agents } = useAgents();
    const [agentSearch, setAgentSearch] = useState('');
    const filteredAgents = useMemo(() => {
        if (!agents) return [];
        const term = agentSearch.toLowerCase();
        if (!term) return agents;
        return agents.filter((agent) =>
            agent.name.toLowerCase().includes(term) ||
            agent.languages?.some((lang) => lang.toLowerCase().includes(term))
        );
    }, [agents, agentSearch]);

    return (
        <div className="flex h-full flex-col justify-between rounded-[28px] bg-white px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Organizer</Label>
                        <Input
                            placeholder="Enter organizer name"
                            value={data.organizer || ''}
                            onChange={(e) => onChange('organizer', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Responsible</Label>
                        <Select value={data.responsible || ''} onValueChange={(value: string) => onChange('responsible', value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2">
                                    <Input
                                        value={agentSearch}
                                        onChange={(e) => setAgentSearch(e.target.value)}
                                        placeholder="Search agent..."
                                        className="h-10 rounded-xl border border-[#e4ebf5] bg-white text-sm"
                                    />
                                </div>
                                {filteredAgents.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-[#97a3b7]">No agents found</div>
                                )}
                                {filteredAgents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                                                {agent.photoUrl ? (
                                                    <Image src={agent.photoUrl} alt={agent.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                                                        {agent.name.slice(0, 1)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-[#1b2430]">{agent.name}</span>
                                                <span className="text-xs text-[#97a3b7]">
                                                    {agent.languages && agent.languages.length > 0 ? `Speaks ${agent.languages.join(', ')}` : 'Languages not set'}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Observers</Label>
                        <Select
                            value={data.observers[0] || ''}
                            onValueChange={(value: string) => onChange('observers', value ? [value] : [])}
                        >
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Observer 1">Observer 1</SelectItem>
                                <SelectItem value="Observer 2">Observer 2</SelectItem>
                                <SelectItem value="Observer 3">Observer 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Status</Label>
                        <Select value={data.status || ''} onValueChange={(value: string) => onChange('status', value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Deal Price</Label>
                        <Input
                            placeholder="e.g. 120,000"
                            value={data.dealPrice || ''}
                            onChange={(e) => onChange('dealPrice', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Currency</Label>
                        <Select value={data.currency} onValueChange={(value: string) => onChange('currency', value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencyOptions.map((currency) => (
                                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Closing Date</Label>
                        <Input
                            type="date"
                            placeholder="dd/mm/yyyy"
                            value={data.closingDate || ''}
                            onChange={(e) => onChange('closingDate', e.target.value)}
                            className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430] placeholder:text-[#b0b7c3]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1b2430]">Source</Label>
                        <Select value={data.source || ''} onValueChange={(value: string) => onChange('source', value)}>
                            <SelectTrigger className="h-[56px] rounded-2xl border border-[#e4ebf5] bg-white text-[#1b2430]">
                                <SelectValue placeholder="Select a source" />
                            </SelectTrigger>
                            <SelectContent>
                                {sourceOptions.map((source) => (
                                    <SelectItem key={source} value={source}>{source}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

