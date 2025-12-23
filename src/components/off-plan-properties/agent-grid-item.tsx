'use client';

import React from 'react';
import { User } from 'lucide-react';
import { Agent } from '@/lib/services/agent.service';

interface AgentGridItemProps {
    agent: Agent;
    isSelected: boolean;
    isActive: boolean;
    onClick: () => void;
}

export function AgentGridItem({ agent, isSelected, isActive, onClick }: AgentGridItemProps) {
    return (
        <div
            onClick={onClick}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${isActive || isSelected
                ? 'bg-[#F0F9FF] border-[#00B7FF]'
                : 'bg-white border-[#EDF1F7] hover:border-gray-300'
                }`}
        >
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                {agent.photoUrl ? (
                    <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                <p className="text-xs text-gray-500 truncate">
                    {agent.areasExpertIn && agent.areasExpertIn.length > 0
                        ? `Expert in ${agent.areasExpertIn.slice(0, 2).join(', ')}`
                        : 'No area is defined'
                    }
                </p>
            </div>
        </div>
    );
}
