'use client';

import React, { useState, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { MapPin, X, Plus, Check, Users } from 'lucide-react';
import { useAgentsByArea, useAgents } from '@/lib/hooks/use-agents';
import { Agent } from '@/lib/services/agent.service';
import { AgentDetailsPanel } from '../agent-details-panel';
import { AgentGridItem } from '../agent-grid-item';
import { AllAgentsModal } from '../modals/all-agents-modal';
import { LocationAutocompleteDropdown } from '../location-autocomplete-dropdown';
import { cn } from '@/lib/utils';

interface AgentTabProps {
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

export function AgentTab({ register, setValue, watch }: AgentTabProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isAllAgentsModalOpen, setIsAllAgentsModalOpen] = useState(false);
    const [currentModalLocation, setCurrentModalLocation] = useState<string>('');
    const [viewMode, setViewMode] = useState<'area' | 'project'>('area'); // 'area' or 'project'
    const [visibleProjectExpertsCount, setVisibleProjectExpertsCount] = useState(6);

    // Watch for area experts data structure: { [location: string]: string[] }

    // Watch for area experts data structure: { [location: string]: string[] }
    const areaExperts = watch('areaExperts') || {};

    // Fetch agents for selected location
    const { data: locationAgents = [] } = useAgentsByArea(selectedLocation);

    // Fetch all active agents for Project Experts
    const { data: allAgents = [] } = useAgents();

    // Watch for project experts array: string[]
    const projectExperts = watch('projectExperts') || [];

    // Get selected agent IDs for current location
    const selectedAgentIdsForLocation = selectedLocation ? (areaExperts[selectedLocation] || []) : [];

    // Sort agents: Selected first, then others
    const sortedAgents = [...locationAgents].sort((a, b) => {
        const aSelected = selectedAgentIdsForLocation.includes(a.id);
        const bSelected = selectedAgentIdsForLocation.includes(b.id);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    });

    // Filter only active agents for Project Experts
    const activeProjectExperts = allAgents.filter(agent => agent.isActive);
    const displayedProjectExperts = activeProjectExperts.slice(0, visibleProjectExpertsCount);

    const displayedAgents = sortedAgents.slice(0, 6);
    const totalAgentsCount = locationAgents.length;

    useEffect(() => {
        register('areaExperts');
        register('projectExperts');
    }, [register]);

    // Auto-select first location if data exists
    useEffect(() => {
        if (!selectedLocation && Object.keys(areaExperts).length > 0) {
            setSelectedLocation(Object.keys(areaExperts)[0]);
        }
    }, [areaExperts, selectedLocation]);

    const handleLocationSelect = (location: string) => {
        setSelectedLocation(location);
    };

    const handleAgentClick = (agent: Agent) => {
        setSelectedAgent(agent);
    };

    const handleToggleAgent = (agent: Agent) => {
        const currentExperts = { ...areaExperts };
        const currentLocationAgents = currentExperts[selectedLocation] || [];

        if (currentLocationAgents.includes(agent.id)) {
            // Remove agent
            const updated = currentLocationAgents.filter((id: string) => id !== agent.id);
            if (updated.length === 0) {
                delete currentExperts[selectedLocation];
            } else {
                currentExperts[selectedLocation] = updated;
            }
        } else {
            // Add agent
            currentExperts[selectedLocation] = [...currentLocationAgents, agent.id];
        }

        setValue('areaExperts', Object.keys(currentExperts).length > 0 ? currentExperts : undefined, {
            shouldValidate: true,
            shouldDirty: true
        });
    };

    const handleRemoveLocationGroup = (location: string) => {
        const currentExperts = { ...areaExperts };
        delete currentExperts[location];
        setValue('areaExperts', Object.keys(currentExperts).length > 0 ? currentExperts : undefined, {
            shouldValidate: true,
            shouldDirty: true
        });

        // If we're removing the currently selected location, clear it
        if (selectedLocation === location) {
            setSelectedLocation('');
        }
    };

    const handleOpenAllAgentsModal = () => {
        setCurrentModalLocation(selectedLocation);
        setIsAllAgentsModalOpen(true);
    };

    const handleToggleProjectExpert = (agent: Agent) => {
        const currentProjectExperts = [...projectExperts];

        if (currentProjectExperts.includes(agent.id)) {
            // Remove agent
            const updated = currentProjectExperts.filter(id => id !== agent.id);
            setValue('projectExperts', updated, { shouldValidate: true, shouldDirty: true });
        } else {
            // Add agent
            const updated = [...currentProjectExperts, agent.id];
            setValue('projectExperts', updated, { shouldValidate: true, shouldDirty: true });
        }
    };

    const handleLoadMoreProjectExperts = () => {
        setVisibleProjectExpertsCount(prev => prev + 6);
    };

    const handleModalAgentToggle = (agent: Agent) => {
        handleToggleAgent(agent);
    };

    // Get all selected locations
    const selectedLocationsData = Object.keys(areaExperts);

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto">
            {/* Header */}
            {/* Header with Tabs */}
            <div className="flex items-center gap-6 mb-6 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setViewMode('area')}
                    className={cn(
                        "pb-3 text-[15px] font-medium transition-colors relative",
                        viewMode === 'area'
                            ? "text-[#00B7FF] border-b-2 border-[#00B7FF]"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Location Experts
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('project')}
                    className={cn(
                        "pb-3 text-[15px] font-medium transition-colors relative",
                        viewMode === 'project'
                            ? "text-[#00B7FF] border-b-2 border-[#00B7FF]"
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    Project Experts
                </button>
            </div>

            {/* Location-Agent Groups Display */}
            {selectedLocationsData.length > 0 && (
                <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-medium text-gray-700">Selected Locations & Agents</h3>
                    <div className="space-y-2">
                        {selectedLocationsData.map((location) => {
                            const agentCount = areaExperts[location].length;
                            return (
                                <div
                                    key={location}
                                    className="flex items-center justify-between bg-[#F7F9FC] border border-[#EDF1F7] rounded-lg px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-[#00B7FF]" />
                                        <div>
                                            <p className="text-[15px] font-medium text-gray-900">{location}</p>
                                            <p className="text-sm text-gray-500">{agentCount} agent{agentCount !== 1 ? 's' : ''} selected</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLocationGroup(location)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Area Experts Section - Only visible when viewMode is 'area' */}
            <div className={cn("flex gap-8 items-start", viewMode === 'project' && "hidden")}>
                {/* Left Column: Location Selection & Agents */}
                <div className="w-[650px] space-y-6 flex-shrink-0">
                    {/* Location Selection */}
                    <div className="space-y-2.5">
                        <label className="text-[15px] font-medium text-gray-700">
                            Select Location
                        </label>
                        <LocationAutocompleteDropdown
                            value={selectedLocation}
                            onChange={handleLocationSelect}
                            placeholder="Search for a location in Dubai..."
                        />
                        {selectedLocation && (
                            <p className="text-sm text-gray-500">
                                Showing agents expert in {selectedLocation}
                            </p>
                        )}
                    </div>

                    {/* Agents List (Grid of 2 columns) - Only show if location selected */}
                    {selectedLocation && (
                        <>
                            {locationAgents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {displayedAgents.map((agent: Agent) => (
                                            <div
                                                key={agent.id}
                                                className="relative"
                                                onClick={() => handleAgentClick(agent)}
                                            >
                                                <AgentGridItem
                                                    agent={agent}
                                                    isSelected={selectedAgentIdsForLocation.includes(agent.id)}
                                                    isActive={selectedAgent?.id === agent.id}
                                                    onClick={() => { }}
                                                />
                                                {/* Checkbox Overlay */}
                                                <div
                                                    className="absolute top-3 right-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleAgent(agent);
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                                                        selectedAgentIdsForLocation.includes(agent.id)
                                                            ? "bg-[#00B7FF] border-[#00B7FF]"
                                                            : "bg-white border-gray-300 hover:border-[#00B7FF]"
                                                    )}>
                                                        {selectedAgentIdsForLocation.includes(agent.id) && (
                                                            <Check className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View All Button */}
                                    {totalAgentsCount > 6 && (
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={handleOpenAllAgentsModal}
                                                className="text-[#00B7FF] hover:text-[#00A0E3] font-medium text-[15px] hover:underline"
                                            >
                                                View All Agents ({totalAgentsCount})
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <MapPin className="h-12 w-12 mb-3 text-gray-300" />
                                    <p className="text-[15px]">No agents found expert in {selectedLocation}</p>
                                    <p className="text-sm">Try selecting a different location</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Empty State - No Location Selected */}
                    {!selectedLocation && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                            <MapPin className="h-16 w-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium text-gray-700 mb-2">Select a location to start</p>
                            <p className="text-sm">Choose a location to see agents expert in that area</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Agent Details Panel */}
                <div className="w-[320px] flex-shrink-0">
                    <AgentDetailsPanel
                        agent={selectedAgent}
                        onAssign={handleToggleAgent}
                        isAssigned={selectedAgent ? selectedAgentIdsForLocation.includes(selectedAgent.id) : false}
                    />
                </div>
            </div>

            {/* Project Experts Section - Only visible when viewMode is 'project' */}
            <div className={cn("flex gap-8 items-start", viewMode === 'area' && "hidden")}>
                <div className="w-[650px] space-y-6 flex-shrink-0">
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
                        <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-[#00B7FF] mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Select Project Experts</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    These agents are experts on this specific project, regardless of location.
                                    They will be listed as "Project Experts" on the property page.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {displayedProjectExperts.map((agent: Agent) => (
                            <div
                                key={agent.id}
                                className="relative"
                                onClick={() => handleAgentClick(agent)}
                            >
                                <AgentGridItem
                                    agent={agent}
                                    isSelected={projectExperts.includes(agent.id)}
                                    isActive={selectedAgent?.id === agent.id}
                                    onClick={() => { }}
                                />
                                {/* Checkbox Overlay */}
                                <div
                                    className="absolute top-3 right-3"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleProjectExpert(agent);
                                    }}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                                        projectExperts.includes(agent.id)
                                            ? "bg-[#00B7FF] border-[#00B7FF]"
                                            : "bg-white border-gray-300 hover:border-[#00B7FF]"
                                    )}>
                                        {projectExperts.includes(agent.id) && (
                                            <Check className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {visibleProjectExpertsCount < activeProjectExperts.length && (
                        <div className="flex justify-center pt-4">
                            <button
                                type="button"
                                onClick={handleLoadMoreProjectExperts}
                                className="text-[#00B7FF] hover:text-[#00A0E3] font-medium text-[15px] hover:underline"
                            >
                                Load More Agents
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Agent Details Panel (Shared) */}
                <div className="w-[320px] flex-shrink-0">
                    <AgentDetailsPanel
                        agent={selectedAgent}
                        onAssign={viewMode === 'area' ? handleToggleAgent : handleToggleProjectExpert}
                        isAssigned={selectedAgent ? (
                            viewMode === 'area'
                                ? selectedAgentIdsForLocation.includes(selectedAgent.id)
                                : projectExperts.includes(selectedAgent.id)
                        ) : false}
                    />
                </div>
            </div>

            {/* All Agents Modal */}
            <AllAgentsModal
                isOpen={isAllAgentsModalOpen}
                onClose={() => setIsAllAgentsModalOpen(false)}
                agents={locationAgents}
                selectedAgentIds={selectedAgentIdsForLocation}
                onSelectAgent={handleModalAgentToggle}
                view="area-multi"
                activeAgentId={selectedAgent?.id}
            />
        </div>
    );
}
