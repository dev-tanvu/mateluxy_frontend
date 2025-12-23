'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/axios';

interface TendencyData {
    name: string;
    value: number;
}

interface RevenueTendencyResponse {
    selling: TendencyData[];
    renting: TendencyData[];
}

export function TendencyChart() {
    const [activeTab, setActiveTab] = useState<'selling' | 'renting'>('selling');
    const [data, setData] = useState<RevenueTendencyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<RevenueTendencyResponse>('/properties/revenue-tendency');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch revenue tendency data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = activeTab === 'selling' ? data?.selling : data?.renting;

    // Format value with K, M, or B suffix
    const formatValue = (value: number): string => {
        if (value >= 1000000000) {
            return `${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#EDF1F7] mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Property Revenue Tendency UAE</h3>
                <div className="flex bg-[#F7F9FC] p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('selling')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'selling'
                            ? 'bg-white text-[#1A1A1A] shadow-sm'
                            : 'text-[#8F9BB3] hover:text-[#1A1A1A]'
                            }`}
                    >
                        Selling Revenue
                    </button>
                    <button
                        onClick={() => setActiveTab('renting')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'renting'
                            ? 'bg-white text-[#1A1A1A] shadow-sm'
                            : 'text-[#8F9BB3] hover:text-[#1A1A1A]'
                            }`}
                    >
                        Renting Revenue
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData || []}
                            margin={{
                                top: 10,
                                right: 0,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0BA5EC" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0BA5EC" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#EDF1F7" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#8F9BB3', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#8F9BB3', fontSize: 12 }}
                                tickFormatter={(value) => formatValue(value)}
                            />
                            <Tooltip
                                formatter={(value) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #EDF1F7',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#0BA5EC"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

