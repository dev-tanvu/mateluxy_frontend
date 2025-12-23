'use client';

import React, { Suspense, lazy } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';

// Lazy load heavy chart components for faster initial page load
const TendencyChart = lazy(() => import('@/components/dashboard/tendency-chart').then(m => ({ default: m.TendencyChart })));
const CategoryCharts = lazy(() => import('@/components/dashboard/category-charts').then(m => ({ default: m.CategoryCharts })));
const TopLocationsChart = lazy(() => import('@/components/dashboard/top-locations-chart').then(m => ({ default: m.TopLocationsChart })));
const AgentStats = lazy(() => import('@/components/dashboard/agent-stats').then(m => ({ default: m.AgentStats })));
const LeadStats = lazy(() => import('@/components/dashboard/lead-stats').then(m => ({ default: m.LeadStats })));

// Loading skeleton for chart sections
function ChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div
            className="bg-white rounded-[20px] border border-[#EDF1F7] animate-pulse"
            style={{ height }}
        >
            <div className="p-6">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-full bg-gray-100 rounded-lg"></div>
            </div>
        </div>
    );
}

// Loading skeleton for sidebar sections
function SidebarSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-[20px] border border-[#EDF1F7] h-[180px]"></div>
            <div className="bg-white rounded-[20px] border border-[#EDF1F7] h-[200px]"></div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#ffffff] p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Stats Row - Load immediately for fast first paint */}
                <StatsCards />

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 mb-8">
                    {/* Left Column - Main Charts (Lazy loaded) */}
                    <div className="flex flex-col gap-0">
                        {/* Tendency Chart */}
                        <Suspense fallback={<ChartSkeleton height={350} />}>
                            <TendencyChart />
                        </Suspense>

                        {/* Category Charts Row */}
                        <Suspense fallback={<ChartSkeleton height={280} />}>
                            <CategoryCharts />
                        </Suspense>
                    </div>

                    {/* Right Column - Sidebar Stats (Lazy loaded) */}
                    <div className="flex flex-col gap-8">
                        {/* Agent Stats (Best Agent + Top Agents) */}
                        <Suspense fallback={<SidebarSkeleton />}>
                            <AgentStats />
                        </Suspense>

                        {/* Lead Stats */}
                        <Suspense fallback={<ChartSkeleton height={180} />}>
                            <LeadStats />
                        </Suspense>
                    </div>
                </div>

                {/* Top Locations - Full Width */}
                <Suspense fallback={<ChartSkeleton height={320} />}>
                    <TopLocationsChart />
                </Suspense>
            </div>
        </div>
    );
}
