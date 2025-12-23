'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivityLogs } from '@/services/activity.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Undo2, Loader2, Calendar, ChevronDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActivityPage() {
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<'Last 7 Days' | 'Today' | 'This Month' | 'Custom Range'>('Last 7 Days');

    // Custom date range state (YYYY-MM-DD strings for input type="date")
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Compute date parameters for API
    const dateParams = useMemo(() => {
        const now = new Date();

        switch (filterMode) {
            case 'Today':
                return {
                    startDate: startOfDay(now).toISOString(),
                    endDate: endOfDay(now).toISOString()
                };
            case 'Last 7 Days':
                return {
                    startDate: subDays(now, 7).toISOString(),
                    endDate: endOfDay(now).toISOString()
                };
            case 'This Month':
                return {
                    startDate: startOfMonth(now).toISOString(),
                    endDate: endOfMonth(now).toISOString()
                };
            case 'Custom Range':
                if (customStart && customEnd) {
                    return {
                        startDate: startOfDay(new Date(customStart)).toISOString(),
                        endDate: endOfDay(new Date(customEnd)).toISOString()
                    };
                }
                return {}; // No filter if dates incomplete
            default:
                return {};
        }
    }, [filterMode, customStart, customEnd]);

    const { data: logs, isLoading } = useQuery({
        queryKey: ['activity-logs', search, dateParams],
        queryFn: () => getActivityLogs({
            search,
            take: 50, // Increased limit for better visibility
            startDate: dateParams.startDate,
            endDate: dateParams.endDate
        }),
    });

    const formatAction = (action: string) => {
        // Simple heuristic to highlight the action verb
        const parts = action.split(' ');
        if (parts.length > 0) {
            return (
                <span>
                    <span className="text-[#00B7FF] font-medium">{parts[0]}</span> {parts.slice(1).join(' ')}
                </span>
            );
        }
        return action;
    };

    return (
        <div className="p-8 space-y-6 bg-white min-h-screen font-sans">
            {/* Header / Search */}
            <div className="flex justify-between items-center mb-8">
                <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search for user"
                        className="pl-10 h-[44px] rounded-[12px] border-[#E5E7EB] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:border-[#00B7FF] focus:ring-0 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-[44px] px-4 rounded-[12px] border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] gap-2 font-normal min-w-[140px] justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    {filterMode}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem onClick={() => setFilterMode('Last 7 Days')}>
                                Last 7 Days
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterMode('Today')}>
                                Today
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterMode('This Month')}>
                                This Month
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilterMode('Custom Range')}>
                                Custom Range
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {filterMode === 'Custom Range' && (
                        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-[12px] px-3 h-[44px]">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="text-[13px] text-gray-600 focus:outline-none font-medium"
                                max={customEnd}
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="text-[13px] text-gray-600 focus:outline-none font-medium"
                                min={customStart}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[200px_300px_1fr_200px] gap-4 px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-t-[16px] text-[13px] font-semibold text-[#1F2937] items-center">
                <div>Date and time</div>
                <div>User</div>
                <div>Action</div>
                <div>IP Address</div>
            </div>

            {/* Table Body */}
            <div className="border-x border-b border-[#E5E7EB] rounded-b-[16px] overflow-hidden">
                {isLoading ? (
                    // Skeleton loading rows
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-[200px_300px_1fr_200px] gap-4 px-6 py-4 border-b border-[#E5E7EB] last:border-0 animate-pulse items-center">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                <div className="space-y-1.5">
                                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                                    <div className="h-3 w-36 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                            <div className="h-4 w-48 bg-gray-200 rounded"></div>
                            <div className="space-y-1.5">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                <div className="h-3 w-20 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : logs && logs.length > 0 ? (
                    logs.map((log: any) => (
                        <div key={log.id} className="grid grid-cols-[200px_300px_1fr_200px] gap-4 px-6 py-4 border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50 items-center text-[14px] text-[#374151]">
                            {/* Date */}
                            <div className="text-[#374151]">
                                {format(new Date(log.createdAt), 'MM/dd/yyyy, h:mm a')}
                            </div>

                            {/* User */}
                            <div className="flex items-center gap-3">
                                {/* Using first letter fallback if no avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={log.user?.avatarUrl} />
                                    <AvatarFallback>{log.user?.fullName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium text-[#111827]">{log.user?.fullName || 'Unknown User'}</div>
                                    <div className="text-[12px] text-[#6B7280]">{log.user?.email}</div>
                                </div>
                            </div>

                            {/* Action */}
                            <div>
                                {formatAction(log.action)}
                            </div>

                            {/* IP & Location */}
                            <div>
                                <div className="font-medium text-[#111827]">{log.ipAddress || 'Unknown IP'}</div>
                                <div className="text-[12px] text-[#6B7280]">{log.location || 'Unknown Location'}</div>
                            </div>

                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">No activity found.</div>
                )}
            </div>
        </div >
    );
}
