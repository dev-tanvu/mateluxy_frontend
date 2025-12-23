'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { AgentList } from '@/components/agents/agent-list';
import dynamic from 'next/dynamic';

const AddAgentSheet = dynamic(
    () => import('@/components/agents/add-agent-sheet').then(mod => mod.AddAgentSheet),
    { ssr: false } // Sheets rely on portals/browser APIs often, and we don't need it for SEO
);
import { Agent } from '@/lib/services/agent.service';
import { useDeleteAgent } from '@/lib/hooks/use-agents';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { agentService } from '@/lib/services/agent.service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
// ... existing imports

export default function AgentsPage() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

    // Open add sheet if requested via URL
    React.useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setIsAddSheetOpen(true);
        }
    }, [searchParams]);

    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('active');

    const queryClient = useQueryClient();
    const { mutate: deleteAgent, isPending: isDeleting } = useDeleteAgent();

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await agentService.syncFromPropertyFinder();
            toast.success(result.message);
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        } catch (error) {
            toast.error('Failed to sync agents from Property Finder');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setIsAddSheetOpen(true);
    };

    const handleDelete = (agent: Agent) => {
        setDeletingAgent(agent);
    };

    const confirmDelete = () => {
        if (deletingAgent) {
            deleteAgent(deletingAgent.id, {
                onSuccess: () => {
                    setDeletingAgent(null);
                }
            });
        }
    };

    const handleCloseSheet = () => {
        setIsAddSheetOpen(false);
        setEditingAgent(null);
    };

    return (
        <div className="flex flex-col h-screen bg-white p-8 space-y-8 overflow-hidden">
            {/* Header Section - Rigid */}
            <div className="flex-shrink-0 flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-[300px]">
                        <Input
                            placeholder="Search for agent"
                            className="pr-10 pl-4 h-10 text-sm placeholder:text-gray-400 border-gray-200 rounded-full focus-visible:ring-0 focus-visible:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-6 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full font-medium transition-colors disabled:opacity-50"
                        >
                            {isSyncing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-5 w-5" />
                            )}
                            {isSyncing ? 'Syncing...' : 'Sync with Property Finder'}
                        </button>
                        <button
                            onClick={() => setIsAddSheetOpen(true)}
                            className="flex items-center gap-2 px-6 h-10 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] rounded-full font-medium transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Add new agent
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'all'
                            ? 'text-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'active'
                            ? 'text-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active
                        {activeTab === 'active' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('inactive')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'inactive'
                            ? 'text-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Deactive
                        {activeTab === 'inactive' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Agent List - Flexible Scrollable Area */}
            <div className="flex-1 min-h-0">
                <AgentList
                    search={searchQuery}
                    filterStatus={activeTab === 'all' ? undefined : activeTab === 'active'}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Add/Edit Agent Sheet */}
            <AddAgentSheet
                isOpen={isAddSheetOpen}
                onClose={handleCloseSheet}
                agent={editingAgent}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingAgent} onOpenChange={() => setDeletingAgent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the agent
                            from the CRM and deactivate their account in Property Finder.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
