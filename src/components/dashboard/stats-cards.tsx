import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    percentage: string;
    isPositive: boolean;
}

function StatCard({ title, value, trend, percentage, isPositive }: StatCardProps) {
    return (
        <div className="bg-[#FCFCFC] p-4 rounded-[12px] border border-[#EDF1F7] flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <span className="text-[#64748B] text-[13px] font-medium">{title}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isPositive ? 'bg-[#E3F9E5] text-[#22C55E]' : 'bg-[#FFE9E9] text-[#EF4444]'
                    }`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {percentage}
                </span>
            </div>
            <div>
                <span className="flex items-end mt-2">
                    <h3 className="text-[28px] font-bold text-[#1E293B] mr-3">{value}</h3>
                    <p className="text-[#94A3B8] text-[12px] mb-2 font-medium">{trend}</p>
                </span>
            </div>
        </div>
    );
}

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/property.service';

export function StatsCards() {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
    });

    if (isLoading || !statsData) {
        // Show loading skeletons or just static placeholders
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-[#FCFCFC] p-5 rounded-[20px] border border-[#EDF1F7] h-[140px] animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    const calculatePercentage = (count: number, trend: number) => {
        if (count - trend <= 0) return '100%';
        return `${Math.round((trend / (count - trend)) * 100)}%`;
    };

    const stats = [
        {
            title: 'Total active listing',
            value: statsData.active.count,
            trend: `+${statsData.active.trend} than last week`,
            percentage: calculatePercentage(statsData.active.count, statsData.active.trend),
            isPositive: true,
        },
        {
            title: 'Off plan',
            value: statsData.offPlan.count,
            trend: `+${statsData.offPlan.trend} than last week`,
            percentage: calculatePercentage(statsData.offPlan.count, statsData.offPlan.trend),
            isPositive: true,
        },
        {
            title: 'Sold properties',
            value: statsData.sold.count,
            trend: `+${statsData.sold.trend} this month`,
            percentage: calculatePercentage(statsData.sold.count, statsData.sold.trend),
            isPositive: true, // Sold increasing is positive business
        },
        {
            title: 'For rent',
            value: statsData.rent.count,
            trend: `+${statsData.rent.trend} new this month`,
            percentage: calculatePercentage(statsData.rent.count, statsData.rent.trend),
            isPositive: true,
        },
        {
            title: 'For Buy',
            value: statsData.buy.count,
            trend: `+${statsData.buy.trend} new this month`,
            percentage: calculatePercentage(statsData.buy.count, statsData.buy.trend),
            isPositive: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}
