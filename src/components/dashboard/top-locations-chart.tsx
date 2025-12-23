'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/axios';

interface LocationData {
    name: string;
    offPlan: number;
    forRent: number;
    forSell: number;
    total: number;
}

export function TopLocationsChart() {
    const [viewBy, setViewBy] = useState('listing');
    const [data, setData] = useState<LocationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        offPlan: true,
        forRent: true,
        forSell: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Determine viewBy param - mapping 'impression' to valid backend param even if not implemented
                const viewParam = viewBy === 'impression' ? 'impression' : (viewBy === 'leads' ? 'leads' : 'listing');
                const response = await api.get<LocationData[]>(`/properties/top-locations?viewBy=${viewParam}`);
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch top locations:', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [viewBy]);

    // Derived state for chart data
    const chartData = React.useMemo(() => {
        if (!data || data.length === 0) return [];

        if (viewBy === 'leads') {
            // For leads, we just sort by total (which is stored in forSell bucket loosely or total) and take top 5
            return [...data]
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map(item => ({ ...item, leads: item.forSell })); // Remap 'forSell' count to 'leads' for chart key
        }

        // For Listings, filter based on checkboxes
        const processed = data.map(item => {
            const currentTotal =
                (filters.offPlan ? item.offPlan : 0) +
                (filters.forRent ? item.forRent : 0) +
                (filters.forSell ? item.forSell : 0);
            return { ...item, displayTotal: currentTotal };
        });

        // Sort by the calculated displayTotal and slice top 5
        return processed
            .filter(item => item.displayTotal > 0)
            .sort((a, b) => b.displayTotal - a.displayTotal)
            .slice(0, 5);
    }, [data, viewBy, filters]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[150px] z-50 relative">
                    <p className="font-bold mb-2 text-[#1A1A1A]">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                            <span className="capitalize">{entry.name === 'leads' ? 'Total Interest' : entry.name.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-semibold text-gray-900">{entry.value}</span></span>
                        </div>
                    ))}
                    {viewBy === 'listing' && (
                        <div className="mt-2 pt-2 border-t border-gray-100 font-medium text-xs text-gray-500">
                            Total: {payload.reduce((acc: number, entry: any) => acc + entry.value, 0)}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-8 rounded-[20px] border border-[#EDF1F7] mb-8">
            <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-8">Top Locations</h3>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <RadioGroup value={viewBy} onValueChange={setViewBy} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="listing" id="listing" className={`${viewBy === 'listing' ? 'text-[#EF4444] border-[#EF4444]' : 'border-gray-300'}`} />
                        <Label htmlFor="listing" className="font-bold text-[#1A1A1A] cursor-pointer">By Listing</Label>
                    </div>
                    {/* By Impression - Disabled visuals */}
                    <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                        <RadioGroupItem value="impression" id="impression" className="border-gray-300" disabled />
                        <Label htmlFor="impression" className="font-medium text-[#8F9BB3]">By Impression</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="leads" id="leads" className={`${viewBy === 'leads' ? 'text-[#EF4444] border-[#EF4444]' : 'border-gray-300'}`} />
                        <Label htmlFor="leads" className="font-bold text-[#1A1A1A] cursor-pointer">By Leads</Label>
                    </div>
                </RadioGroup>

                {/* Show filters only for listing view */}
                {viewBy === 'listing' && (
                    <div className="flex gap-6 animate-in fade-in duration-300">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="offPlan"
                                checked={filters.offPlan}
                                onCheckedChange={(c) => setFilters(prev => ({ ...prev, offPlan: !!c }))}
                                className="border-[#0EA5E9] data-[state=checked]:bg-[#0EA5E9] data-[state=checked]:border-[#0EA5E9] rounded-[4px]"
                            />
                            <Label htmlFor="offPlan" className="text-sm font-medium text-[#64748B] cursor-pointer">Off Plan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forRent"
                                checked={filters.forRent}
                                onCheckedChange={(c) => setFilters(prev => ({ ...prev, forRent: !!c }))}
                                className="border-[#7DD3FC] data-[state=checked]:bg-[#7DD3FC] data-[state=checked]:border-[#7DD3FC] rounded-[4px]"
                            />
                            <Label htmlFor="forRent" className="text-sm font-medium text-[#64748B] cursor-pointer">For Rent</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="forSell"
                                checked={filters.forSell}
                                onCheckedChange={(c) => setFilters(prev => ({ ...prev, forSell: !!c }))}
                                className="border-[#BAE6FD] data-[state=checked]:bg-[#BAE6FD] data-[state=checked]:border-[#BAE6FD] rounded-[4px]"
                            />
                            <Label htmlFor="forSell" className="text-sm font-medium text-[#64748B] cursor-pointer">For Sell</Label>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-[250px] w-full mb-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No location data available for selected criteria
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                            barSize={24}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#EDF1F7" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={120}
                                tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />

                            {viewBy === 'listing' ? (
                                <>
                                    {filters.offPlan && <Bar dataKey="offPlan" stackId="a" fill="#0EA5E9" radius={[0, 0, 0, 0]} />}
                                    {filters.forRent && <Bar dataKey="forRent" stackId="a" fill="#7DD3FC" radius={[0, 0, 0, 0]} />}
                                    {filters.forSell && <Bar dataKey="forSell" stackId="a" fill="#BAE6FD" radius={[0, 4, 4, 0]} />}
                                </>
                            ) : (
                                // For leads, single bar
                                <Bar dataKey="leads" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="leads" />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
