'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { PropertyFinderLeadService, PropertyFinderLead } from '@/lib/services/property-finder-lead.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Reuse stats configs from 3rd party page or define locally
const sourceMeta: Array<{
    key: string;
    label: string;
    icon: string;
    text: string;
    bg: string;
    delta: string;
    fallbackCount: number;
}> = [
        { key: 'email', label: 'Email', icon: '/email_icon.svg', text: '#1f2937', bg: '#f9f9f9', delta: '', fallbackCount: 0 },
        { key: 'call', label: 'Call', icon: '/call_icon.svg', text: '#1f2937', bg: '#f9f9f9', delta: '', fallbackCount: 0 },
        { key: 'whatsapp', label: 'Whatsapp', icon: '/whatsapp_icon.svg', text: '#16a34a', bg: '#f3fbf6', delta: '', fallbackCount: 0 },
        { key: 'sms', label: 'SMS', icon: '/sms_icon.svg', text: '#1f2937', bg: '#f9f9f9', delta: '', fallbackCount: 0 },
    ];

const statusColors: Record<string, { text: string; bg: string }> = {
    sent: { text: '#7c3aed', bg: '#f3e8ff' },      // Purple - initial send
    delivered: { text: '#2aa0ff', bg: '#e8f4ff' }, // Blue - delivered
    read: { text: '#f59e0b', bg: '#fff7e8' },      // Orange - read/opened
    replied: { text: '#22c55e', bg: '#e7f9ef' },   // Green - replied/completed
};

const defaultAvatar = '/profile.svg';

const formatMoney = (value: number) =>
    `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} AED`;

