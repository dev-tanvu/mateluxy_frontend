import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { LeadService } from '@/lib/services/lead.service';

function LeadBar({
    icon,
    color,
    value,
    max,
}: {
    icon: React.ReactNode;
    color: string;
    value: number;
    max: number;
}) {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div className="flex items-center gap-4 mb-4 last:mb-0">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1">
                <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                </div>
            </div>
            <span className="text-[14px] font-bold text-[#1A1A1A] w-10 text-right">{value}</span>
        </div>
    );
}

export function LeadStats() {
    const { data, isLoading } = useQuery({
        queryKey: ['leadSourceStats'],
        queryFn: LeadService.getLeadSourceStats,
    });

    if (isLoading) {
        return (
            <div className="bg-white p-5 rounded-[20px] border border-[#EDF1F7] animate-pulse">
                <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const stats = data || {
        facebook: 0,
        instagram: 0,
        tiktok: 0,
        mateluxy: 0,
    };

    const maxValue = Math.max(
        stats.facebook || 0,
        stats.instagram || 0,
        stats.tiktok || 0,
        stats.mateluxy || 0,
        100 // Minimum scale to avoid div by zero
    );

    // Add 20% buffer to max value so bars aren't always 100% full
    const displayMax = maxValue * 1.2;

    return (
        <div className="bg-white p-5 rounded-[20px] border border-[#EDF1F7]">
            <h3 className="text-[#8F9BB3] text-[16px] font-medium mb-4">Leads</h3>
            <div className="space-y-1">
                <LeadBar
                    icon={<Image src="/facebook_icon.svg" alt="Facebook" width={32} height={32} />}
                    color="#1877F2"
                    value={stats.facebook || 0}
                    max={displayMax}
                />
                <LeadBar
                    icon={<Image src="/instagram_icon.svg" alt="Instagram" width={32} height={32} />}
                    color="#E1306C"
                    value={stats.instagram || 0}
                    max={displayMax}
                />
                <LeadBar
                    icon={<Image src="/tiktok_icon.svg" alt="TikTok" width={32} height={32} />}
                    color="#000000"
                    value={stats.tiktok || 0}
                    max={displayMax}
                />
                <LeadBar
                    icon={<Image src="/svg/mateluxy_icon.svg" alt="Mateluxy" width={32} height={32} className="rounded-full" />}
                    color="#FF0000"
                    value={stats.mateluxy || 0}
                    max={displayMax}
                />
            </div>
        </div>
    );
}
