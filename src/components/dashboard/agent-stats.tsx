
import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { agentService } from '@/lib/services/agent.service';

function CircularProgress({ value, color }: { value: number; color: string }) {
    // Use a max of 100 for display purposes
    const displayValue = Math.min(value, 99);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    // For agents with deals, show at least 20% progress, max 100%
    const percentage = value > 0 ? Math.min(20 + (value * 8), 100) : 0;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="transform -rotate-90 w-12 h-12">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="#F1F5F9"
                    strokeWidth="3"
                    fill="transparent"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke={color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-[12px] font-bold text-[#1A1A1A]">{displayValue}</span>
        </div>
    );
}

export function AgentStats() {
    const { data: topAgents = [], isLoading } = useQuery({
        queryKey: ['topAgents'],
        queryFn: () => agentService.getTopAgents(5),
    });

    // Get the best agent (first in list) and remaining top agents
    const bestAgent = topAgents[0];
    const remainingAgents = topAgents.slice(1, 4); // Show next 3 agents

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="mb-2">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="bg-gray-100 rounded-[20px] h-[180px]"></div>
                </div>
                <div>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                    <div className="bg-gray-100 rounded-[20px] h-[200px]"></div>
                </div>
            </div>
        );
    }

    // No agents with deals
    if (!bestAgent) {
        return (
            <div className="space-y-6">
                <div className="mb-2">
                    <h3 className="text-[#8F9BB3] text-[16px] font-medium mb-4">Best Selling Agent</h3>
                    <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] border border-[#EDF1F7] rounded-[20px] p-5 h-[120px] flex items-center justify-center">
                        <p className="text-[#8F9BB3] text-sm">No agents with sold/rented properties yet</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-[#8F9BB3] text-sm font-medium mb-4">Top agents</h3>
                    <div className="bg-white rounded-[20px] border border-[#EDF1F7] p-5">
                        <p className="text-[#8F9BB3] text-sm text-center">No data available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <h3 className="text-[#8F9BB3] text-[14px] font-medium mb-4">Best Selling Agent</h3>
                <div className="bg-white border border-[#FFC300] rounded-[20px] p-4 relative overflow-hidden flex items-center h-[96px]">

                    {/* Ellipse 1: x: 250px, y: -47px */}
                    <div
                        className="absolute rounded-full pointer-events-none blur-[50px]"
                        style={{
                            width: '116px',
                            height: '116px',
                            left: '250px',
                            top: '-47px',
                            backgroundColor: '#FFDB6E',
                            opacity: 0.63
                        }}
                    />

                    {/* Ellipse 2: x: -13px, y: 77px */}
                    <div
                        className="absolute rounded-full pointer-events-none blur-[50px]"
                        style={{
                            width: '116px',
                            height: '116px',
                            left: '-13px',
                            top: '77px',
                            backgroundColor: '#FFDB6E',
                            opacity: 0.63
                        }}
                    />

                    <div className="flex items-center gap-4 relative z-10 pl-2 w-full">
                        {/* Profile Image Container */}
                        <div className="relative shrink-0">
                            {/* Crown "wearing" position - Adjusted for SVG */}
                            <div className="absolute -top-4 -left-3 z-20 transform -rotate-12">
                                <Image
                                    src="/crown_icon.svg"
                                    alt="Crown"
                                    width={28}
                                    height={28}
                                    className="w-8 h-8"
                                />
                            </div>

                            <div className="w-[60px] h-[60px] rounded-full overflow-hidden shadow-sm bg-gray-100 relative z-10">
                                {bestAgent.photoUrl ? (
                                    <img src={bestAgent.photoUrl} alt={bestAgent.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                                        {bestAgent.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">{bestAgent.name}</h4>
                            <p className="text-[#94A3B8] text-[12px] font-normal">{bestAgent.position}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-[#8F9BB3] text-[14px] font-medium mb-4">Top agents</h3>
                <div className="bg-white rounded-[20px] border border-[#EDF1F7] p-5 space-y-5">
                    {remainingAgents.length === 0 ? (
                        <p className="text-[#8F9BB3] text-sm text-center">No other agents with deals</p>
                    ) : (
                        remainingAgents.map((agent) => (
                            <div key={agent.id} className="flex items-center gap-4 pb-4 last:pb-0 border-b border-[#EDF1F7] last:border-0 last:mb-0">
                                <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-gray-100 shrink-0">
                                    {agent.photoUrl ? (
                                        <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                                            {agent.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-bold text-[#1A1A1A] leading-tight">{agent.name}</h4>
                                    <p className="text-[#94A3B8] text-[12px] font-normal mt-0.5">{agent.position}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
