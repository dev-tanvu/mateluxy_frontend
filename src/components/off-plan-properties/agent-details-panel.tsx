'use client';

import React from 'react';
import { Globe, Languages, Phone, Mail, MapPin, User, CheckCircle } from 'lucide-react';
import { Agent } from '@/lib/services/agent.service';

interface AgentDetailsPanelProps {
    agent: Agent | null;
    onAssign: (agent: Agent) => void;
    isAssigned: boolean;
}

export function AgentDetailsPanel({ agent, onAssign, isAssigned }: AgentDetailsPanelProps) {
    if (!agent) {
        return (
            <div className="h-full border border-[#EDF1F7] rounded-2xl bg-white p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Selected</h3>
                <p className="text-gray-500 text-sm">Select an agent from the list to view their details</p>
            </div>
        );
    }

    return (
        <div className="h-full border border-[#EDF1F7] rounded-2xl bg-white p-6 flex flex-col">
            <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FFD700] bg-[#FFD700] mb-3 relative">
                    {agent.photoUrl ? (
                        <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <User className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{agent.name}</h2>
            </div>

            <div className="space-y-4 flex-1">
                {/* Nationality */}
                <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Nationality : {agent.nationality || 'N/A'}</span>
                </div>

                {/* Languages */}
                <div className="flex items-start gap-3 text-gray-600">
                    <Languages className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">Speaks {agent.languages?.join(', ') || 'N/A'}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{agent.phone}</span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{agent.email}</span>
                </div>

                {/* Expert Areas */}
                <div className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm">
                        Expert in {agent.areasExpertIn?.join(', ') || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 mt-auto">
                <button
                    onClick={() => onAssign(agent)}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${isAssigned
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                        }`}
                >
                    {isAssigned ? 'Remove' : 'Assign to property'}
                </button>
            </div>
        </div>
    );
}
