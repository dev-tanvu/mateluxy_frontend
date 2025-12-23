'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { LeadService } from '@/lib/services/lead.service';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { LeadDetailsSidebar } from '@/components/leads/lead-details-sidebar';

type Lead = {
    id: string;
    name: string;
    email: string;
    phone: string;
    source?: string;
    status?: string;
    responsible?: string;
    createdAt?: string;
    organizer?: string;
    observers?: string[];
    dealPrice?: number;
    currency?: string;
    closingDate?: string;
    additionalContent?: string;
};

const sourceColors: Record<string, { text: string; bg: string }> = {
    Facebook: { text: '#3b5998', bg: '#e8f0ff' },
    Instagram: { text: '#e1306c', bg: '#fde9f1' },
    TikTok: { text: '#000000', bg: '#f2f2f2' },
    Adsense: { text: '#fbbc04', bg: '#fff6df' },
    Whatsapp: { text: '#25d366', bg: '#e6fff2' },
    'Walk in': { text: '#1f2937', bg: '#f2f2f2' },
};

const statusColors: Record<string, { text: string; bg: string }> = {
    New: { text: '#2aa0ff', bg: '#e8f4ff' },
    Pending: { text: '#7c3aed', bg: '#f3e8ff' },
    Contacting: { text: '#f59e0b', bg: '#fff7e8' },
    Completed: { text: '#22c55e', bg: '#e7f9ef' },
    Lost: { text: '#ef4444', bg: '#ffecec' },
};

const defaultAvatar = '/profile.svg';

function useLeads() {
    return useQuery({
        queryKey: ['leads'],
        queryFn: async () => {
            const res = await LeadService.listLeads();
            return res as Lead[];
        },
    });
}

function formatPhone(phone?: string) {
    if (!phone) return '';
    return phone.replace(/\s+/g, ' ').trim();
}

function groupByMonth(leads: Lead[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const base = months.map((m) => ({ month: m, current: 0, last: 0 }));
    leads.forEach((lead) => {
        if (!lead.createdAt) return;
        const d = parseISO(lead.createdAt);
        const idx = d.getMonth();
        base[idx].current += 1;
        base[idx].last += Math.max(0, Math.round(Math.random())); // simple placeholder delta
    });
    return base;
}

function summaryBySource(leads: Lead[]) {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
        const key = l.source || 'Walk in';
        counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([source, count]) => ({ source, count }));
}

function LeadCard({ lead, sourceLabel, onClick }: { lead: Lead; sourceLabel: string; onClick: (lead: Lead) => void }) {
    const status = lead.status || 'Pending';
    const statusStyle = statusColors[status] || statusColors.Pending;
    const sourceStyle = sourceColors[sourceLabel] || sourceColors['Walk in'];
    return (
        <div
            className="rounded-[22px] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(35,69,122,0.07)] cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClick(lead)}
        >
            <div className="mb-3 flex items-start justify-between">
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: sourceStyle.text, background: sourceStyle.bg }}>
                    {sourceLabel}
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: statusStyle.text, background: statusStyle.bg }}>
                    {status}
                </span>
            </div>
            <div className="text-lg font-semibold text-[#1f2837]">{lead.name}</div>
            <div className="mt-2 text-sm text-[#5f6a7a] leading-relaxed">
                Interested in Off Plan properties
                <br />
                {lead.email}
                <br />
                {formatPhone(lead.phone)}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-[#1f2837]">
                <div className="flex items-center gap-2">
                    <Image src={defaultAvatar} alt="avatar" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                    <span>{lead.responsible || 'Owner'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#7b8794]">
                    <span className="text-base">⇄</span>
                    <span>Transfer</span>
                </div>
            </div>
        </div>
    );
}

// Skeleton components for loading states
function ChartSkeleton() {
    return (
        <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(25,70,128,0.06)]">
            <div className="mb-4 h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-72 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
    );
}

function LeadCardSkeleton() {
    return (
        <div className="rounded-[22px] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(35,69,122,0.07)] animate-pulse">
            <div className="mb-3 flex items-start justify-between">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );
}

function SourceSkeleton() {
    return (
        <div className="rounded-[18px] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(35,69,122,0.07)] animate-pulse">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-12 bg-gray-200 rounded"></div>
        </div>
    );
}

export default function LeadsDashboardPage() {
    const { data: leads = [], isLoading } = useLeads();
    const [search, setSearch] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const filteredLeads = useMemo(() => {
        if (!search) return leads;
        const term = search.toLowerCase();
        return leads.filter((l) =>
            l.name.toLowerCase().includes(term) ||
            (l.email || '').toLowerCase().includes(term) ||
            (l.source || '').toLowerCase().includes(term),
        );
    }, [leads, search]);

    const chartData = useMemo(() => groupByMonth(leads), [leads]);
    const sourceSummary = useMemo(() => summaryBySource(leads), [leads]);

    return (
        <div className="min-h-screen bg-[#f7fbff] px-4 py-6 lg:px-6 xl:px-10">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search for agent"
                        className="h-12 w-64 rounded-2xl border border-[#e5ecf5] bg-white text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Input placeholder="dd/mm/yyyy" className="h-12 w-40 rounded-2xl border border-[#e5ecf5] bg-white text-sm" />
                    <Input placeholder="dd/mm/yyyy" className="h-12 w-40 rounded-2xl border border-[#e5ecf5] bg-white text-sm" />
                </div>
            </div>

            {/* Chart Section */}
            {isLoading ? (
                <ChartSkeleton />
            ) : (
                <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(25,70,128,0.06)]">
                    <div className="mb-4 text-lg font-semibold text-[#1f2837]">Leads</div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#edf1f7" />
                                <XAxis dataKey="month" tick={{ fill: '#8b97a8' }} />
                                <YAxis tick={{ fill: '#8b97a8' }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="current" stroke="#2aa0ff" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="last" stroke="#a7c5ff" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Source Summary */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <SourceSkeleton key={i} />)
                ) : (
                    ['Facebook', 'Instagram', 'TikTok', 'Adsense', 'Whatsapp', 'Walk in'].map((src) => {
                        const count = sourceSummary.find((s) => s.source === src)?.count ?? 0;
                        const color = sourceColors[src] || sourceColors['Walk in'];
                        return (
                            <div key={src} className="rounded-[18px] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(35,69,122,0.07)]">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#1f2837]">{src}</span>
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-[#1f2837]">{count}</div>
                                <div className="text-xs text-[#7b8794]" style={{ color: color.text }}>—</div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Lead Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <LeadCardSkeleton key={i} />)
                ) : filteredLeads.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-[#7b8794]">No leads found.</div>
                ) : (
                    filteredLeads.map((lead) => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            sourceLabel={lead.source || 'Walk in'}
                            onClick={setSelectedLead}
                        />
                    ))
                )}
            </div>

            <LeadDetailsSidebar
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
            />
        </div>
    );
}

