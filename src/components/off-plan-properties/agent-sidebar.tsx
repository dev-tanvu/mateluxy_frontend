'use client';

import React from 'react';
import { X, Globe, Languages, Phone, Mail, MapPin, User } from 'lucide-react';
import { Agent } from '@/lib/services/agent.service';

interface AgentSidebarProps {
    agent: Agent | null;
    isOpen: boolean;
    onClose: () => void;
    onAssign: (agent: Agent) => void;
    isAssigned: boolean;
}

export function AgentSidebar({ agent, isOpen, onClose, onAssign, isAssigned }: AgentSidebarProps) {
    if (!isOpen || !agent) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <X className="h-5 w-5 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 mb-4">
                        {agent.photoUrl ? (
                            <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <User className="h-12 w-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
                </div>

                <div className="space-y-6">
                    {/* Nationality */}
                    <div className="flex items-center gap-3 text-gray-600">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <span className="text-[15px]">Nationality : {agent.nationality || 'N/A'}</span>
                    </div>

                    {/* Languages */}
                    <div className="flex items-start gap-3 text-gray-600">
                        <Languages className="h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="text-[15px]">Speaks {agent.languages?.join(', ') || 'N/A'}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-[15px]">{agent.phone}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-[15px]">{agent.email}</span>
                    </div>

                    {/* Expert Areas */}
                    <div className="flex items-start gap-3 text-gray-600">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <span className="text-[15px]">
                            Expert in {agent.areasExpertIn?.join(', ') || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
                <button
                    onClick={() => onAssign(agent)}
                    disabled={isAssigned}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${isAssigned
                            ? 'bg-green-50 text-green-600 cursor-default'
                            : 'bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD]'
                        }`}
                >
                    {isAssigned ? 'Assigned to property' : 'Assign to property'}
                </button>
            </div>
        </div>
    );
}
