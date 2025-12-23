'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, User, Mail, Phone, Copy, ChevronDown, Facebook, Instagram, Hash } from 'lucide-react'; // Hash for Adsense/TikTok potentially or just generic
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Define Lead interface locally if not available globally, or import it. 
// Based on typical usage and reference.
export interface LeadDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    source?: string;
    status?: string;
    responsible?: string;
    organizer?: string;
    observer?: string;
    dealPrice?: number;
    closingDate?: string | Date;
    additionalContent?: string;

    // For the header agent info
    responsibleAgent?: {
        name: string;
        role: string;
        photoUrl?: string;
        score?: number;
    };
}

interface LeadDetailsSidebarProps {
    lead: LeadDetails | any; // Use any to be flexible with incoming data if types mismatch
    onClose: () => void;
}

const sourceIcons: Record<string, React.ElementType> = {
    Facebook: Facebook,
    Instagram: Instagram,
    // Add others if needed, fallback to Hash or User
};

const defaultAvatar = '/profile.svg';

export function LeadDetailsSidebar({ lead, onClose }: LeadDetailsSidebarProps) {
    if (!lead) return null;

    const [isWishesOpen, setIsWishesOpen] = useState(false);

    // Mock responsible agent data if missing (as per design image which shows a specific agent)
    // In real app, this should come from lead.responsibleAgent relation
    // Use lead's responsible agent data or fallback to mock if completely missing
    const agent = {
        name: lead.responsibleAgent?.name || lead.responsible || 'William Yong',
        role: lead.responsibleAgent ? 'Sales Agent' : 'CEO | Sales', // Simple fallback role logic
        photoUrl: lead.responsibleAgent?.photoUrl || '/profile.svg',
        score: lead.responsibleAgent?.score || 143
    };

    return (
        <div className="sticky top-0 h-screen w-[400px] flex-shrink-0 bg-white shadow-[-5px_0_30px_rgba(0,0,0,0.02)] border-l border-[#EDF1F7] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-8">
                <div className="flex justify-end mb-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Header: Responsible Agent */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="relative">
                        <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-gray-100 shadow-sm">
                            <Image
                                src={agent.photoUrl}
                                alt={agent.name}
                                width={72}
                                height={72}
                                className="object-cover h-full w-full"
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-0 left-0 flex justify-center">
                            <span className="bg-[#E6F6EC] text-[#00A045] text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                                {agent.score}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 mt-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[20px] font-semibold text-[#1F2837] leading-tight">
                                {agent.name}
                            </h2>
                            <button className="text-[#2196F3] text-sm font-medium flex items-center gap-1 hover:underline">
                                <span>⇄</span> Transfer
                            </button>
                        </div>
                        <p className="text-[#8F9BB3] text-sm font-normal mt-0.5">{agent.role}</p>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                    <h3 className="text-[#8F9BB3] text-[16px] font-semibold mb-5">Contact information</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-[#8F9BB3] bg-transparent" strokeWidth={1.5} />
                            <div className="text-[15px] text-[#1F2837]">
                                <span className="text-[#8F9BB3] font-normal mr-2">Name :</span>
                                <span className="font-semibold">{lead.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 group">
                            <Mail className="w-5 h-5 text-[#8F9BB3]" strokeWidth={1.5} />
                            <div className="text-[15px] text-[#1F2837] flex items-center flex-1">
                                <span className="text-[#8F9BB3] font-normal mr-2">Email :</span>
                                <span className="font-semibold truncate max-w-[200px]">{lead.email}</span>
                                <Copy className="w-4 h-4 text-[#2196F3] ml-2 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-[#8F9BB3]" strokeWidth={1.5} />
                            <div className="text-[15px] text-[#1F2837]">
                                <span className="text-[#8F9BB3] font-normal mr-2">Phone :</span>
                                <span className="font-semibold">{lead.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Client's Wishes Accordion */}
                <div className="mb-8 border-b border-[#EDF1F7] pb-8">
                    <div
                        className="flex items-center justify-between cursor-pointer group select-none"
                        onClick={() => setIsWishesOpen(!isWishesOpen)}
                    >
                        <span className="text-[#1F2837] text-[16px] font-semibold">Client's wishes</span>
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-[#8F9BB3] group-hover:text-[#1F2837] transition-transform duration-200",
                                isWishesOpen && "transform rotate-180"
                            )}
                        />
                    </div>

                    {isWishesOpen && (
                        <div className="mt-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[#8F9BB3] text-[13px] block mb-1">Property Type</span>
                                    <span className="text-[#1F2837] text-[14px] font-medium">{lead.propertyType || 'Any'}</span>
                                </div>
                                <div>
                                    <span className="text-[#8F9BB3] text-[13px] block mb-1">District</span>
                                    <span className="text-[#1F2837] text-[14px] font-medium">{lead.district || 'Any'}</span>
                                </div>
                                <div>
                                    <span className="text-[#8F9BB3] text-[13px] block mb-1">Budget</span>
                                    <span className="text-[#1F2837] text-[14px] font-medium">
                                        {lead.budgetFrom || lead.budgetTo
                                            ? `${lead.budgetFrom || 0} - ${lead.budgetTo || 'Max'} AED`
                                            : 'Not specified'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#8F9BB3] text-[13px] block mb-1">Bedrooms</span>
                                    <span className="text-[#1F2837] text-[14px] font-medium">{lead.bedrooms || 'Any'}</span>
                                </div>
                                <div>
                                    <span className="text-[#8F9BB3] text-[13px] block mb-1">Area (sqft)</span>
                                    <span className="text-[#1F2837] text-[14px] font-medium">
                                        {lead.areaFrom || lead.areaTo
                                            ? `${lead.areaFrom || 0} - ${lead.areaTo || 'Max'}`
                                            : 'Not specified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lead Source */}
                <div className="mb-8">
                    <h3 className="text-[#8F9BB3] text-[16px] font-semibold mb-4">Lead Source</h3>
                    <div className="flex items-center gap-2">
                        {/* Source Icon logic */}
                        {lead.source === 'Facebook' && <div className="bg-[#1877F2] p-1 rounded-full"><Facebook className="w-3 h-3 text-white fill-white" /></div>}
                        {/* Fallback */}
                        {!lead.source?.includes('Facebook') && <div className="w-5 h-5 bg-gray-200 rounded-full" />}

                        <span className="text-[16px] font-medium text-[#1F2837]">{lead.source || 'Unknown'}</span>
                    </div>
                </div>

                <div className="h-px bg-[#EDF1F7] w-full mb-8" />

                {/* Additional Details */}
                <div className="mb-8">
                    <h3 className="text-[#8F9BB3] text-[16px] font-semibold mb-5">Additional details</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[#8F9BB3] text-[15px] font-normal">Organizer :</span>
                            <span className="text-[#1F2837] font-medium">{lead.organizer || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#8F9BB3] text-[15px] font-normal">Responsible :</span>
                            <span className="text-[#1F2837] font-medium">{lead.responsible || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#8F9BB3] text-[15px] font-normal">Observer :</span>
                            <span className="text-[#1F2837] font-medium">{lead.observers?.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#8F9BB3] text-[15px] font-normal">Deal price :</span>
                            <span className="text-[#1F2837] font-medium">{lead.dealPrice ? `${lead.currency || 'AED'} ${lead.dealPrice}` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#8F9BB3] text-[15px] font-normal">Closing date :</span>
                            <span className="text-[#1F2837] font-medium">{lead.closingDate ? new Date(lead.closingDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[#EDF1F7] w-full mb-8" />

                {/* Additional Content */}
                <div className="mb-8">
                    <h3 className="text-[#8F9BB3] text-[16px] font-semibold mb-3">Additional content</h3>
                    <p className="text-[#8F9BB3] text-[14px] leading-relaxed">
                        {lead.additionalContent || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur'}
                    </p>
                </div>

            </div>
        </div>
    );
}
