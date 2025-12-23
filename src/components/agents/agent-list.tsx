'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAgents } from '@/lib/hooks/use-agents';
import { AgentCard } from './agent-card';
import { AgentCardSkeleton } from './agent-card-skeleton';
import { Agent } from '@/lib/services/agent.service';
import { VirtuosoGrid } from 'react-virtuoso';

interface AgentListProps {
    search?: string;
    filterStatus?: boolean;
    onEdit: (agent: Agent) => void;
    onDelete: (agent: Agent) => void;
}

export function AgentList({ search, filterStatus, onEdit, onDelete }: AgentListProps) {
    const { data: agents, isLoading, error } = useAgents(search);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <AgentCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 w-full items-center justify-center text-red-500">
                Failed to load agents
            </div>
        );
    }

    const filteredAgents = agents?.filter(agent => {
        if (filterStatus === undefined) return true;
        return agent.isActive === filterStatus;
    });

    if (!filteredAgents || filteredAgents.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center text-gray-500">
                No agents found
            </div>
        );
    }

    return (
        <VirtuosoGrid
            style={{ height: '100%' }}
            totalCount={filteredAgents.length}
            overscan={200}
            components={{
                List: React.forwardRef(({ style, children, ...props }: any, ref) => (
                    <div
                        ref={ref}
                        {...props}
                        style={{
                            ...style,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '24px',
                            paddingBottom: '32px'
                        }}
                    >
                        {children}
                    </div>
                )),
                Item: ({ children, ...props }: any) => (
                    <div {...props} className="flex justify-center">
                        {children}
                    </div>
                )
            }}
            itemContent={(index: number) => (
                <AgentCard
                    agent={filteredAgents[index]}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        />
    );
}
