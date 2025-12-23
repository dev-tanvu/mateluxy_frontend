'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api/axios';

interface CategoryData {
    name: string;
    residential: number;
    commercial: number;
}

interface CategoryTendencyResponse {
    forBuy: CategoryData[];
    forRent: CategoryData[];
}

interface CategoryChartProps {
    title: string;
    data: CategoryData[];
    isLoading: boolean;
}

function CategoryChart({ title, data, isLoading }: CategoryChartProps) {
    const [showResidential, setShowResidential] = useState(true);
    const [showCommercial, setShowCommercial] = useState(true);

    // Calculate max value for Y axis
    const maxValue = Math.max(
        ...data.map(d => Math.max(d.residential, d.commercial)),
        10 // Minimum of 10 to avoid empty chart
    );
    const yAxisMax = Math.ceil(maxValue / 10) * 10 + 10;

    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#EDF1F7] flex-1">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-[16px] font-bold text-[#1A1A1A]">{title}</h3>
                <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`res-${title}`}
                            checked={showResidential}
                            onCheckedChange={(c) => setShowResidential(!!c)}
                            className="border-[#0BA5EC] data-[state=checked]:bg-[#0BA5EC]"
                        />
                        <label
                            htmlFor={`res-${title}`}
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#8F9BB3]"
                        >
                            Residential
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`com-${title}`}
                            checked={showCommercial}
                            onCheckedChange={(c) => setShowCommercial(!!c)}
                            className="border-[#0BA5EC] data-[state=checked]:bg-[#0BA5EC]"
                        />
                        <label
                            htmlFor={`com-${title}`}
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#8F9BB3]"
                        >
                            Commercial
                        </label>
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
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
                                domain={[0, yAxisMax]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #EDF1F7',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            />
                            {showResidential && (
                                <Line
                                    type="monotone"
                                    dataKey="residential"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 4 }}
                                />
                            )}
                            {showCommercial && (
                                <Line
                                    type="monotone"
                                    dataKey="commercial"
                                    stroke="#FFCDD2"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 4 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export function CategoryCharts() {
    const [data, setData] = useState<CategoryTendencyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<CategoryTendencyResponse>('/properties/category-tendency');
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch category tendency data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
            <CategoryChart
                title="For Buy"
                data={data?.forBuy || []}
                isLoading={isLoading}
            />
            <CategoryChart
                title="For Rent"
                data={data?.forRent || []}
                isLoading={isLoading}
            />
        </div>
    );
}