const CustomTooltip = ({ active, payload, chartSeries }: any) => {
    if (active && payload && payload.length) {
        const monthIndex = chartSeries.findIndex((d: any) => d.month === payload[0].payload.month);
        const displayDate = monthIndex >= 0 ? `05 ${chartSeries[monthIndex].month}, 2025` : '';
        const currentVal = payload.find((p: any) => p.dataKey === 'current')?.value;
        const lastVal = payload.find((p: any) => p.dataKey === 'last')?.value;
        return (
            <div className="rounded-xl border border-[#eef2f6] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(35,69,122,0.08)]">
                <div className="text-[12px] text-[#8b97a8]">{displayDate}</div>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-[#1f2837]">
                    <span className="h-2 w-2 rounded-full bg-[#0aa5ff]" />
                    <span>This year</span>
                    <span className="font-semibold text-[#1f2837]">{formatMoney(currentVal || 0)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[13px] text-[#1f2837]">
                    <span className="h-2 w-2 rounded-full bg-[#6ec2ff]" />
                    <span>Last year</span>
                    <span className="font-semibold text-[#1f2837]">{formatMoney(lastVal || 0)}</span>
                </div>
            </div>
        );
    }
    return null;
};

// Default chart data for initial load
const defaultChartSeries = [
    { month: 'Jan', current: 0, last: 0 },
    { month: 'Feb', current: 0, last: 0 },
    { month: 'Mar', current: 0, last: 0 },
    { month: 'Apr', current: 0, last: 0 },
    { month: 'May', current: 0, last: 0 },
    { month: 'Jun', current: 0, last: 0 },
    { month: 'Jul', current: 0, last: 0 },
    { month: 'Aug', current: 0, last: 0 },
    { month: 'Sep', current: 0, last: 0 },
    { month: 'Oct', current: 0, last: 0 },
    { month: 'Nov', current: 0, last: 0 },
    { month: 'Dec', current: 0, last: 0 },
];

function useLeads() {
    return useQuery({
        queryKey: ['property-finder-leads'],
        queryFn: async () => {
            const res = await PropertyFinderLeadService.listLeads();
            return res as PropertyFinderLead[];
        },
    });
}

function useLeadStats() {
    return useQuery({
        queryKey: ['property-finder-leads', 'stats'],
        queryFn: async () => {
            return PropertyFinderLeadService.getStats();
        },
    });
}

function summaryBySource(leads: PropertyFinderLead[]) {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
        const key = (l.channel || '').toLowerCase(); // PF channels: call, email, etc.
        counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
}

function formatPhone(phone?: string) {
    if (!phone) return '';
    return phone.replace(/\s+/g, ' ').trim();
}

function LeadCard({
    lead,
}: {
    lead: PropertyFinderLead;
}) {
    // Determine source label and style
    // PF channels are typically lowercase: email, call, whatsapp
    const sourceKey = (lead.channel || '').toLowerCase();
    const sourceStyle = sourceMeta.find((s) => s.key === sourceKey) || { label: lead.channel || 'Unknown', text: '#1f2937', bg: '#f9f9f9' };

    // Status - PF statuses are lowercase: sent, delivered, read, replied
    const statusKey = (lead.status || 'sent').toLowerCase();
    const statusStyle = statusColors[statusKey] || { text: '#6b7280', bg: '#f3f4f6' };

    return (
        <div className="rounded-[24px] bg-white px-5 py-4 border border-[#EDF1F7]">
            <div className="mb-3 flex items-start justify-between">
                <span className="text-[12px] text-[#5f6a7a] capitalize">
                    Channel: {lead.channel || 'Unknown'}
                </span>
                <span
                    className="rounded-full px-3 py-1 text-[12px] font-semibold capitalize"
                    style={{ color: statusStyle.text, background: statusStyle.bg }}
                >
                    {statusKey}
                </span>
            </div>
            <div className="text-[18px] font-semibold text-[#1f2837] leading-tight">{lead.name}</div>
            <div className="mt-2 text-[13px] leading-6 text-[#5f6a7a]">
                {/* Property Finder leads usually relate to listing */}
                {lead.listingReference ? (
                    <>Interested in listing #{lead.listingReference}</>
                ) : (
                    <>Interested in Property</>
                )}
                <br />
                {lead.email}
                <br />
                {formatPhone(lead.phone)}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[#1f2837]">
                <div className="flex items-center gap-2">
                    <div className="relative h-7 w-7 overflow-hidden rounded-full bg-[#f3f4f6]">
                        <Image
                            src={lead.agentImageUrl || defaultAvatar}
                            alt={lead.agentName || 'Agent avatar'}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-[13px]">
                        {lead.agentName || (lead.assignedToIdentifier ? `Agent #${lead.assignedToIdentifier}` : 'Unassigned')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function PropertyFinderLeadsPage() {
    const queryClient = useQueryClient();
    const { data: leads = [], isLoading } = useLeads();
    const { data: leadStats = [] } = useLeadStats();

    const [search, setSearch] = useState('');
    const [showCurrent, setShowCurrent] = useState(true);
    const [showLast, setShowLast] = useState(true);
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [syncing, setSyncing] = useState(false);

    const filteredLeads = useMemo(() => {
        let res = leads;
        if (selectedSource) {
            res = res.filter(l => (l.channel || '').toLowerCase() === selectedSource);
        }
        if (search) {
            const term = search.toLowerCase();
            res = res.filter((l) =>
                l.name.toLowerCase().includes(term) ||
                (l.email || '').toLowerCase().includes(term) ||
                (l.channel || '').toLowerCase().includes(term) ||
                (l.listingReference || '').toLowerCase().includes(term)
            );
        }
        return res;
    }, [leads, search, selectedSource]);

    const chartData = useMemo(() => {
        if (leadStats.length > 0) return leadStats;
        return defaultChartSeries;
    }, [leadStats]);

    const sourceCounts = useMemo(() => summaryBySource(leads), [leads]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            const res = await PropertyFinderLeadService.syncLeads();
            toast.success(`Synced ${res.count} leads successfully`);
            queryClient.invalidateQueries({ queryKey: ['property-finder-leads'] });
        } catch (error) {
            console.error(error);
            toast.error('Failed to sync leads');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] px-[30px] pt-6 pb-4">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search leads..."
                        className="h-12 w-72 rounded-2xl border border-[#e5ecf5] bg-white text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        className="h-12 rounded-2xl bg-[#0aa5ff] text-white hover:bg-[#0aa5ff]/90"
                    >
                        {syncing ? 'Syncing...' : 'Sync Leads'}
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Input placeholder="dd/mm/yyyy" className="h-12 w-40 rounded-2xl border border-[#e5ecf5] bg-white text-sm" />
                    <Input placeholder="dd/mm/yyyy" className="h-12 w-40 rounded-2xl border border-[#e5ecf5] bg-white text-sm" />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading && (
                    <div className="col-span-full text-center text-sm text-[#7b8794]">Loading leads...</div>
                )}
                {!isLoading && filteredLeads.length === 0 && (
                    <div className="col-span-full text-center text-sm text-[#7b8794]">No leads found.</div>
                )}
                {filteredLeads.map((lead) => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                    />
                ))}
            </div>
        </div>
    );
}
