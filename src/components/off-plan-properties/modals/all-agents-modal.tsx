'use client';

import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Agent } from '@/lib/services/agent.service';
import { AgentGridItem } from '../agent-grid-item';
import { cn } from '@/lib/utils';

interface AllAgentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    agents: Agent[];
    selectedAgentIds: string[];
    onSelectAgent: (agent: Agent) => void;
    view: 'area' | 'project' | 'area-multi';
    activeAgentId?: string; // For area view, the currently viewed agent
}

export function AllAgentsModal({
    isOpen,
    onClose,
    agents,
    selectedAgentIds,
    onSelectAgent,
    view,
    activeAgentId
}: AllAgentsModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isMultiSelectMode = view === 'area-multi' || view === 'project';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-5xl mx-4 h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">All Agents</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Input
                        type="text"
                        placeholder="Search for agent..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[50px] pl-12 bg-white border-[#EDF1F7] rounded-lg placeholder:text-gray-400 w-full"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAgents.map(agent => (
                            <div
                                key={agent.id}
                                className="relative"
                            >
                                <AgentGridItem
                                    agent={agent}
                                    isSelected={selectedAgentIds.includes(agent.id)}
                                    isActive={view === 'area' && activeAgentId === agent.id}
                                    onClick={() => {
                                        onSelectAgent(agent);
                                        if (view === 'area') {
                                            onClose(); // Close modal on selection for area view (to show details)
                                        }
                                    }}
                                />
                                {/* Checkbox for multi-select modes */}
                                {isMultiSelectMode && (
                                    <div
                                        className="absolute top-3 right-3"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectAgent(agent);
                                        }}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                                            selectedAgentIds.includes(agent.id)
                                                ? "bg-[#00B7FF] border-[#00B7FF]"
                                                : "bg-white border-gray-300 hover:border-[#00B7FF]"
                                        )}>
                                            {selectedAgentIds.includes(agent.id) && (
                                                <Check className="h-4 w-4 text-white" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {filteredAgents.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <p>No agents found matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>

                {/* Footer with Done button for multi-select */}
                {isMultiSelectMode && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-[#00B7FF] text-white rounded-lg hover:bg-[#00A0E3] transition-colors font-medium"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
