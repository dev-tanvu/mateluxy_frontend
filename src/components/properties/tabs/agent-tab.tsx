'use client';

import React, { useState, useEffect } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ChevronDown, Check, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgents } from '@/lib/hooks/use-agents';
import { Agent } from '@/lib/services/agent.service';
import { AgentDetailsPanel } from '@/components/off-plan-properties/agent-details-panel';

interface AgentTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

export function AgentTab({ register, control, errors, setValue, watch }: AgentTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showMore, setShowMore] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Fetch agents from database
    const { data: agents = [], isLoading } = useAgents(searchQuery, true);

    const assignedAgentId = watch('assignedAgentId');

    // Initialize selectedAgent from assignedAgentId once agents are loaded
    useEffect(() => {
        if (!hasInitialized && agents.length > 0 && assignedAgentId) {
            const agent = agents.find(a => a.id === assignedAgentId);
            if (agent) {
                setSelectedAgent(agent);
                setHasInitialized(true);
            }
        }
    }, [agents, assignedAgentId, hasInitialized]);

    const handleSelectAgent = (agent: Agent) => {
        setSelectedAgent(agent);
    };

    const handleAssignToProperty = (agent: Agent) => {
        // If already assigned, unassign. Otherwise assign.
        if (assignedAgentId === agent.id) {
            setValue('assignedAgentId', '');
        } else {
            setValue('assignedAgentId', agent.id, { shouldValidate: true, shouldDirty: true });
        }
    };

    // Filter active agents and limit display
    const activeAgents = agents.filter(agent => agent.isActive);
    const displayedAgents = showMore ? activeAgents : activeAgents.slice(0, 10);

    return (
        <div className="space-y-6">
            <Label className="text-[15px] font-medium text-gray-700">
                Agent <span className="text-red-500">*</span>
            </Label>

            <div className="flex gap-8 items-start">
                {/* Left Side: Agent List */}
                <div className="w-[650px] space-y-4 flex-shrink-0">
                    <div className="relative">
                        <Input
                            placeholder="Search for agent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px] pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">Loading agents...</div>
                    ) : activeAgents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">No agents found</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                {displayedAgents.map((agent) => (
                                    <div
                                        key={agent.id}
                                        onClick={() => handleSelectAgent(agent)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border",
                                            selectedAgent?.id === agent.id
                                                ? "bg-[#E8F7FF] border-[#00AAFF]"
                                                : "bg-white hover:bg-gray-50 border-transparent",
                                            assignedAgentId === agent.id ? "ring-2 ring-green-500 border-green-500" : ""
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                            {agent.photoUrl ? (
                                                <img src={agent.photoUrl} alt={agent.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                                                    {agent.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-medium text-gray-900 truncate">{agent.name}</p>
                                            <p className="text-[12px] text-gray-400 truncate">
                                                {agent.languages?.length ? `Speaks ${agent.languages.join(', ')}` : agent.position}
                                            </p>
                                        </div>
                                        {assignedAgentId === agent.id && <Check className="w-4 h-4 text-green-500" />}
                                    </div>
                                ))}
                            </div>
                            {activeAgents.length > 10 && (
                                <button type="button" onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-gray-400 text-sm hover:text-gray-600 transition-colors">
                                    <ChevronDown className={cn("w-4 h-4 transition-transform", showMore && "rotate-180")} />
                                    {showMore ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: Agent Details Panel - Same as Off-Plan Property */}
                <div className="w-[320px] flex-shrink-0">
                    <AgentDetailsPanel
                        agent={selectedAgent}
                        onAssign={handleAssignToProperty}
                        isAssigned={selectedAgent ? assignedAgentId === selectedAgent.id : false}
                    />
                </div>
            </div>

            {/* Hidden Input for validation if needed */}
            <input type="hidden" {...register('assignedAgentId', { required: 'Agent is required' })} />
            {errors.assignedAgentId && <p className="text-sm text-red-500">{errors.assignedAgentId.message as string}</p>}
        </div>
    );
}
